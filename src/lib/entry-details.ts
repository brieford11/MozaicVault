import type { Entry } from "./db";

// Older concerts stored the artist separately. Promote it when opening the page.
export function getEntryTitle(entry: Entry): string {
  return entry.category === "concerts" ? entry.fields["creator"]?.trim() || entry.title : entry.title;
}

export function normalizeEntry(entry: Entry): Entry {
  if (entry.category !== "concerts") return entry;
  const { creator: _artist, ...fields } = entry.fields;
  return { ...entry, title: getEntryTitle(entry), fields };
}