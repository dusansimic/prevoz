/** Date/time helpers over the SDK's ISO date (`YYYY-MM-DD`) + `HH:mm` shapes. */

/** Local `Date` → ISO `YYYY-MM-DD` (no timezone shift). */
export function toIsoDate(date: Date): string {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Today as ISO `YYYY-MM-DD`. */
export function todayIso(): string {
  return toIsoDate(new Date());
}

/** ISO `YYYY-MM-DD` → local `Date` (midnight, no timezone off-by-one). */
export function fromIsoDate(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

/** Epoch milliseconds for an ISO date + `HH:mm` pair. */
export function toEpoch(dateIso: string, hhmm: string): number {
  const time = /^\d{1,2}:\d{2}$/.test(hhmm) ? hhmm : "00:00";
  return new Date(`${dateIso}T${time.padStart(5, "0")}:00`).getTime();
}

/** Whole minutes between two ISO-date + `HH:mm` moments (b − a). */
export function diffMinutes(
  aDate: string,
  aTime: string,
  bDate: string,
  bTime: string,
): number {
  return Math.round((toEpoch(bDate, bTime) - toEpoch(aDate, aTime)) / 60_000);
}

/** `95` → `"1 h 35 min"`, `40` → `"40 min"`. */
export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/** ISO `YYYY-MM-DD` → `dd.MM.` for compact display. */
export function formatShortDate(dateIso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso);
  if (!m) return dateIso;
  return `${m[3]}.${m[2]}.`;
}

/**
 * A `Date` or ISO `YYYY-MM-DD` string → Serbian date `dd. mm. yyyy.`
 * (e.g. `"11. 07. 2026."`). Timezone-safe for the string case.
 */
export function formatSerbianDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${dd}. ${mm}. ${yyyy}.`;
}
