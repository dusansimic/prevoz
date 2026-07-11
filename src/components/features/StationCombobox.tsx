import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Station } from "@/lib/types";
import { cn, foldText } from "@/lib/utils";

interface StationComboboxProps {
  id?: string;
  stations: Station[];
  value: Station | null;
  onChange: (station: Station | null) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
}

/** Accent-insensitive station picker (Popover + cmdk). */
export function StationCombobox({
  id,
  stations,
  value,
  onChange,
  placeholder = "Izaberi stanicu…",
  disabled,
  loading,
}: StationComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || loading}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value ? value.name : placeholder}
          </span>
          {loading ? (
            <Loader2 className="ml-2 shrink-0 animate-spin opacity-50" />
          ) : (
            <ChevronsUpDown className="ml-2 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command
          filter={(itemValue, search) =>
            foldText(itemValue).includes(foldText(search)) ? 1 : 0
          }
        >
          <CommandInput placeholder="Pretraži stanice…" />
          <CommandList>
            <CommandEmpty>Nema rezultata.</CommandEmpty>
            <CommandGroup>
              {stations.map((station) => (
                <CommandItem
                  key={station.code}
                  value={`${station.name} ${station.code}`}
                  onSelect={() => {
                    onChange(station.code === value?.code ? null : station);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "size-4",
                      value?.code === station.code ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">{station.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
