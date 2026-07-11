import type { TransferJourney } from "@/lib/types";
import { TransferJourneyCard } from "./TransferJourneyCard";

export function TransferResults({ journeys }: { journeys: TransferJourney[] }) {
  return (
    <div className="space-y-3">
      {journeys.map((journey) => (
        <TransferJourneyCard key={journey.id} journey={journey} />
      ))}
    </div>
  );
}
