import { ArrowLeft } from "lucide-react";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_MAX_LAYOVER_MINUTES,
  DEFAULT_MIN_TRANSFER_MINUTES,
  useSettingsStore,
} from "@/stores/settings";

export function SettingsPage() {
  const minTransferMinutes = useSettingsStore((s) => s.minTransferMinutes);
  const maxLayoverMinutes = useSettingsStore((s) => s.maxLayoverMinutes);
  const setMinTransferMinutes = useSettingsStore((s) => s.setMinTransferMinutes);
  const setMaxLayoverMinutes = useSettingsStore((s) => s.setMaxLayoverMinutes);
  const reset = useSettingsStore((s) => s.reset);

  const [minInput, setMinInput] = useState(String(minTransferMinutes));
  const [maxInput, setMaxInput] = useState(String(maxLayoverMinutes));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const min = Number(minInput);
    const max = Number(maxInput);

    if (!Number.isInteger(min) || min < 1) {
      setError("Minimalno vreme presedanja mora biti ceo broj veći od 0.");
      return;
    }
    if (!Number.isInteger(max) || max < min) {
      setError(
        "Maksimalno vreme presedanja mora biti ceo broj veći ili jednak minimumu.",
      );
      return;
    }

    setMinTransferMinutes(min);
    setMaxLayoverMinutes(max);
    setError(null);
    setSaved(true);
  }

  function handleReset() {
    reset();
    setMinInput(String(DEFAULT_MIN_TRANSFER_MINUTES));
    setMaxInput(String(DEFAULT_MAX_LAYOVER_MINUTES));
    setError(null);
    setSaved(true);
  }

  function onChange(setter: (value: string) => void) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value);
      setSaved(false);
      setError(null);
    };
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/">
          <ArrowLeft />
          Nazad na pretragu
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Podešavanja presedanja</CardTitle>
          <CardDescription>
            Vrednosti se čuvaju u pregledaču. Podrazumevano:{" "}
            {DEFAULT_MIN_TRANSFER_MINUTES} min presedanje, {DEFAULT_MAX_LAYOVER_MINUTES}{" "}
            min maksimalno čekanje.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="min-transfer">Minimalno vreme presedanja (min)</Label>
              <Input
                id="min-transfer"
                type="number"
                inputMode="numeric"
                min={1}
                value={minInput}
                onChange={onChange(setMinInput)}
              />
              <p className="text-sm text-muted-foreground">
                Najmanje vreme potrebno da se pređe na drugi voz.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="max-layover">Maksimalno vreme čekanja (min)</Label>
              <Input
                id="max-layover"
                type="number"
                inputMode="numeric"
                min={1}
                value={maxInput}
                onChange={onChange(setMaxInput)}
              />
              <p className="text-sm text-muted-foreground">
                Duže čekanje na presedanju se ne prikazuje.
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {saved && !error && (
              <p className="text-sm text-muted-foreground">Sačuvano.</p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button type="submit">Sačuvaj</Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                Vrati na podrazumevano
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
