// VENDORED from @dusansimic/srbijavoz-sdk. See ./types.ts header.
import {
  type BoardEntry,
  type DirectTrain,
  ParseError,
  type Station,
  type TrainDetails,
  type TrainDetailsRef,
  type TrainStop,
} from "./types";
import { clean, fromUpstreamDate, toStationCode } from "./util";

/** Upstream station JSON shape (`/api/stanica`). */
interface RawStation {
  naziv: string;
  sifra: string;
}

/** Upstream stop shape inside `vozdetalji1`. */
interface RawStop {
  NAZIV: string;
  DOLAZAK: string;
  POLAZAK: string;
  RBSTANICE: number;
  Osenci: number;
  Sifra: number | string;
  vremevoznje: number;
}

/** Upstream `vozdetalji1` payload (single-element array). */
interface RawTrainDetails {
  IDVOZA: number;
  BROJVOZA: string;
  KASNI: string;
  AKTIVANVOZ: number;
  ukvrvoznje: number;
  RANG: string;
  PONUDA: string;
  cena1?: number | null;
  cena2?: number | null;
  stanicavoza: RawStop[];
}

export function parseStations(raw: RawStation[]): Station[] {
  return raw.map((s) => ({ code: toStationCode(s.sifra), name: clean(s.naziv) }));
}

export function parseTrainDetails(raw: RawTrainDetails[], url: string): TrainDetails {
  const d = raw[0];
  if (!d || !Array.isArray(d.stanicavoza)) {
    throw new ParseError("Unexpected vozdetalji1 payload shape", url);
  }
  const offerFlags = clean(d.PONUDA);
  const stops: TrainStop[] = d.stanicavoza.map((s) => ({
    code: toStationCode(s.Sifra),
    name: clean(s.NAZIV),
    arrival: clean(s.DOLAZAK),
    departure: clean(s.POLAZAK),
    sequence: s.RBSTANICE,
    travelMinutes: s.vremevoznje,
    inQueriedSegment: s.Osenci === 1,
  }));
  return {
    trainNumber: clean(d.BROJVOZA),
    trainId: d.IDVOZA,
    delay: clean(d.KASNI),
    active: d.AKTIVANVOZ === 1,
    rank: clean(d.RANG),
    offerFlags,
    bicycle: offerFlags.includes("v"),
    reservation: offerFlags.includes("r"),
    totalMinutes: d.ukvrvoznje,
    firstClassPrice: d.cena1 ?? undefined,
    secondClassPrice: d.cena2 ?? undefined,
    stops,
  };
}

/* ------------------------------------------------------------------ */
/* HTML parsing — regex extraction over the stable ASP.NET MVC views.  */
/* See notes/plan.md "HTML parsing strategy".                          */
/* ------------------------------------------------------------------ */

/** Strip tags and decode the handful of entities the templates emit. */
function textContent(html: string): string {
  return clean(
    html
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " "),
  );
}

/** All `title="…"` values of `<img>` tags in a cell (rank/offer columns). */
function imgTitles(html: string): string[] {
  return [...html.matchAll(/<img[^>]*\btitle="([^"]*)"/gi)].map((m) => clean(m[1]!));
}

/** `<td>` contents of a row, in document order. */
function cells(rowHtml: string): string[] {
  return [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => m[1]!);
}

function parseDetailsButton(rowHtml: string, url: string): TrainDetailsRef {
  const btn = /<button[^>]*class="dajdetalje"[^>]*>/i.exec(rowHtml)?.[0];
  if (!btn) throw new ParseError("Result row without dajdetalje button", url);
  const attr = (name: string): string =>
    clean(new RegExp(`data-${name}="([^"]*)"`, "i").exec(btn)?.[1]);
  return {
    trainId: attr("idvoza"),
    trainNumber: attr("brojvoza"),
    date: fromUpstreamDate(attr("datum")),
    fromCode: attr("stod"),
    toCode: attr("stdo"),
  };
}

/**
 * Slice the results container out of a page and split it into `tr.tsmall`
 * data rows (skipping the header row and the duplicated `tr.tbig` rows).
 * Returns `null` when the page carries the "no trains" marker.
 */
function resultRows(html: string, url: string): string[] | null {
  const start = html.indexOf('id="rezultati"');
  if (start === -1) throw new ParseError('Missing <div id="rezultati"> container', url);
  const container = html.slice(start);
  if (/Nema vozova|No trains/i.test(container)) return null;
  const chunks = container.split(/<tr class="tsmall">/i).slice(1);
  return chunks
    .map((c) => c.split(/<tr class="tbig">/i)[0]!)
    .filter((c) => /dajdetalje/i.test(c));
}

export function parseDirectResults(html: string, url: string): DirectTrain[] {
  const rows = resultRows(html, url);
  if (rows === null) return [];
  return rows.map((row) => {
    const td = cells(row);
    if (td.length < 11)
      throw new ParseError(`Direct row has ${td.length} cells, expected 11`, url);
    return {
      trainNumber: textContent(td[0]!),
      departureTime: textContent(td[1]!),
      departureDate: fromUpstreamDate(textContent(td[2]!)),
      arrivalTime: textContent(td[3]!),
      arrivalDate: fromUpstreamDate(textContent(td[4]!)),
      delay: textContent(td[5]!),
      duration: textContent(td[6]!),
      rank: imgTitles(td[7]!).join(", "),
      offers: imgTitles(td[8]!),
      note: textContent(td[9]!),
      detailsRef: parseDetailsButton(row, url),
    };
  });
}

export function parseBoard(html: string, url: string): BoardEntry[] {
  const rows = resultRows(html, url);
  if (rows === null) return [];
  return rows.map((row) => {
    const td = cells(row);
    if (td.length < 9)
      throw new ParseError(`Board row has ${td.length} cells, expected 9`, url);
    return {
      trainNumber: textContent(td[0]!),
      time: textContent(td[1]!),
      otherStationName: textContent(td[2]!),
      otherTime: textContent(td[3]!),
      rank: imgTitles(td[4]!).join(", "),
      offers: imgTitles(td[5]!),
      delay: textContent(td[6]!),
      note: textContent(td[7]!),
      detailsRef: parseDetailsButton(row, url),
    };
  });
}
