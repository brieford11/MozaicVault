import { describe, expect, it } from "vitest";
import { getCategory } from "@/lib/categories";
import { blankEntry } from "@/lib/db";
import { getEntryTitle, normalizeEntry } from "@/lib/entry-details";

describe("Event details", () => {
  for (const category of ["concerts", "festivals", "shows", "events"]) {
    it(`${category} supports a time`, () => {
      expect(getCategory(category)?.fields.find((f) => f.key === "time")?.type).toBe("time");
      const entry = { ...blankEntry(category), fields: { time: "19:30" } };
      expect(normalizeEntry(entry).fields["time"]).toBe("19:30");
    });
  }

  it("uses the artist as the concert title, including older concerts", () => {
    const entry = { ...blankEntry("concerts"), title: "Live at the theatre", fields: { creator: "Florence + the Machine", time: "20:00" } };
    expect(getEntryTitle(entry)).toBe("Florence + the Machine");
    const normalized = normalizeEntry(entry);
    expect(normalized.title).toBe("Florence + the Machine");
    expect(normalized.fields["creator"]).toBeUndefined();
    expect(getEntryTitle({ ...normalized, title: "Björk" })).toBe("Björk");
    expect(getCategory("concerts")?.fields.some((f) => f.key === "creator")).toBe(false);
  });
});