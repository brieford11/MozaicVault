// All data lives only in this device's browser storage (IndexedDB). Nothing is sent anywhere.
import { useCallback, useEffect, useState } from "react";

export type AudioClip = { id: string; blob: Blob; createdAt: number; duration: number };
export type JourneyLeg = {
  id: string;
  mode: "Flight" | "Train" | "Boat";
  operator: string;
  number: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  booking: string;
  notes: string;
};
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
    const r = indexedDB.open(DB, 2);
    r.onupgradeneeded = () => {
      if (!r.result.objectStoreNames.contains(STORE)) {
        const s = r.result.createObjectStore(STORE, { keyPath: "id" });
        s.createIndex("category", "category");
      }
      if (!r.result.objectStoreNames.contains("preferences"))
        r.result.createObjectStore("preferences");
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

async function tx<T>(
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await open();
  return new Promise((res, rej) => {
    const transaction = db.transaction(STORE, mode);
    const req = fn(transaction.objectStore(STORE));
    let result: T;
    req.onsuccess = () => {
      result = req.result;
    };
    transaction.oncomplete = () => {
      db.close();
      if (mode === "readwrite") window.dispatchEvent(new Event("archive-entries"));
      res(result);
    };
    transaction.onerror = () => {
      db.close();
      rej(transaction.error);
    };
    transaction.onabort = () => {
      db.close();
      rej(transaction.error);
    };
  });
}

export const db = {
  all: () => tx<Entry[]>("readonly", (s) => s.getAll()),
  get: (id: string) => tx<Entry | undefined>("readonly", (s) => s.get(id)),
  put: (e: Entry) => tx("readwrite", (s) => s.put(e)),
  del: (id: string) => tx("readwrite", (s) => s.delete(id)),
};

export async function readHiddenPages(): Promise<string[]> {
  const database = await open();
  return new Promise((resolve, reject) => {
    const request = database
      .transaction("preferences")
      .objectStore("preferences")
      .get("hiddenPages");
    request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
    request.onerror = () => reject(request.error);
  });
}

export async function writeHiddenPages(pages: string[]): Promise<void> {
  const database = await open();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("preferences", "readwrite");
    transaction.objectStore("preferences").put(pages, "hiddenPages");
    transaction.oncomplete = () => {
      window.dispatchEvent(new Event("archive-preferences"));
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function readPreference<T>(key: string): Promise<T | undefined> {
  const database = await open();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("preferences");
    const request = transaction.objectStore("preferences").get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

export async function writePreference<T>(key: string, value: T): Promise<void> {
  const database = await open();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("preferences", "readwrite");
    transaction.objectStore("preferences").put(value, key);
    transaction.oncomplete = () => {
      database.close();
      window.dispatchEvent(new Event("archive-preferences"));
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export function blankEntry(category: string): Entry {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    category,
    title: "",
    fields: {},
    rating: 0,
    notes: "",
    senses: {},
    audio: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function useEntries() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState("");
  const reload = useCallback(() => {
    db.all()
      .then((e) => {
        setEntries(e.sort((a, b) => b.updatedAt - a.updatedAt));
        setError("");
      })
      .catch(() => setError("Could not open your records. Refresh to try again."));
  }, []);
  useEffect(() => {
    reload();
    window.addEventListener("archive-entries", reload);
    return () => window.removeEventListener("archive-entries", reload);
  }, [reload]);
  return { entries, error, reload };
}
