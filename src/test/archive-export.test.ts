import { describe, expect, it } from "vitest";
import { createArchiveFile } from "@/lib/archive-export";
import type { Entry } from "@/lib/db";

function readText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsText(blob);
  });
}

describe("local archive export", () => {
  it("preserves every entry field, notes, ten-star ratings and coordinates", async () => {
    const entry: Entry = {
      id: "journey-1", category: "travels", title: "Glencoe",
      fields: { country: "Scotland" }, rating: 7.5, favourite: true, notes: "Rain on the roof",
      senses: { mood: "Peaceful" }, lat: 56.68, lng: -5.1,
      audio: [], createdAt: 100, updatedAt: 200,
    };
    const file = await createArchiveFile([entry], new Date("2026-10-16T22:00:00Z"));
    expect(file.name).toBe("bothy-archive-2026-10-16.json");
    expect(file.type).toBe("application/json");
    const archive = JSON.parse(await readText(file));
    expect(archive.entries).toEqual([entry]);
    expect(archive.format).toBe("bothy-archive");
    expect(archive.version).toBe(1);
  });

  it("embeds unedited audio bytes and the 20-second clip metadata", async () => {
    const file = await createArchiveFile([{
      id: "place-1", category: "places", title: "River", fields: {},
      rating: 0, notes: "", senses: {}, createdAt: 1, updatedAt: 1,
      audio: [{ id: "clip-1", blob: new Blob(["original sound"], { type: "audio/webm" }), createdAt: 2, duration: 20 }],
    }]);
    const archive = JSON.parse(await readText(file));
    expect(archive.entries[0].audio[0]).toEqual({
      id: "clip-1", createdAt: 2, duration: 20, mimeType: "audio/webm",
      dataUrl: "data:audio/webm;base64,b3JpZ2luYWwgc291bmQ=",
    });
  });
});