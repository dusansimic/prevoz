// VENDORED from @dusansimic/srbijavoz-sdk (https://github.com/dusansimic/srbijavoz-sdk).
// Kept local because the published package lives on GitHub Packages and the CI
// token lacks `read:packages`. To switch to the published package: install
// `@dusansimic/srbijavoz-sdk`, delete this folder, and update imports in
// `src/lib/sdk.ts`. See AGENTS.md § SDK.

/** A railway station known to the timetable system. */
export interface Station {
  /** Stable 5-character zero-padded station code (e.g. `"16052"`). Opaque string ID. */
  code: string;
  /** Display name, Serbian Latin with diacritics (e.g. `"BEOGRAD CENTAR"`). */
  name: string;
}

/** Reference needed to fetch full details for a train found in search results. */
export interface TrainDetailsRef {
  /** Internal train ID (`data-idvoza`). */
  trainId: string;
  /** Public train number (`data-brojvoza`). */
  trainNumber: string;
  /** Travel date in ISO `YYYY-MM-DD`. */
  date: string;
  /** Station code the relation starts from (`data-stod`). */
  fromCode: string;
  /**
   * Station code the details API expects as destination (`data-stdo`).
   * On station boards this is the train's terminus, not your search input —
   * pass it through unchanged.
   */
  toCode: string;
}

/** One direct connection returned by {@link SrbijaVoz.searchDirect}. */
export interface DirectTrain {
  trainNumber: string;
  /** `HH:mm` */
  departureTime: string;
  /** ISO `YYYY-MM-DD` */
  departureDate: string;
  /** `HH:mm` */
  arrivalTime: string;
  /** ISO `YYYY-MM-DD` */
  arrivalDate: string;
  /** Total travel time as `HH:mm`. */
  duration: string;
  /** Delay text as published (empty string when none / not tracked). */
  delay: string;
  /** Train category, e.g. `"REGIO VOZ"` (from the rank image title). */
  rank: string;
  /** Soko high-speed train. Not distinguishable from the `rank` title (also
   * `"INTER CITY"`); detected from the rank image (`soko.svg`). */
  soko: boolean;
  /** Offer labels, e.g. `["Prvi razred", "Drugi razred", "Bicikla - Ograničen broj mesta"]`. */
  offers: string[];
  /** Free-form remark (empty string when none). */
  note: string;
  /** Pass to {@link SrbijaVoz.getTrainDetails} for the full stop list. */
  detailsRef: TrainDetailsRef;
}

/** One row of a station departure/arrival board. */
export interface BoardEntry {
  trainNumber: string;
  /** Time at the queried station, `HH:mm`. */
  time: string;
  /** The other end of the run (terminus for departures, origin for arrivals). */
  otherStationName: string;
  /** Time at the other end, `HH:mm`. */
  otherTime: string;
  delay: string;
  rank: string;
  /** Soko high-speed train (detected from the rank image, `soko.svg`). */
  soko: boolean;
  offers: string[];
  note: string;
  detailsRef: TrainDetailsRef;
}

/** A stop on a train's route. */
export interface TrainStop {
  /** Station code, normalized to zero-padded string. */
  code: string;
  name: string;
  /** Arrival time `HH:mm` (equals departure at origin). */
  arrival: string;
  /** Departure time `HH:mm` (equals arrival at terminus). */
  departure: string;
  /** 1-based position on the route. */
  sequence: number;
  /** Minutes of travel from the previous stop (0 at origin). */
  travelMinutes: number;
  /** True when this stop lies on the from→to segment that was queried. */
  inQueriedSegment: boolean;
}

/** Full train details from the `vozdetalji1` API. */
export interface TrainDetails {
  trainNumber: string;
  /** Numeric train ID. */
  trainId: number;
  /** Delay text (empty when none). */
  delay: string;
  /** True when the train is currently running (live tracking active). */
  active: boolean;
  /** Category code as string, e.g. `"5"` = BG Voz commuter, `"6"` = REGIO. */
  rank: string;
  /** Raw offer flag string, e.g. `"ABvIW"`. */
  offerFlags: string;
  /** Bicycle transport offered (`v` flag). */
  bicycle: boolean;
  /** Seat reservation offered (`r` flag). */
  reservation: boolean;
  /** Total run time in minutes. */
  totalMinutes: number;
  /** First-class price in RSD for the queried relation, when published. */
  firstClassPrice?: number;
  /** Second-class price in RSD for the queried relation, when published. */
  secondClassPrice?: number;
  /** Ordered stop list. */
  stops: TrainStop[];
}

/** Language for result-page labels; data content is identical. */
export type Lang = "sr" | "en";

export interface SrbijaVozOptions {
  /** Override the upstream base URL. Default `https://w3.srbvoz.rs/redvoznje`. */
  baseUrl?: string;
  /** User-Agent header. The site rejects requests without a browser-like UA. */
  userAgent?: string;
  /** Custom fetch implementation (proxying, testing). Default: global fetch. */
  fetch?: typeof fetch;
  /** Result-page language. Default `"sr"`. */
  lang?: Lang;
}

/** A station argument: a {@link Station} or a bare station code string. */
export type StationInput = Station | string;

export interface SearchDirectParams {
  from: StationInput;
  to: StationInput;
  /** Travel date: `Date` or ISO `YYYY-MM-DD`. */
  date: Date | string;
  /** Earliest departure, `"HH:mm"` or `"HHmm"`. Default `"00:00"` (whole day). */
  time?: string;
}

export interface StationBoardParams {
  station: StationInput;
  /** Board date: `Date` or ISO `YYYY-MM-DD`. */
  date: Date | string;
  /** Earliest time, `"HH:mm"` or `"HHmm"`. Default `"00:00"`. */
  time?: string;
  /** `departures` (polazak) or `arrivals` (dolazak). Default `departures`. */
  type?: "departures" | "arrivals";
}

/** Network or HTTP-level failure talking to the upstream site. */
export class SrbijaVozError extends Error {
  constructor(
    message: string,
    /** Request URL that failed. */
    public readonly url: string,
    /** HTTP status when the server responded. */
    public readonly status?: number,
  ) {
    super(message);
    this.name = "SrbijaVozError";
  }
}

/** The upstream HTML no longer matches the expected template. */
export class ParseError extends SrbijaVozError {
  constructor(message: string, url: string) {
    super(message, url);
    this.name = "ParseError";
  }
}
