import { describe, expect, it } from "vitest";
import { blankEntry } from "@/lib/db";
import { blankLeg, calendarReminder, dueReminders } from "@/lib/reminders";

describe("Local journey plans and reminders", () => {
  it("creates editable flight, train and boat records without losing booking details", () => {
    const flight = { ...blankLeg(), mode: "Flight" as const, number: "BA1450", from: "London", to: "Edinburgh", booking: "MY-BOOKING", departure: "2026-10-20T10:00" };
    const entry = { ...blankEntry("travels"), legs: [flight, { ...blankLeg(), mode: "Train" as const }, { ...blankLeg(), mode: "Boat" as const }] };
    expect(entry.legs.map((leg) => leg.mode)).toEqual(["Flight", "Train", "Boat"]);
    expect(entry.legs[0]?.booking).toBe("MY-BOOKING");
    expect(new Set(entry.legs.map((leg) => leg.id)).size).toBe(3);
  });
  it("only fires reminders whose time is due and have not fired before", () => {
    const base = blankEntry("events");
    const due = { ...base, id: "due", reminder: { at: "2026-10-20T10:00:00Z" } };
    const later = { ...base, id: "later", reminder: { at: "2026-10-20T12:00:00Z" } };
    const fired = { ...due, id: "fired", reminder: { ...due.reminder, firedAt: 1 } };
    expect(dueReminders([due, later, fired, base], Date.parse("2026-10-20T11:00:00Z")).map((entry) => entry.id)).toEqual(["due"]);
  });
  it("exports the chosen reminder as an exact calendar alarm and preserves event details", () => {
    const entry = { ...blankEntry("concerts"), id: "concert", title: "Björk, live", notes: "Bring ticket\nBalcony", fields: { date: "2026-10-20", time: "19:30", venue: "Usher Hall" }, reminder: { at: "2026-10-20T17:00:00Z" } };
    const calendar = calendarReminder(entry, new Date("2026-10-16T23:30:00Z"));
    expect(calendar).toContain("TRIGGER;VALUE=DATE-TIME:20261020T170000Z");
    expect(calendar).toContain("SUMMARY:Björk\\, live\r\n");
    expect(calendar).toContain("DESCRIPTION:Bring ticket\\nBalcony");
    expect(calendar).toContain("LOCATION:Usher Hall");
    expect(calendar).toContain("ACTION:DISPLAY");
  });
  it("rejects invalid reminder times instead of exporting an unusable calendar", () => {
    expect(() => calendarReminder({ ...blankEntry("events"), reminder: { at: "invalid" } })).toThrow("Choose a reminder date and time.");
  });
});