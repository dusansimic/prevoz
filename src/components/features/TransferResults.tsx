import { toEpoch } from "@/lib/datetime";
import type { TransferJourney } from "@/lib/types";
import { TransferJourneyCard } from "./TransferJourneyCard";

export function TransferResults({
  journeys,
  now,
  showAll,
}: {
  journeys: TransferJourney[];
  /** Epoch ms to compare against; non-null only when the query date is today. */
  now: number | null;
  /** When true, keep departed journeys visible even for today. */
  showAll: boolean;
}) {
  const visible =
    now !== null && !showAll
      ? journeys.filter(
          (journey) => toEpoch(journey.arrivalDate, journey.arrivalTime) > now,
        )
      : journeys;

  return (
    <div className="space-y-3">
      {visible.map((journey) => {
        const inProgress =
          now !== null &&
          toEpoch(journey.departureDate, journey.departureTime) <= now &&
          now < toEpoch(journey.arrivalDate, journey.arrivalTime);
        return (
          <TransferJourneyCard
            key={journey.id}
            journey={journey}
            inProgress={inProgress}
          />
        );
      })}
    </div>
  );
}
