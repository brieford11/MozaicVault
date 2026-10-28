import type { Entry } from "./db";
import { getEntryTitle } from "./entry-details";
import { getCategory } from "./categories";

export type ArchiveEvent = {
  id: string;
  entryId: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  kind: string;
  location: string;
  reminder?: string;
};
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function parseDay(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
  return dayKey(date) === value ? date : undefined;
}
const validTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
const validDateTime = (value: string) =>
  !!parseDay(value.slice(0, 10)) &&
  validTime(value.slice(11, 16)) &&
  Number.isFinite(Date.parse(value));
const eventCategories = [
  "health",
  "travels",
  "places",
  "thirdplaces",
  "concerts",
  "festivals",
  "shows",
  "events",
  "movement",
  "medicine",
];
export function archiveEvents(entries: Entry[]): ArchiveEvent[] {
  return entries
    .flatMap((entry) => {
      const events: ArchiveEvent[] = [];
      const fields = entry.fields;
      const title = getEntryTitle(entry) || "Untitled";
      const kind = getCategory(entry.category)?.name ?? "Entry";
      const location =
        fields["clinic"] || fields["venue"] || fields["city"] || fields["town"] || "";
      const date = fields["date"] ?? "";
      if (eventCategories.includes(entry.category) && parseDay(date)) {
        const time = fields["time"] ?? "";
        const endDay = fields["until"] || fields["end"];
        const end = endDay && parseDay(endDay) && endDay >= date ? endDay : undefined;
        events.push({
          id: `${entry.id}:date`,
          entryId: entry.id,
          title,
          start: validTime(time) ? `${date}T${time}` : date,
          allDay: !validTime(time),
          kind,
          location,
          ...(end ? { end: validTime(time) ? `${end}T${time}` : end } : {}),
          ...(entry.reminder?.at && validDateTime(entry.reminder.at)
            ? { reminder: entry.reminder.at }
            : {}),
        });
      }
      for (const leg of entry.legs ?? []) {
        if (!validDateTime(leg.departure)) continue;
        events.push({
          id: `${entry.id}:leg:${leg.id}`,
          entryId: entry.id,
          title: `${leg.mode}: ${leg.from || "Departure"} → ${leg.to || "Arrival"}`,
          start: leg.departure,
          ...(validDateTime(leg.arrival) && leg.arrival > leg.departure
            ? { end: leg.arrival }
            : {}),
          allDay: false,
          kind: "Travel leg",
          location: leg.from,
        });
      }
      const followUp = fields["followUp"] ?? "";
      if (entry.category === "health" && parseDay(followUp) && followUp !== date)
        events.push({
          id: `${entry.id}:follow-up`,
          entryId: entry.id,
          title: `Follow-up: ${title}`,
          start: followUp,
          allDay: true,
          kind: "Follow-up",
          location,
        });
      if (events.length === 0 && entry.reminder?.at && validDateTime(entry.reminder.at))
        events.push({
          id: `${entry.id}:reminder`,
          entryId: entry.id,
          title,
          start: entry.reminder.at,
          allDay: false,
          kind: "Reminder",
          location,
          reminder: entry.reminder.at,
        });
      return events;
    })
    .sort((a, b) => a.start.localeCompare(b.start));
}
export function eventsOnDay(events: ArchiveEvent[], date: Date): ArchiveEvent[] {
  const key = dayKey(date);
  return events.filter(
    (event) =>
      event.start.slice(0, 10) <= key &&
      (event.end?.slice(0, 10) ?? event.start.slice(0, 10)) >= key,
  );
}
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}
function utcStamp(value: string | Date): string {
  return new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}
// Calendar lines are folded by UTF-8 bytes so accented titles remain valid.
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (bytes + size > 75) {
      parts.push(current);
      current = " ";
      bytes = 1;
    }
    current += character;
    bytes += size;
  }
  parts.push(current);
  return parts.join("\r\n");
}
export function eventsToCalendar(events: ArchiveEvent[], now = new Date()): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mozaic Vault//Private Calendar//EN",
    "CALSCALE:GREGORIAN",
  ];
  for (const event of events) {
    if (!parseDay(event.start.slice(0, 10)) || (!event.allDay && !validDateTime(event.start)))
      throw new Error("Choose a valid event date.");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.id.replace(/[^\w.-]/g, "-")}@mozaic-vault.local`,
      `DTSTAMP:${utcStamp(now)}`,
    );
    if (event.allDay) {
      const end = parseDay(event.end?.slice(0, 10) ?? event.start.slice(0, 10));
      if (!end) throw new Error("Choose a valid event date.");
      end.setDate(end.getDate() + 1);
      lines.push(
        `DTSTART;VALUE=DATE:${event.start.slice(0, 10).replace(/-/g, "")}`,
        `DTEND;VALUE=DATE:${dayKey(end).replace(/-/g, "")}`,
      );
    } else {
      const end =
        event.end && validDateTime(event.end)
          ? new Date(event.end)
          : new Date(Date.parse(event.start) + 60 * 60 * 1000);
      lines.push(`DTSTART:${utcStamp(event.start)}`, `DTEND:${utcStamp(end)}`);
    }
    lines.push(`SUMMARY:${escapeText(event.title)}`, `LOCATION:${escapeText(event.location)}`);
    if (event.reminder && validDateTime(event.reminder))
      lines.push(
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `TRIGGER;VALUE=DATE-TIME:${utcStamp(event.reminder)}`,
        `DESCRIPTION:${escapeText(event.title)}`,
        "END:VALARM",
      );
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR", "");
  return lines.map(foldLine).join("\r\n");
}
