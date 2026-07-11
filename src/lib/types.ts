// Domain types. SDK types are re-exported here so the rest of the app imports
// train/station shapes from a single place (AGENTS.md § TypeScript).
export type {
  BoardEntry,
  DirectTrain,
  Station,
  TrainDetails,
  TrainDetailsRef,
  TrainStop,
} from "@/lib/srbijavoz-sdk";

import type { DirectTrain, Station } from "@/lib/srbijavoz-sdk";

/** One train ride within a journey, tagged with its boarding/alighting stops. */
export interface JourneyLeg {
  train: DirectTrain;
  from: Station;
  to: Station;
}

/** A journey with exactly one transfer: two legs joined at a transfer station. */
export interface TransferJourney {
  /** Stable key for React lists (leg train numbers + departure). */
  id: string;
  /** Station where the traveller changes trains. */
  transfer: Station;
  legs: [JourneyLeg, JourneyLeg];
  departureTime: string;
  departureDate: string;
  arrivalTime: string;
  arrivalDate: string;
  /** Door-to-door duration in minutes. */
  totalMinutes: number;
  /** Layover at the transfer station in minutes. */
  waitMinutes: number;
}
