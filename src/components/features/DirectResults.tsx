import type { DirectTrain } from "@/lib/types";
import { DirectTrainCard } from "./DirectTrainCard";

export function DirectResults({ trains }: { trains: DirectTrain[] }) {
  return (
    <div className="space-y-2">
      {trains.map((train) => (
        <DirectTrainCard
          key={`${train.trainNumber}-${train.departureTime}`}
          train={train}
        />
      ))}
    </div>
  );
}
