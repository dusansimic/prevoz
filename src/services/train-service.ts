// Thin wrapper over the SrbijaVoz SDK: station directory caching, Belgrade-aware
// ordering, direct search, one-transfer planning, and train details. UI code
// talks to this module rather than the SDK directly (AGENTS.md § Features).

import { fetchEkartaTrains } from "@/lib/ekarta";
import { sv } from "@/lib/sdk";
import { planOneTransfer, type TransferSearchOptions } from "@/lib/transfers";
import type { DirectTrain, Station, TrainDetails, TrainDetailsRef } from "@/lib/types";
import { foldText } from "@/lib/utils";

/** True for Belgrade-area stations (names all start with `BEOGRAD …`). */
export function isBelgradeStation(station: Station): boolean {
  return station.name.trim().toUpperCase().startsWith("BEOGRAD");
}

/** Belgrade stations first, then the rest — each group alphabetical. */
function belgradeFirst(stations: Station[]): Station[] {
  return [...stations].sort((a, b) => {
    const ab = isBelgradeStation(a);
    const bb = isBelgradeStation(b);
    if (ab !== bb) return ab ? -1 : 1;
    return a.name.localeCompare(b.name, "sr");
  });
}

let stationsPromise: Promise<Station[]> | null = null;

/** Full station directory (~396), fetched once and cached for the session. */
export function getStations(): Promise<Station[]> {
  if (!stationsPromise) {
    stationsPromise = sv.getStations().catch((err) => {
      stationsPromise = null; // allow retry after a failure
      throw err;
    });
  }
  return stationsPromise;
}

export interface FilterOptions {
  /** Rank Belgrade stations first (default). Used for the origin selector. */
  belgradeFirst?: boolean;
  /** Cap on returned matches. Default 50. */
  limit?: number;
}

/** Accent-insensitive local filter over the cached station directory. */
export async function filterStations(
  term: string,
  options: FilterOptions = {},
): Promise<Station[]> {
  const { belgradeFirst: bgFirst = true, limit = 50 } = options;
  const all = await getStations();
  const ordered = bgFirst ? belgradeFirst(all) : all;
  const needle = foldText(term);
  const matches = needle
    ? ordered.filter((s) => foldText(s.name).includes(needle))
    : ordered;
  return matches.slice(0, limit);
}

/** Direct trains between two stations on an ISO date. */
export function searchDirect(
  from: Station,
  to: Station,
  dateIso: string,
): Promise<DirectTrain[]> {
  return sv.searchDirect({ from, to, date: dateIso });
}

/** Full stop list / prices for a train from search results. */
export function getTrainDetails(ref: TrainDetailsRef): Promise<TrainDetails> {
  return sv.getTrainDetails(ref);
}

// e-karta ticket-shop offers, keyed `from|to|dateIso`. The inner promise
// resolves to a `trainNumber → priceRSD` map for the relation; all cards for one
// relation share a single request. Mirrors the `stationsPromise` idiom above.
const ekartaOffers = new Map<string, Promise<Map<string, number>>>();

/**
 * For a relation + date, a `trainNumber → price (RSD)` map of trains sold online
 * (1 passenger, 2nd class). A train missing from the map is not sold online.
 * Fail-soft: on any error the entry is dropped (so a later render can retry) and
 * an empty map is returned — the shop is enrichment, never blocking.
 */
export function getEkartaOffers(
  fromCode: string,
  toCode: string,
  dateIso: string,
): Promise<Map<string, number>> {
  const key = `${fromCode}|${toCode}|${dateIso}`;
  let promise = ekartaOffers.get(key);
  if (!promise) {
    promise = fetchEkartaTrains(fromCode, toCode, dateIso)
      .then((trains) => new Map(trains.map((t) => [String(t.brvoz), t.cenau])))
      .catch(() => {
        ekartaOffers.delete(key); // allow retry after a failure
        return new Map<string, number>();
      });
    ekartaOffers.set(key, promise);
  }
  return promise;
}

/**
 * Plan one-transfer journeys. Transfer candidates are always Belgrade stations
 * — the practical set of change points on the network.
 */
export async function planTransfers(
  from: Station,
  to: Station,
  dateIso: string,
  options: TransferSearchOptions = {},
) {
  const all = await getStations();
  const candidates = belgradeFirst(all).filter(isBelgradeStation);
  return planOneTransfer(from, to, dateIso, candidates, options);
}
