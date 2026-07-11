import { Bike, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { TrainDetails, TrainDetailsRef } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getTrainDetails } from "@/services/train-service";

interface DetailsState {
  loading: boolean;
  error: string | null;
  data: TrainDetails | null;
}

/** Lazily loads and renders a train's full stop list, prices and delay. */
export function TrainDetailsPanel({ detailsRef }: { detailsRef: TrainDetailsRef }) {
  const [state, setState] = useState<DetailsState>({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    let active = true;
    setState({ loading: true, error: null, data: null });
    getTrainDetails(detailsRef)
      .then((data) => {
        if (active) setState({ loading: false, error: null, data });
      })
      .catch((err: unknown) => {
        if (active) {
          setState({
            loading: false,
            error: err instanceof Error ? err.message : "Greška pri učitavanju",
            data: null,
          });
        }
      });
    return () => {
      active = false;
    };
  }, [detailsRef]);

  if (state.loading) {
    return (
      <div className="space-y-2 border-t border-border px-4 py-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (state.error || !state.data) {
    return (
      <div className="border-t border-border px-4 py-4 text-sm text-destructive">
        {state.error ?? "Nema detalja."}
      </div>
    );
  }

  const details = state.data;

  return (
    <div className="space-y-4 border-t border-border px-4 py-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {details.bicycle && (
          <Badge variant="muted">
            <Bike className="mr-1 size-3" /> Bicikl
          </Badge>
        )}
        {details.reservation && (
          <Badge variant="muted">
            <Ticket className="mr-1 size-3" /> Rezervacija
          </Badge>
        )}
        {details.secondClassPrice != null && (
          <span className="text-muted-foreground">
            2. razred:{" "}
            <span className="text-foreground">{details.secondClassPrice} RSD</span>
          </span>
        )}
        {details.firstClassPrice != null && (
          <span className="text-muted-foreground">
            1. razred:{" "}
            <span className="text-foreground">{details.firstClassPrice} RSD</span>
          </span>
        )}
        {details.delay && (
          <Badge variant="outline" className="text-destructive">
            Kašnjenje: {details.delay}
          </Badge>
        )}
      </div>

      <ol className="space-y-0">
        {details.stops.map((stop) => (
          <li
            key={`${stop.sequence}-${stop.code}`}
            className={cn(
              "grid grid-cols-[3rem_1fr_auto] items-center gap-3 border-l-2 py-1.5 pl-3 text-sm",
              stop.inQueriedSegment
                ? "border-primary"
                : "border-border text-muted-foreground",
            )}
          >
            <span className="tabular-nums text-muted-foreground">
              {stop.arrival || "—"}
            </span>
            <span className="truncate font-medium">{stop.name}</span>
            <span className="tabular-nums text-muted-foreground">
              {stop.departure || "—"}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
