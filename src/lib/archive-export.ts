import type { Entry } from "./db";

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