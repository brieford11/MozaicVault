import { describe, expect, it } from "vitest";
import { blankEntry } from "@/lib/db";
import {
  archiveEvents,
  dayKey,
  eventsOnDay,
  eventsToCalendar,
  parseDay,
} from "@/lib/calendar-events";
import { readingStatus, setReadingStatus } from "@/lib/reading";
import { canRemoveShelf, normalizeBookshelf, shelfHiddenKey } from "@/lib/bookshelf-preferences";
import { CABINET_COLORS, moveVisibleCabinet, normalizeCabinets } from "@/lib/cabinet-preferences";

describe("Reading progress", () => {
  it("keeps ownership wishes separate from reading plans and preserves legacy book details", () => {
    const book = { ...blankEntry("books"), want: true, fields: { creator: "Ursula Le Guin" } };
    expect(readingStatus(book)).toBe("Not started");
    const queued = setReadingStatus(book, "Up next", "2026-11-01");
    expect(readingStatus(queued)).toBe("Up next");
    const reading = setReadingStatus(queued, "Reading", "2026-11-02");
    const finished = setReadingStatus(reading, "Read", "2026-11-05");
    expect(finished.fields).toMatchObject({
      creator: "Ursula Le Guin",
      started: "2026-11-02",
      finished: "2026-11-05",
      readingStatus: "Read",
    });
    expect(finished.want).toBe(true);
    expect(setReadingStatus(finished, "Reading", "2026-11-06").fields["started"]).toBe(
      "2026-11-02",
    );
  });
});

describe("Local calendar", () => {
  it("shows past and future appointments, follow-ups, journey ranges and timed travel legs", () => {
    const appointment = {
      ...blankEntry("health"),
      id: "doctor",
      title: "Regular checkup",
      fields: { date: "2026-10-01", time: "10:30", followUp: "2026-11-01", clinic: "Local clinic" },
    };
    const trip = {
      ...blankEntry("travels"),
      id: "trip",
      title: "Highland weekend",
      fields: { date: "2026-11-06", until: "2026-11-08" },
      legs: [
        {
          id: "train",
          mode: "Train" as const,
          operator: "",
          number: "",
          from: "Edinburgh",
          to: "Inverness",
          departure: "2026-11-06T09:00",
          arrival: "2026-11-06T12:30",
          booking: "",
          notes: "",
        },
      ],
    };
    const events = archiveEvents([appointment, trip]);
    expect(eventsOnDay(events, new Date(2026, 9, 1)).map((event) => event.entryId)).toEqual([
      "doctor",
    ]);
    expect(eventsOnDay(events, new Date(2026, 10, 1))[0]?.title).toBe("Follow-up: Regular checkup");
    expect(eventsOnDay(events, new Date(2026, 10, 7))[0]?.title).toBe("Highland weekend");
    expect(eventsOnDay(events, new Date(2026, 10, 6))).toHaveLength(2);
    expect(eventsOnDay(events, new Date(2026, 10, 9))).toHaveLength(0);
  });
  it("rejects impossible dates and uses reminders for otherwise undated entries", () => {
    expect(parseDay("2026-02-30")).toBeUndefined();
    expect(dayKey(parseDay("2026-01-01")!)).toBe("2026-01-01");
    const bad = { ...blankEntry("events"), fields: { date: "2026-02-30" } };
    expect(archiveEvents([bad])).toEqual([]);
    expect(
      archiveEvents([{ ...blankEntry("books"), reminder: { at: "2026-11-01T09:00" } }])[0]?.kind,
    ).toBe("Reminder");
  });
  it("exports inclusive all-day ranges with an exclusive end date and exact alarm", () => {
    const events = archiveEvents([
      {
        ...blankEntry("travels"),
        title: "Highlands, autumn",
        fields: { date: "2026-11-06", until: "2026-11-08" },
        reminder: { at: "2026-11-05T09:00Z" },
      },
    ]);
    const file = eventsToCalendar(events, new Date("2026-10-28T12:00Z"));
    expect(file).toContain("DTSTART;VALUE=DATE:20261106\r\n");
    expect(file).toContain("DTEND;VALUE=DATE:20261109\r\n");
    expect(file).toContain("SUMMARY:Highlands\\, autumn");
    expect(file).toContain("TRIGGER;VALUE=DATE-TIME:20261105T090000Z");
  });
  it("folds long Unicode titles into valid calendar lines without including private notes", () => {
    const file = eventsToCalendar(
      archiveEvents([
        {
          ...blankEntry("health"),
          title: "é".repeat(120),
          notes: "Private symptom history",
          fields: { date: "2026-11-01" },
        },
      ]),
    );
    expect(file).not.toContain("Private symptom history");
    expect(file.replace(/\r\n /g, "")).toContain(`SUMMARY:${"é".repeat(120)}`);
    for (const line of file.split("\r\n"))
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  });
});

describe("Shelf limits and colors", () => {
  it("keeps a minimum of one visible shelf even when other shelves are hidden", () => {
    const one = normalizeBookshelf({ shelves: [], subshelves: [] });
    expect(one.shelves).toHaveLength(1);
    expect(canRemoveShelf(one, [], "shelf")).toBe(false);
    const two = normalizeBookshelf({ shelves: ["shelf", "motion"] });
    expect(canRemoveShelf(two, [], "shelf")).toBe(true);
    expect(canRemoveShelf(two, [shelfHiddenKey("motion")], "shelf")).toBe(false);
  });
  it("retains old colors, supports frame colors, and reorders only visible shelves", () => {
    expect(CABINET_COLORS.length).toBeGreaterThan(5);
    expect(normalizeBookshelf({ frameColor: "navy" }).frameColor).toBe("navy");
    expect(normalizeBookshelf({ frameColor: "missing" }).frameColor).toBe("walnut");
    const cabinets = normalizeCabinets(undefined);
    const moved = moveVisibleCabinet(cabinets, "motion", -1, ["shelf", "motion"]);
    expect(
      moved.filter((item) => ["shelf", "motion"].includes(item.id)).map((item) => item.id),
    ).toEqual(["motion", "shelf"]);
    expect(moved.filter((item) => !["shelf", "motion"].includes(item.id))).toEqual(
      cabinets.filter((item) => !["shelf", "motion"].includes(item.id)),
    );
  });
});
