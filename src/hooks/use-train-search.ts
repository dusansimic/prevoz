import { useCallback, useRef, useState } from "react";
import type { DirectTrain, Station, TransferJourney } from "@/lib/types";
import type { TransferScope } from "@/services/train-service";
import { planTransfers, searchDirect } from "@/services/train-service";

export interface SearchInput {
  from: Station;
  to: Station;
  dateIso: string;
  withTransfers: boolean;
  transferScope: TransferScope;
}

export interface SearchState {
  status: "idle" | "searching" | "done" | "error";
  direct: DirectTrain[];
  transfers: TransferJourney[];
  /** Whether the current search asked for transfer journeys. */
  requestedTransfers: boolean;
  /** True while transfer planning runs (direct results already shown). */
  planningTransfers: boolean;
  progress: { done: number; total: number } | null;
  error: string | null;
  query: { from: Station; to: Station; dateIso: string } | null;
}

const IDLE: SearchState = {
  status: "idle",
  direct: [],
  transfers: [],
  requestedTransfers: false,
  planningTransfers: false,
  progress: null,
  error: null,
  query: null,
};

/** Orchestrates a search: direct trains first, then one-transfer journeys. */
export function useTrainSearch() {
  const [state, setState] = useState<SearchState>(IDLE);
  const runId = useRef(0);
  const abort = useRef<AbortController | null>(null);

  const search = useCallback(async (input: SearchInput) => {
    const id = ++runId.current;
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;

    const query = { from: input.from, to: input.to, dateIso: input.dateIso };
    setState({
      ...IDLE,
      status: "searching",
      query,
      requestedTransfers: input.withTransfers,
    });

    try {
      const direct = await searchDirect(input.from, input.to, input.dateIso);
      if (id !== runId.current) return;

      setState((prev) => ({
        ...prev,
        direct,
        planningTransfers: input.withTransfers,
        status: input.withTransfers ? "searching" : "done",
      }));

      if (!input.withTransfers) return;

      const transfers = await planTransfers(
        input.from,
        input.to,
        input.dateIso,
        input.transferScope,
        {
          signal: controller.signal,
          onProgress: (done, total) => {
            if (id === runId.current) {
              setState((prev) => ({ ...prev, progress: { done, total } }));
            }
          },
        },
      );
      if (id !== runId.current) return;

      setState((prev) => ({
        ...prev,
        transfers,
        planningTransfers: false,
        progress: null,
        status: "done",
      }));
    } catch (err: unknown) {
      if (id !== runId.current) return;
      setState((prev) => ({
        ...prev,
        status: "error",
        planningTransfers: false,
        progress: null,
        error: err instanceof Error ? err.message : "Pretraga nije uspela",
      }));
    }
  }, []);

  const reset = useCallback(() => {
    runId.current++;
    abort.current?.abort();
    setState(IDLE);
  }, []);

  return { state, search, reset };
}
