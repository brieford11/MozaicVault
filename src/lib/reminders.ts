import type { Entry, JourneyLeg } from "./db";

export function blankLeg(): JourneyLeg {
  return { id: crypto.randomUUID(), mode: "Flight", operator: "", number: "", from: "", to: "", departure: "", arrival: "", booking: "", notes: "" };
}

export function dueReminders(entries: Entry[], now: number): Entry[] {
  return entries.filter((e) => e.reminder && !e.reminder.firedAt && Number.isFinite(Date.parse(e.reminder.at)) && Date.parse(e.reminder.at) <= now);
}

function escapeCalendar(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

function stamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function calendarReminder(entry: Entry, now = new Date()): string {
  const at = entry.reminder?.at;
  if (!at || !Number.isFinite(Date.parse(at))) throw new Error("Choose a reminder date and time.");
  const planned = entry.legs?.find((leg) => leg.departure)?.departure;
  const startInput = entry.fields.date ? `${entry.fields.date}T${entry.fields.time || "09:00"}` : planned || at;
  const start = new Date(startInput);
  if (!Number.isFinite(start.getTime())) throw new Error("Choose a valid event date.");
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mozaic Vault//Local reminders//EN", "BEGIN:VEVENT",
    `UID:${entry.id}@mozaic-vault.local`, `DTSTAMP:${stamp(now)}`, `DTSTART:${stamp(start)}`,
    `SUMMARY:${escapeCalendar(entry.title || "Upcoming memory")}`,
    `DESCRIPTION:${escapeCalendar(entry.notes)}`, `LOCATION:${escapeCalendar(entry.fields.venue || entry.fields.city || "")}`,
    "BEGIN:VALARM", "ACTION:DISPLAY", `TRIGGER;VALUE=DATE-TIME:${stamp(new Date(at))}`,
    `DESCRIPTION:${escapeCalendar(entry.title || "Upcoming memory")}`, "END:VALARM", "END:VEVENT", "END:VCALENDAR", ""].join("\r\n");
}