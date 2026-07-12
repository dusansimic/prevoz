import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Defaults mirror the transfer planner's built-in defaults (lib/transfers.ts). */
export const DEFAULT_MIN_TRANSFER_MINUTES = 10;
export const DEFAULT_MAX_LAYOVER_MINUTES = 240;

interface SettingsState {
  /** Minimum minutes needed to change trains at the transfer station. */
  minTransferMinutes: number;
  /** Maximum acceptable layover at the transfer station. */
  maxLayoverMinutes: number;
  setMinTransferMinutes: (value: number) => void;
  setMaxLayoverMinutes: (value: number) => void;
  reset: () => void;
}

/**
 * User settings persisted to localStorage (`prevoz-settings`). Until the user
 * changes them, the built-in defaults apply.
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      minTransferMinutes: DEFAULT_MIN_TRANSFER_MINUTES,
      maxLayoverMinutes: DEFAULT_MAX_LAYOVER_MINUTES,
      setMinTransferMinutes: (value) => set({ minTransferMinutes: value }),
      setMaxLayoverMinutes: (value) => set({ maxLayoverMinutes: value }),
      reset: () =>
        set({
          minTransferMinutes: DEFAULT_MIN_TRANSFER_MINUTES,
          maxLayoverMinutes: DEFAULT_MAX_LAYOVER_MINUTES,
        }),
    }),
    { name: "prevoz-settings" },
  ),
);
