import { describe, expect, it } from "vitest";
import { CABINET_COLORS, moveCabinet, normalizeCabinets } from "@/lib/cabinet-preferences";
import { getCategory } from "@/lib/categories";
import { blankEntry } from "@/lib/db";
import { getPinCity } from "@/lib/pin-city";

describe("Cabinet preferences", () => {
  it("adds Hearth while preserving existing cabinet names and order", () => {
    const cabinets = normalizeCabinets([{ id: "travel", title: "My adventures", color: "rose" }]);
    expect(cabinets[0]).toEqual({ id: "travel", title: "My adventures", color: "rose" });
    expect(cabinets.find((item) => item.id === "hearth")?.title).toBe("Hearth");
  });
  it("restricts cabinet color choices to the deep-pastel palette", () => {
    expect(CABINET_COLORS.map((color) => color.id)).toEqual(["sage", "blue", "lavender", "rose", "teal"]);
    expect(normalizeCabinets([{ id: "shelf", color: "neon" }])[0]?.color).toBe("sage");
  });
  it("reorders cabinets without changing their settings", () => {
    const cabinets = normalizeCabinets(undefined);
    const moved = moveCabinet(cabinets, "hearth", -1);
    expect(moved.map((item) => item.id)).toEqual(["shelf", "stubs", "travel", "hearth", "curios"]);
    expect(moved.find((item) => item.id === "hearth")).toEqual(cabinets.find((item) => item.id === "hearth"));
    expect(moveCabinet(cabinets, "shelf", -1)).toEqual(cabinets);
  });
});

describe("Hearth health tracking", () => {
  it("keeps appointment and symptom tracking in Hearth with date, time and reminders", () => {
    const category = getCategory("health");
    expect(category?.drawer).toBe("hearth");
    expect(category?.reminder).toBe(true);
    expect(category?.fields.find((field) => field.key === "entryType")?.options).toEqual(["Doctor's appointment", "Symptom log"]);
    expect(category?.fields.find((field) => field.key === "date")?.type).toBe("date");
    expect(category?.fields.find((field) => field.key === "time")?.type).toBe("time");
    expect(category?.fields.map((field) => field.key)).toContain("symptoms");
    expect(blankEntry("health").notes).toBe("");
  });
});

describe("Local-only pin cities", () => {
  it("shows the recorded city without exposing the memory title", () => {
    expect(getPinCity({ ...blankEntry("travels"), title: "Private memory", fields: { city: "Edinburgh" } })).toBe("Edinburgh");
  });
  it("uses the recorded town for social spaces", () => {
    expect(getPinCity({ ...blankEntry("thirdplaces"), fields: { town: "Inverness", country: "Scotland" } })).toBe("Inverness");
  });
  it("does not infer unrecorded cities from titles or coordinates", () => {
    expect(getPinCity({ ...blankEntry("places"), title: "London", lat: 51.5, lng: -0.12 })).toBe("City not recorded");
  });
});