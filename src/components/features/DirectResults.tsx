import { toEpoch } from "@/lib/datetime";
import type { DirectTrain } from "@/lib/types";
import { DirectTrainCard } from "./DirectTrainCard";

export function DirectResults({
  trains,
  now,
  showAll,
}: {
  trains: DirectTrain[];
  /** Epoch ms to compare against; non-null only when the query date is today. */
  now: number | null;
  /** When true, keep departed trains visible even for today. */
  showAll: boolean;
}) {
  const visible =
    now !== null && !showAll
      ? trains.filter((train) => toEpoch(train.arrivalDate, train.arrivalTime) > now)
      : trains;

  return (
    <div className="space-y-2">
      {visible.map((train) => {
        const inProgress =
          now !== null &&
          toEpoch(train.departureDate, train.departureTime) <= now &&
          now < toEpoch(train.arrivalDate, train.arrivalTime);
        return (
          <DirectTrainCard
            key={`${train.trainNumber}-${train.departureTime}`}
            train={train}
            inProgress={inProgress}
          />
        );
      })}
    </div>
  );
}
