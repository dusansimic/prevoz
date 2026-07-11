import { TrainFront } from "lucide-react";
import { type ReactNode, useState } from "react";
import { DirectResults } from "@/components/features/DirectResults";
import { SearchForm } from "@/components/features/SearchForm";
import { TransferResults } from "@/components/features/TransferResults";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useStations } from "@/hooks/use-stations";
import { type SearchState, useTrainSearch } from "@/hooks/use-train-search";
import { todayIso } from "@/lib/datetime";

function ResultSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 text-lg font-semibold">{children}</h2>;
}

function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <Card className="px-4 py-6 text-center text-sm text-muted-foreground">
      {children}
    </Card>
  );
}

function Results({
  state,
  showAll,
  onShowAllChange,
}: {
  state: SearchState;
  showAll: boolean;
  onShowAllChange: (value: boolean) => void;
}) {
  if (!state.query) {
    return (
      <Card className="flex flex-col items-center gap-2 px-4 py-12 text-center text-muted-foreground">
        <TrainFront className="size-8" />
        <p>Izaberi polaznu i odredišnu stanicu pa pokreni pretragu.</p>
      </Card>
    );
  }

  const loadingDirect = state.status === "searching" && !state.planningTransfers;
  const isToday = state.query.dateIso === todayIso();
  // Non-null only for today; drives filtering of departed trains and the
  // in-progress (burgundy) marking. Computed once per render.
  const now = isToday ? Date.now() : null;

  return (
    <div className="space-y-8">
      {state.status === "error" && (
        <EmptyNote>
          <span className="text-destructive">Greška: {state.error}</span>
        </EmptyNote>
      )}

      {isToday && (
        <div className="flex items-center gap-2">
          <Switch id="show-all" checked={showAll} onCheckedChange={onShowAllChange} />
          <Label htmlFor="show-all">Prikaži sve</Label>
        </div>
      )}

      <section>
        <SectionTitle>Direktni vozovi</SectionTitle>
        {loadingDirect ? (
          <ResultSkeleton />
        ) : state.direct.length > 0 ? (
          <DirectResults trains={state.direct} now={now} showAll={showAll} />
        ) : (
          <EmptyNote>Nema direktnih vozova za izabranu relaciju i datum.</EmptyNote>
        )}
      </section>

      {state.requestedTransfers && (
        <section>
          <SectionTitle>Sa jednim presedanjem</SectionTitle>
          {state.planningTransfers ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Tražim veze
                {state.progress
                  ? ` (${state.progress.done}/${state.progress.total} stanica)`
                  : "…"}
              </p>
              <ResultSkeleton />
            </div>
          ) : state.transfers.length > 0 ? (
            <TransferResults journeys={state.transfers} now={now} showAll={showAll} />
          ) : (
            <EmptyNote>Nije pronađeno putovanje sa jednim presedanjem.</EmptyNote>
          )}
        </section>
      )}
    </div>
  );
}

export function SearchPage() {
  const { stations, loading, error } = useStations();
  const { state, search } = useTrainSearch();
  const [showAll, setShowAll] = useState(false);
  const busy = state.status === "searching";

  return (
    <div className="space-y-8">
      <SearchForm
        stations={stations}
        stationsLoading={loading}
        busy={busy}
        onSearch={(input) => {
          setShowAll(false);
          search(input);
        }}
      />
      {error && (
        <p className="text-sm text-destructive">Neuspešno učitavanje stanica: {error}</p>
      )}
      <Results state={state} showAll={showAll} onShowAllChange={setShowAll} />
    </div>
  );
}
