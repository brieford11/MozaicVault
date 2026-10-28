import type { Entry } from "./db";

export const READING_STATUSES = ["Not started", "Up next", "Reading", "Read"] as const;
export type ReadingStatus = (typeof READING_STATUSES)[number];
export function readingStatus(entry: Entry): ReadingStatus {
  return (
    READING_STATUSES.find((status) => status === entry.fields["readingStatus"]) ?? "Not started"
  );
}
export function setReadingStatus(entry: Entry, status: ReadingStatus, today: string): Entry {
  const fields: Record<string, string> = { ...entry.fields, readingStatus: status };
  if (status === "Reading" && !fields["started"]) fields["started"] = today;
  if (status === "Read" && !fields["finished"]) fields["finished"] = today;
  return { ...entry, fields, updatedAt: Date.now() };
}
