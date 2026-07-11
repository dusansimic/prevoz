import { diffMinutes, toEpoch } from "@/lib/datetime";
import { sv } from "@/lib/sdk";
import type { DirectTrain, Station, TransferJourney } from "@/lib/types";

export interface TransferSearchOptions {
  /** Minimum minutes needed to change trains. Default 10. */
  minTransferMinutes?: number;
  /** Skip connections with a layover longer than this. Default 240 (4 h). */
  maxTransferMinutes?: number;
  /** Cap on returned journeys after sorting. Default 15. */
  maxJourneys?: number;
  /** Concurrent upstream searches. Default 4 (be gentle on the site). */
  concurrency?: number;
  /** Called after each candidate station is checked. */
  onProgress?: (done: number, total: number) => void;
  /** Abort an in-flight plan (e.g. the user starts a new search). */
  signal?: AbortSignal;
}

/**
 * Find one-transfer journeys `from → transfer → to` on `dateIso`.
 *
 * `candidates` is the ordered list of transfer stations to try — the caller
 * puts Belgrade stations first, then everything else (see train-service). For
 * each candidate the planner queries direct trains on both legs and pairs each
 * first leg with the earliest second leg that leaves after a valid layover.
 */
export async function planOneTransfer(
  from: Station,
  to: Station,
  dateIso: string,
  candidates: Station[],
  options: TransferSearchOptions = {},
): Promise<TransferJourney[]> {
  const {
    minTransferMinutes = 10,
    maxTransferMinutes = 240,
    maxJourneys = 15,
    concurrency = 4,
    onProgress,
    signal,
  } = options;

  const excluded = new Set([from.code, to.code]);
  const seen = new Set<string>();
  const stations = candidates.filter((s) => {
    if (excluded.has(s.code) || seen.has(s.code)) return false;
    seen.add(s.code);
    return true;
  });

  let done = 0;
  const perStation = await mapPool(stations, concurrency, async (transfer) => {
    if (signal?.aborted) return [];
    try {
      const leg1 = await sv.searchDirect({ from, to: transfer, date: dateIso });
      if (leg1.length === 0) return [];
      const leg2 = await sv.searchDirect({ from: transfer, to, date: dateIso });
      if (leg2.length === 0) return [];
      return buildJourneys(from, to, transfer, leg1, leg2, {
        minTransferMinutes,
        maxTransferMinutes,
      });
    } catch {
      // A single unreachable/parse-failing relation should not sink the plan.
      return [];
    } finally {
      done += 1;
      onProgress?.(done, stations.length);
    }
  });

  const journeys = new Map<string, TransferJourney>();
  for (const list of perStation) {
    for (const j of list) journeys.set(j.id, j);
  }

  return [...journeys.values()]
    .sort((a, b) => {
      const arr =
        toEpoch(a.arrivalDate, a.arrivalTime) - toEpoch(b.arrivalDate, b.arrivalTime);
      return arr !== 0 ? arr : a.totalMinutes - b.totalMinutes;
    })
    .slice(0, maxJourneys);
}

function buildJourneys(
  from: Station,
  to: Station,
  transfer: Station,
  leg1: DirectTrain[],
  leg2: DirectTrain[],
  bounds: { minTransferMinutes: number; maxTransferMinutes: number },
): TransferJourney[] {
  const out: TransferJourney[] = [];
  for (const first of leg1) {
    let best: DirectTrain | undefined;
    let bestWait = Number.POSITIVE_INFINITY;
    for (const second of leg2) {
      const wait = diffMinutes(
        first.arrivalDate,
        first.arrivalTime,
        second.departureDate,
        second.departureTime,
      );
      if (wait < bounds.minTransferMinutes || wait > bounds.maxTransferMinutes) continue;
      if (wait < bestWait) {
        bestWait = wait;
        best = second;
      }
    }
    if (!best) continue;

    const totalMinutes = diffMinutes(
      first.departureDate,
      first.departureTime,
      best.arrivalDate,
      best.arrivalTime,
    );
    out.push({
      id: `${transfer.code}:${first.trainNumber}@${first.departureTime}>${best.trainNumber}@${best.departureTime}`,
      transfer,
      legs: [
        { train: first, from, to: transfer },
        { train: best, from: transfer, to },
      ],
      departureTime: first.departureTime,
      departureDate: first.departureDate,
      arrivalTime: best.arrivalTime,
      arrivalDate: best.arrivalDate,
      totalMinutes,
      waitMinutes: bestWait,
    });
  }
  return out;
}

/** Run `fn` over `items` with at most `limit` promises in flight. */
async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  async function worker(): Promise<void> {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]!);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}
