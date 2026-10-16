// All data lives only in this device's browser storage (IndexedDB). Nothing is sent anywhere.
import { useCallback, useEffect, useState } from "react";

export type AudioClip = { id: string; blob: Blob; createdAt: number; duration: number };
export type JourneyLeg = { id: string; mode: "Flight" | "Train" | "Boat"; operator: string; number: string; from: string; to: string; departure: string; arrival: string; booking: string; notes: string };
export type Reminder = { at: string; firedAt?: number };
export type Entry = {
  id: string;
  category: string;
  title: string;
  fields: Record<string, string>;
  rating: number; // 0-10 in half-star increments
  favourite?: boolean;
  notes: string;
  senses: Record<string, string>;
  lat?: number | undefined;
  lng?: number | undefined;
  want?: boolean; // on the want list — not yet owned/seen
  image?: string; // cover photo as a data URL, stored locally
  ticketImage?: string;
  legs?: JourneyLeg[];
  reminder?: Reminder | undefined;
  audio: AudioClip[];
  createdAt: number;
  updatedAt: number;
};

const DB = "hearth-archive";
const STORE = "entries";

function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => {
      const s = r.result.createObjectStore(STORE, { keyPath: "id" });
      s.createIndex("category", "category");
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((res, rej) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

export const db = {
  all: () => tx<Entry[]>("readonly", (s) => s.getAll()),
  get: (id: string) => tx<Entry | undefined>("readonly", (s) => s.get(id)),
  put: (e: Entry) => tx("readwrite", (s) => s.put(e)),
  del: (id: string) => tx("readwrite", (s) => s.delete(id)),
};

export function blankEntry(category: string): Entry {
  const now = Date.now();
  return { id: crypto.randomUUID(), category, title: "", fields: {}, rating: 0, notes: "", senses: {}, audio: [], createdAt: now, updatedAt: now };
}

export function useEntries() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const reload = useCallback(() => { db.all().then((e) => setEntries(e.sort((a, b) => b.updatedAt - a.updatedAt))); }, []);
  useEffect(reload, [reload]);
  return { entries, reload };
}
