import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { DirectTrain } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TrainDetailsPanel } from "./TrainDetailsPanel";

/** A direct connection, expandable to its full stop list. */
export function DirectTrainCard({
  train,
  inProgress = false,
}: {
  train: DirectTrain;
  /** Train has departed but not yet arrived; marked with a burgundy accent. */
  inProgress?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card className={cn("overflow-hidden", inProgress && "border-l-4 border-l-running")}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-accent/40"
      >
        <div className="flex w-14 shrink-0 flex-col tabular-nums">
          <span className="font-semibold">{train.departureTime}</span>
          <span className="text-sm text-muted-foreground">{train.arrivalTime}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">Voz {train.trainNumber}</span>
            {train.rank && (
              <Badge variant="secondary" className="font-normal">
                {train.rank}
              </Badge>
            )}
            {inProgress && (
              <Badge variant="running" className="font-normal">
                U toku
              </Badge>
            )}
          </div>
          {train.offers.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {train.offers.map((offer) => (
                <Badge key={offer} variant="muted" className="font-normal">
                  {offer}
                </Badge>
              ))}
            </div>
          )}
          {train.note && (
            <p className="mt-1 text-sm text-muted-foreground">{train.note}</p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <div className="text-sm font-medium tabular-nums">{train.duration}</div>
          {train.delay && <div className="text-xs text-destructive">+{train.delay}</div>}
        </div>

        <ChevronDown
          className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && <TrainDetailsPanel detailsRef={train.detailsRef} />}
    </Card>
  );
}
