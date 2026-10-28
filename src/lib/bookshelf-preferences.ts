import { useEffect, useState } from "react";
import { CATEGORIES, DRAWERS, INITIAL_SUBSHELVES } from "./categories";
import { CABINET_COLORS, type CabinetColor } from "./cabinet-preferences";
import { readHiddenPages, writeHiddenPages, readPreference, writePreference } from "./db";

export type BookshelfPreference = {
  shelves: string[];
  subshelves: string[];
  expanded: string[];
  frameColor: CabinetColor;
};

export const shelfHiddenKey = (id: string) => `drawer:${id}`;
export const toggleSelection = (ids: string[], id: string) =>
  ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];

export function normalizeBookshelf(value: unknown): BookshelfPreference {
  const stored = value && typeof value === "object" ? (value as Partial<BookshelfPreference>) : {};
  const shelfIds = DRAWERS.map((item) => item.id as string);
  const categoryIds = CATEGORIES.map((item) => item.id);
  const valid = (ids: unknown, allowed: string[], fallback: string[]) =>
    Array.isArray(ids)
      ? [
          ...new Set(
            ids.filter((id): id is string => typeof id === "string" && allowed.includes(id)),
          ),
        ]
      : fallback;
  return {
    shelves: valid(stored.shelves, shelfIds, ["shelf"]).length
      ? valid(stored.shelves, shelfIds, ["shelf"])
      : ["shelf"],
    subshelves: valid(stored.subshelves, categoryIds, [...INITIAL_SUBSHELVES]),
    expanded: valid(stored.expanded, shelfIds, ["shelf"]),
    frameColor: CABINET_COLORS.find((color) => color.id === stored.frameColor)?.id ?? "walnut",
  };
}

export function useBookshelf() {
  const [selection, setSelection] = useState(() => normalizeBookshelf(undefined));
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    const load = () =>
      Promise.all([readPreference("bookshelf"), readHiddenPages()])
        .then(async ([value, hidden]) => {
          const normalized = normalizeBookshelf(value);
          if (!normalized.shelves.some((id) => !hidden.includes(shelfHiddenKey(id)))) {
            const available =
              DRAWERS.find((drawer) => !hidden.includes(shelfHiddenKey(drawer.id)))?.id ?? "shelf";
            if (hidden.includes(shelfHiddenKey(available)))
              await writeHiddenPages(hidden.filter((key) => key !== shelfHiddenKey(available)));
            normalized.shelves = [available];
            await writePreference("bookshelf", normalized);
          }
          if (active) {
            setSelection(normalized);
            setReady(true);
          }
        })
        .catch(() => {
          if (active) setError("Could not open bookshelf settings. Refresh to try again.");
        });
    void load();
    window.addEventListener("archive-preferences", load);
    return () => {
      active = false;
      window.removeEventListener("archive-preferences", load);
    };
  }, []);
  const update = async (next: BookshelfPreference) => {
    setError("");
    setSaving(true);
    try {
      const normalized = normalizeBookshelf(next);
      await writePreference("bookshelf", normalized);
      setSelection(normalized);
    } catch {
      setError("Could not save bookshelf settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  return { selection, ready, saving, error, update };
}

export function canRemoveShelf(
  selection: BookshelfPreference,
  hidden: string[],
  id: string,
): boolean {
  return (
    !selection.shelves.includes(id) ||
    selection.shelves.filter((key) => !hidden.includes(shelfHiddenKey(key))).length > 1
  );
}
