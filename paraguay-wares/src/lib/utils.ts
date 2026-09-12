import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converte valor digitado em número, aceitando formato brasileiro.
 * "12,50" → 12.5 · "1.234,56" → 1234.56 · "12.50" → 12.5 · "R$ 10" → 10
 * Retorna NaN se não for um número válido.
 */
export function parseDecimal(v: string): number {
  let s = v.trim().replace(/[^\d,.-]/g, "");
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  return s === "" ? NaN : Number(s);
}
