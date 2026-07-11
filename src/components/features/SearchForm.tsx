import { ArrowRightLeft, Search } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { SearchInput } from "@/hooks/use-train-search";
import { todayIso } from "@/lib/datetime";
import type { Station } from "@/lib/types";
import { StationCombobox } from "./StationCombobox";

interface SearchFormProps {
  stations: Station[];
  stationsLoading: boolean;
  busy: boolean;
  onSearch: (input: SearchInput) => void;
}

export function SearchForm({
  stations,
  stationsLoading,
  busy,
  onSearch,
}: SearchFormProps) {
  const [from, setFrom] = useState<Station | null>(null);
  const [to, setTo] = useState<Station | null>(null);
  const [dateIso, setDateIso] = useState<string>(todayIso());
  const [withTransfers, setWithTransfers] = useState(false);
  const [searchAll, setSearchAll] = useState(false);

  const sameStation = from !== null && from.code === to?.code;
  const canSearch = from !== null && to !== null && !sameStation;

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!from || !to || !canSearch) return;
    onSearch({
      from,
      to,
      dateIso,
      withTransfers,
      transferScope: searchAll ? "all" : "belgrade",
    });
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="from">Polazna stanica</Label>
              <StationCombobox
                id="from"
                stations={stations}
                value={from}
                onChange={setFrom}
                loading={stationsLoading}
                placeholder="Npr. Beograd Centar…"
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={swap}
              aria-label="Zameni stanice"
              className="hidden sm:inline-flex"
            >
              <ArrowRightLeft />
            </Button>

            <div className="space-y-1.5">
              <Label htmlFor="to">Odredišna stanica</Label>
              <StationCombobox
                id="to"
                stations={stations}
                value={to}
                onChange={setTo}
                loading={stationsLoading}
                placeholder="Bilo koja stanica…"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="date">Datum</Label>
              <Input
                id="date"
                type="date"
                value={dateIso}
                min={todayIso()}
                onChange={(event) => setDateIso(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-lg bg-muted/50 p-3">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="transfers" className="cursor-pointer">
                Traži i putovanja sa jednim presedanjem
              </Label>
              <Switch
                id="transfers"
                checked={withTransfers}
                onCheckedChange={setWithTransfers}
              />
            </div>
            {withTransfers && (
              <div className="flex items-center justify-between gap-3">
                <Label
                  htmlFor="all-stations"
                  className="cursor-pointer text-muted-foreground"
                >
                  Presedanje na svim stanicama (sporije, podrazumevano samo beogradske)
                </Label>
                <Switch
                  id="all-stations"
                  checked={searchAll}
                  onCheckedChange={setSearchAll}
                />
              </div>
            )}
          </div>

          {sameStation && (
            <p className="text-sm text-destructive">
              Polazna i odredišna stanica ne mogu biti iste.
            </p>
          )}

          <Button
            type="submit"
            disabled={!canSearch || busy}
            className="w-full sm:w-auto"
          >
            <Search />
            Pretraži vozove
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
