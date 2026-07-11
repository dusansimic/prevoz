import { useEffect, useState } from "react";
import type { Station } from "@/lib/types";
import { getStations } from "@/services/train-service";

interface StationsState {
  stations: Station[];
  loading: boolean;
  error: string | null;
}

/**
 * Load the full station directory once. Station selectors filter this list
 * locally (accent-insensitive), so typing does not hit the network.
 */
export function useStations(): StationsState {
  const [state, setState] = useState<StationsState>({
    stations: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    getStations()
      .then((stations) => {
        if (active) setState({ stations, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (active) {
          setState({
            stations: [],
            loading: false,
            error: err instanceof Error ? err.message : "Neuspešno učitavanje stanica",
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
