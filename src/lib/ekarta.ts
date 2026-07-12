// Client for the Srbija Voz e-karta ticket shop API
// (`webapi1.srbvoz.rs/eKarta`) — a system separate from the timetable SDK. It
// exposes public, unauthenticated search that returns per-train price and
// availability, which we use to gate a "Kupi kartu" button and show a price.
//
// The shop shares the timetable site's networking constraints (no CORS, browser
// UA required), so calls go through the `/ekarta` proxy (vite.config.ts +
// worker/index.ts). Station codes and train numbers are identical to the
// timetable's: redvoznje `Station.code` === e-karta `sifra`, and redvoznje
// `trainNumber` === e-karta `brvoz`, so no mapping is needed.
//
// UI code must go through `train-service`, never import this module directly.

import { toEkartaDate } from "@/lib/datetime";

/** The shop home page. Prefilled deep links are impossible (see notes), so we
 * only ever open the plain home; the user re-enters the search there. */
export const EKARTA_SHOP_URL = "https://webapi1.srbvoz.rs/ekarta/app/#!/home";

// Where shop API requests are sent: the same-origin `/ekarta` proxy by default.
const EKARTA_API_BASE = import.meta.env.VITE_EKARTA_BASE ?? "/ekarta";

/** One train from `ListaVozova_Web` — the subset we use (plan 1). */
export interface EkartaTrain {
  /** Public train number; equals the timetable's `trainNumber`. */
  brvoz: number;
  /** Total price in RSD for the queried `brojputnika`/`razred`. */
  cenau: number;
  /** `"U"` domestic, `"M"` international. */
  vrsta_saobracaja: string;
}

/**
 * Direct trains sold online for a relation on a date, priced for 1 passenger in
 * 2nd class. Empty array = the relation is not sold online. Throws on a non-OK
 * response; callers (train-service) turn errors into "no offer".
 */
export async function fetchEkartaTrains(
  fromCode: string,
  toCode: string,
  dateIso: string,
): Promise<EkartaTrain[]> {
  const qs = new URLSearchParams({
    stanicaod: fromCode,
    stanicado: toCode,
    datum: toEkartaDate(dateIso),
    brojputnika: "1",
    razred: "2",
  });
  const res = await fetch(`${EKARTA_API_BASE}/api/listavozova/ListaVozova_Web?${qs}`);
  if (!res.ok) {
    throw new Error(`e-karta HTTP ${res.status}`);
  }
  return (await res.json()) as EkartaTrain[];
}
