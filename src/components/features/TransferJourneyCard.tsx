import { ArrowRight, ChevronDown, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatMinutes } from "@/lib/datetime";
import type { JourneyLeg, TransferJourney } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TrainDetailsPanel } from "./TrainDetailsPanel";

function LegRow({ leg }: { leg: JourneyLeg }) {
  const [open, setOpen] = useState(false);
  const { train } = leg;

  return (
    <div className="rounded-md border border-border">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-accent/40"
      >
        <span className="w-12 shrink-0 font-semibold tabular-nums">
          {train.departureTime}
        </span>
        <span className="min-w-0 flex-1 truncate">
          {leg.from.name} <ArrowRight className="inline size-3" /> {leg.to.name}
        </span>
        <span className="shrink-0 text-muted-foreground">Voz {train.trainNumber}</span>
        <span className="w-12 shrink-0 text-right font-semibold tabular-nums">
          {train.arrivalTime}
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && <TrainDetailsPanel detailsRef={train.detailsRef} />}
    </div>
  );
}

/** A one-transfer journey: two legs joined by a layover at the transfer station. */
export function TransferJourneyCard({ journey }: { journey: TransferJourney }) {
  const [first, second] = journey.legs;

  return (
    <Card className="space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-lg font-semibold tabular-nums">
          <span>{journey.departureTime}</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span>{journey.arrivalTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-normal">
            {formatMinutes(journey.totalMinutes)}
          </Badge>
          <Badge variant="muted" className="font-normal">
            <RefreshCw className="mr-1 size-3" />
            Presedanje: {journey.transfer.name}
          </Badge>
        </div>
      </div>

      <div className="space-y-1.5">
        <LegRow leg={first} />
        <div className="flex items-center gap-2 pl-3 text-xs text-muted-foreground">
          <RefreshCw className="size-3" />
          Čekanje {formatMinutes(journey.waitMinutes)} u {journey.transfer.name}
        </div>
        <LegRow leg={second} />
      </div>
    </Card>
  );
}
