import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class lists, resolving conflicts (shadcn/ui convention). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Serbian-formatted price with no decimals, e.g. `513` → `"513 RSD"`. */
export function formatRsd(amount: number): string {
  const n = new Intl.NumberFormat("sr-RS", { maximumFractionDigits: 0 }).format(amount);
  return `${n} RSD`;
}

/**
 * Lowercase and strip Serbian Latin diacritics so `"nis"` matches `"NIŠ"` and
 * `"djordje"` matches `"Đorđe"`. Used for accent-insensitive station search.
 */
export function foldText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
}
