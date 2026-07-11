// VENDORED from @dusansimic/srbijavoz-sdk. See ./types.ts header.
import {
  parseBoard,
  parseDirectResults,
  parseStations,
  parseTrainDetails,
} from "./parse";
import {
  type BoardEntry,
  type DirectTrain,
  type Lang,
  type SearchDirectParams,
  SrbijaVozError,
  type SrbijaVozOptions,
  type Station,
  type StationBoardParams,
  type StationInput,
  type TrainDetails,
  type TrainDetailsRef,
} from "./types";
import { nameSegment, toApiDate, toStationCode, toUrlDate, toUrlTime } from "./util";

export const DEFAULT_BASE_URL = "https://w3.srbvoz.rs/redvoznje";

/**
 * The site returns 404 to non-browser user agents, so a browser-like UA is
 * mandatory. See notes/architecture.md "Quirks and gotchas".
 */
export const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (compatible; srbijavoz-sdk; +https://github.com/dusansimic/srbijavoz-sdk)";

function stationCode(s: StationInput): string {
  return typeof s === "string" ? toStationCode(s) : s.code;
}

function stationName(s: StationInput): string {
  return typeof s === "string" ? s : s.name;
}

/** Client for the Srbija Voz timetable site (`w3.srbvoz.rs/redvoznje`). */
export class SrbijaVoz {
  private readonly baseUrl: string;
  private readonly userAgent: string;
  private readonly fetchImpl: typeof fetch;
  private readonly lang: Lang;

  constructor(options: SrbijaVozOptions = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
    this.fetchImpl = options.fetch ?? fetch;
    this.lang = options.lang ?? "sr";
  }

  private async request(path: string): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    let res: Response;
    try {
      res = await this.fetchImpl(url, {
        headers: { "User-Agent": this.userAgent, Accept: "*/*" },
      });
    } catch (err) {
      throw new SrbijaVozError(`Request failed: ${(err as Error).message}`, url);
    }
    if (!res.ok) {
      throw new SrbijaVozError(`HTTP ${res.status} from upstream`, url, res.status);
    }
    return res;
  }

  /**
   * Search stations by name prefix/fragment (diacritic-aware upstream).
   * @example (await sv.searchStations("beog"))[0] // { code: "16052", name: "BEOGRAD CENTAR" }
   */
  async searchStations(term: string): Promise<Station[]> {
    const res = await this.request(`/api/stanica/?term=${encodeURIComponent(term)}`);
    return parseStations(await res.json());
  }

  /** Full station directory (~396 entries). Static data — cache it. */
  async getStations(): Promise<Station[]> {
    return this.searchStations("");
  }

  /** Direct trains between two stations on a date. Empty array = no direct trains. */
  async searchDirect(params: SearchDirectParams): Promise<DirectTrain[]> {
    const path =
      `/direktni/${nameSegment(stationName(params.from))}/${stationCode(params.from)}` +
      `/${nameSegment(stationName(params.to))}/${stationCode(params.to)}` +
      `/${toUrlDate(params.date)}/${toUrlTime(params.time)}/${this.lang}`;
    const res = await this.request(path);
    return parseDirectResults(await res.text(), res.url);
  }

  /** Departure or arrival board for a station on a date. */
  async getStationBoard(params: StationBoardParams): Promise<BoardEntry[]> {
    const poldol = params.type === "arrivals" ? "dolazak" : "polazak";
    const path =
      `/stanicni/${nameSegment(stationName(params.station))}/${stationCode(params.station)}` +
      `/${toUrlDate(params.date)}/${toUrlTime(params.time)}/${poldol}/999/${this.lang}`;
    const res = await this.request(path);
    return parseBoard(await res.text(), res.url);
  }

  /**
   * Full details (stop list, delay, prices) for a train from search results.
   * Pass a `detailsRef` unchanged — its `toCode` is what the upstream API
   * expects, which is not always your search destination.
   */
  async getTrainDetails(ref: TrainDetailsRef): Promise<TrainDetails> {
    const qs = new URLSearchParams({
      idvoza: ref.trainId,
      brojvoza: ref.trainNumber,
      datum: toApiDate(ref.date),
      stanicaod: ref.fromCode,
      stanicado: ref.toCode,
    });
    const res = await this.request(`/api/vozdetalji1?${qs}`);
    return parseTrainDetails(await res.json(), res.url);
  }
}
