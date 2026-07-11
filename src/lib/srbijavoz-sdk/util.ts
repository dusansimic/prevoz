// VENDORED from @dusansimic/srbijavoz-sdk. See ./types.ts header.
/** Date/time conversions between SDK inputs and upstream formats. */

/** Normalize `Date` or ISO `YYYY-MM-DD` to `[yyyy, mm, dd]` strings. */
function dateParts(date: Date | string): [string, string, string] {
  if (date instanceof Date) {
    const yyyy = String(date.getFullYear());
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return [yyyy, mm, dd];
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) {
    throw new TypeError(`Invalid date "${date}" — expected Date or "YYYY-MM-DD"`);
  }
  return [m[1]!, m[2]!, m[3]!];
}

/** `dd.MM.yyyy` — used in result-page URLs. */
export function toUrlDate(date: Date | string): string {
  const [yyyy, mm, dd] = dateParts(date);
  return `${dd}.${mm}.${yyyy}`;
}

/** `dd-MM-yyyy` — used by the vozdetalji1 API. */
export function toApiDate(date: Date | string): string {
  const [yyyy, mm, dd] = dateParts(date);
  return `${dd}-${mm}-${yyyy}`;
}

/** Upstream `dd.MM.yyyy` or `dd-MM-yyyy` → ISO `YYYY-MM-DD`. */
export function fromUpstreamDate(value: string): string {
  const m = /^(\d{2})[.-](\d{2})[.-](\d{4})$/.exec(value.trim());
  if (!m) return value.trim();
  return `${m[3]}-${m[2]}-${m[1]}`;
}

/** `"HH:mm"` or `"HHmm"` → URL segment `HHmm`. */
export function toUrlTime(time?: string): string {
  if (!time) return "0000";
  const m = /^(\d{1,2}):?(\d{2})$/.exec(time.trim());
  if (!m) {
    throw new TypeError(`Invalid time "${time}" — expected "HH:mm" or "HHmm"`);
  }
  return m[1]!.padStart(2, "0") + m[2]!;
}

/** Trim upstream space padding; collapse to empty string when blank. */
export function clean(value: string | null | undefined): string {
  return (value ?? "").trim();
}

/** Normalize a station code to its canonical zero-padded 5-char string form. */
export function toStationCode(code: string | number): string {
  return String(code).trim().padStart(5, "0");
}

/**
 * Encode a URL path segment the way the site's own JS prepares station names:
 * trim, strip dots, `-` → space (plus standard percent-encoding).
 */
export function nameSegment(name: string): string {
  return encodeURIComponent(clean(name).replace(/-/g, " ").replace(/\./g, ""));
}
