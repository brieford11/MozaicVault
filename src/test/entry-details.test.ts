import { describe, expect, it } from "vitest";
import { getCategory } from "@/lib/categories";
import { blankEntry } from "@/lib/db";
import { getEntryTitle, normalizeEntry } from "@/lib/entry-details";

describe("Event details", () => {
  it("offers a vinyl disc count dropdown", () => {
    const field = getCategory("vinyl")?.fields.find((f) => f.key === "discCount");
    expect(field?.type).toBe("select");
    expect(field?.options).toContain("2");
  });
  it("offers a books-in-series count dropdown", () => {
    const field = getCategory("books")?.fields.find((f) => f.key === "seriesCount");
    expect(field?.type).toBe("select");
    expect(field?.options).toContain("7");
  });
  it("offers a concert type dropdown", () => {
    expect(getCategory("concerts")?.fields.find((f) => f.key === "concertType")?.type).toBe("select");
  });
  it("allows describing an Other third place", () => {
    expect(getCategory("thirdplaces")?.fields.find((f) => f.key === "kindOther")?.showWhen).toEqual({ key: "kind", value: "Other" });
  });
  for (const category of ["places", "thirdplaces"]) {
    it(`${category} separates town and country`, () => {
      expect(getCategory(category)?.fields.find((f) => f.key === "town")?.label).toBe("Town");
      expect(getCategory(category)?.fields.find((f) => f.key === "country")?.label).toBe("Country");
    });
  }
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