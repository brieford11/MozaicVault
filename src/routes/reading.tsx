import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EntryCard } from "@/components/EntryCard";
import { Button } from "@/components/ui/button";
import { db, useEntries, type Entry } from "@/lib/db";
import {
  readingStatus,
  READING_STATUSES,
  setReadingStatus,
  type ReadingStatus,
} from "@/lib/reading";
import { dayKey } from "@/lib/calendar-events";

export const Route = createFileRoute("/reading")({
  head: () => ({ meta: [{ title: "Current & Upcoming Books — Mozaic Vault" }] }),
  component: Reading,
});
function Reading() {
  const { entries, error } = useEntries();
  const [tab, setTab] = useState("Current & next");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState("");
  const books = (entries ?? []).filter((entry) => entry.category === "books");
  const list = books.filter(
    (entry) =>
      tab === "All books" ||
      (tab === "Read"
        ? readingStatus(entry) === "Read"
        : ["Reading", "Up next"].includes(readingStatus(entry))),
  );
  const update = async (entry: Entry, status: ReadingStatus) => {
    setSaving(entry.id);
    setSaveError("");
    try {
      await db.put(setReadingStatus(entry, status, dayKey(new Date())));
    } catch {
      setSaveError("Could not save reading status. Please try again.");
    } finally {
      setSaving("");
    }
  };
  return (
    <AppShell title="Current & upcoming books">
      <div className="space-y-4 px-4 pb-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Reading filters">
          {["Current & next", "Read", "All books"].map((label) => (
            <Button
              key={label}
              variant={tab === label ? "default" : "outline"}
              size="sm"
              aria-pressed={tab === label}
              onClick={() => setTab(label)}
            >
              {label}
            </Button>
          ))}
        </div>
        {(error || saveError) && (
          <p role="alert" className="text-sm text-destructive">
            {error || saveError}
          </p>
        )}
        {!entries && !error && (
          <p role="status" className="py-8 text-muted-foreground">
            Opening your books…
          </p>
        )}
        {entries && list.length === 0 && (
          <div className="py-10 text-center">
            <p className="font-hand text-2xl text-muted-foreground">
              {tab === "Read"
                ? "Your finished books will gather here."
                : "Make room for your next good book."}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose “Reading” or “Up next” on any book in your archive.
            </p>
            <Link
              to="/shelf/$cat"
              params={{ cat: "books" }}
              className="mt-3 inline-block min-h-11 py-2 text-primary underline"
            >
              Browse your books
            </Link>
          </div>
        )}
        {["Reading", "Up next", "Read", "Not started"].map((status) => {
          const group = list.filter((entry) => readingStatus(entry) === status);
          return (
            group.length > 0 && (
              <section key={status} className="space-y-2">
                <h2 className="font-display text-2xl">{status}</h2>
                {group.map((entry) => (
                  <div key={entry.id} className="space-y-1">
                    <EntryCard e={entry} />
                    <label className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                      Reading status
                      <select
                        aria-label={`Reading status for ${entry.title}`}
                        disabled={saving === entry.id}
                        value={readingStatus(entry)}
                        onChange={(event) => update(entry, event.target.value as ReadingStatus)}
                        className="min-h-11 max-w-full rounded-sm border border-input bg-card px-2 text-sm text-foreground"
                      >
                        {READING_STATUSES.map((value) => (
                          <option key={value}>{value}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                ))}
              </section>
            )
          );
        })}
        <Link
          to="/entry/$id"
          params={{ id: "new" }}
          search={{ cat: "books" }}
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 font-display text-lg font-semibold text-primary-foreground"
        >
          + Add a book
        </Link>
      </div>
    </AppShell>
  );
}
