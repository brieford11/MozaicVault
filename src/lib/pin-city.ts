import type { Entry } from "./db";

export function getPinCity(entry: Entry): string {
  return entry.fields.city?.trim() || entry.fields.town?.trim() || "City not recorded";
}