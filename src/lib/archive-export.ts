import type { Entry } from "./db";
import { getCategory, getListLabel } from "./categories";
import { getEntryTitle } from "./entry-details";

export type ExportFormat = "json" | "csv" | "text";

export function selectArchiveEntries(entries: Entry[], scope: string): Entry[] {
  return scope === "all" ? entries : scope === "favourites" ? entries.filter((entry) => entry.favourite || entry.category === "favourites") : entries.filter((entry) => entry.category === scope);
}

export function journalText(entries: Entry[]): string {
  return entries.map((entry) => [
    getEntryTitle(entry) || "Untitled",
    getCategory(entry.category)?.name ?? entry.category,
    ...(entry.want ? [getListLabel(entry.category)] : []),
    `Rating: ${entry.rating}/10`,
    ...Object.entries(entry.fields).filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`),
    ...Object.entries(entry.senses).filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`),
    ...(entry.lat != null && entry.lng != null ? [`Coordinates: ${entry.lat}, ${entry.lng}`] : []),
    ...(entry.reminder ? [`Reminder: ${entry.reminder.at}`] : []),
    ...(entry.legs ?? []).map((leg) => `${leg.mode}: ${leg.from} → ${leg.to} · ${leg.departure}\n${leg.operator} ${leg.number} · ${leg.arrival}\n${leg.booking}\n${leg.notes}`),
    entry.notes,
  ].filter(Boolean).join("\n")).join("\n\n———\n\n");
}

export async function createExportFile(entries: Entry[], format: ExportFormat, now = new Date()): Promise<File> {
  if (format === "json") return createArchiveFile(entries, now);
  const name = `mozaic-vault-${now.toISOString().slice(0, 10)}`;
  if (format === "text") return new File([journalText(entries)], `${name}.txt`, { type: "text/plain" });
  const quote = (value: unknown) => `"${String(value).replace(/"/g, '""')}"`;
  const rows = [["Title", "Category", "Rating", "List", "Notes", "Details", "Sensory mood", "Latitude", "Longitude", "Reminder", "Transport"], ...entries.map((entry) => [getEntryTitle(entry), entry.category, entry.rating, entry.want ? getListLabel(entry.category) : "", entry.notes, JSON.stringify(entry.fields), JSON.stringify(entry.senses), entry.lat ?? "", entry.lng ?? "", entry.reminder?.at ?? "", JSON.stringify(entry.legs ?? [])])];
  return new File(["\uFEFF" + rows.map((row) => row.map(quote).join(",")).join("\r\n")], `${name}.csv`, { type: "text/csv" });
}

function audioDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string"
      ? resolve(reader.result)
      : reject(new Error("Could not read audio"));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read audio"));
    reader.readAsDataURL(blob);
  });
}

export async function createArchiveFile(entries: Entry[], now = new Date()): Promise<File> {
  const pages = await Promise.all(entries.map(async (entry) => ({
    ...entry,
    audio: await Promise.all(entry.audio.map(async ({ blob, ...clip }) => ({
      ...clip,
      mimeType: blob.type,
      dataUrl: await audioDataUrl(blob),
    }))),
  })));
  return new File([JSON.stringify({
    format: "bothy-archive",
    version: 1,
    exportedAt: now.toISOString(),
    entries: pages,
  }, null, 2)], `bothy-archive-${now.toISOString().slice(0, 10)}.json`, { type: "application/json" });
}

export function downloadArchive(file: File) {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}