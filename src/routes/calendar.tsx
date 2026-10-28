import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Calendar } from "@/components/ui/calendar";
import { PhoneCalendar } from "@/components/PhoneCalendar";
import { Button } from "@/components/ui/button";
import { useEntries } from "@/lib/db";
import { archiveEvents, dayKey, eventsOnDay, type ArchiveEvent } from "@/lib/calendar-events";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Mozaic Vault" }] }),
  component: ArchiveCalendar,
});
function ArchiveCalendar() {
  const { entries, error } = useEntries();
  const [selected, setSelected] = useState(new Date());
  const [month, setMonth] = useState(new Date());
  const [kind, setKind] = useState("all");
  const events = useMemo(
    () =>
      archiveEvents(entries ?? []).filter(
        (event) =>
          kind === "all" ||
          (kind === "health"
            ? ["Doctor’s Appointments & Symptoms", "Follow-up"].includes(event.kind)
            : kind === "travel"
              ? ["Journeys", "Places Visited", "Social Spaces", "Travel leg"].includes(event.kind)
              : ![
                  "Doctor’s Appointments & Symptoms",
                  "Follow-up",
                  "Journeys",
                  "Places Visited",
                  "Social Spaces",
                  "Travel leg",
                ].includes(event.kind)),
      ),
    [entries, kind],
  );
  const dayEvents = useMemo(() => eventsOnDay(events, selected), [events, selected]);
  const today = dayKey(new Date());
  const upcoming = events.filter((event) => (event.end ?? event.start).slice(0, 10) >= today);
  const eventCard = (event: ArchiveEvent) => (
    <Link
      key={event.id}
      to="/entry/$id"
      params={{ id: event.entryId }}
      className="block rounded-md border border-border bg-card px-3 py-3"
    >
      <span className="block break-words font-display text-xl font-semibold">{event.title}</span>
      <span className="mt-1 block text-xs text-muted-foreground">
        {event.allDay
          ? "All day"
          : new Date(event.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        {event.location && ` · ${event.location}`}
        <span className="block">{event.kind}</span>
      </span>
    </Link>
  );
  return (
    <AppShell title="Calendar">
      <div className="space-y-4 px-4 pb-6">
        <div className="flex items-center justify-between gap-2">
          <select
            aria-label="Calendar filter"
            value={kind}
            onChange={(event) => setKind(event.target.value)}
            className="min-h-11 rounded-md border border-input bg-card px-2 text-sm"
          >
            <option value="all">All dates</option>
            <option value="health">Appointments</option>
            <option value="travel">Travel</option>
            <option value="other">Events & reminders</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const date = new Date();
              setSelected(date);
              setMonth(date);
            }}
          >
            Today
          </Button>
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {!entries && !error && (
          <p role="status" className="text-sm text-muted-foreground">
            Opening your dates…
          </p>
        )}
        <Calendar
          mode="single"
          required
          selected={selected}
          onSelect={setSelected}
          month={month}
          onMonthChange={setMonth}
          modifiers={{ scheduled: (date) => eventsOnDay(events, date).length > 0 }}
          modifiersClassNames={{ scheduled: "calendar-has-event" }}
          className="mx-auto w-full rounded-md border border-brass/30 bg-card [--cell-size:2.2rem]"
        />
        <p className="text-xs text-muted-foreground">
          Underlined days have a recorded date. Past and future dates stay available.
        </p>
        <section className="space-y-2">
          <h2 className="font-display text-2xl">
            {selected.toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h2>
          {dayEvents.map(eventCard)}
          {entries && dayEvents.length === 0 && (
            <p className="py-3 text-sm text-muted-foreground">Nothing recorded for this day.</p>
          )}
        </section>
        <details className="rounded-sm border border-brass/30 p-3">
          <summary className="flex min-h-11 cursor-pointer items-center justify-between font-display text-xl">
            Add a date
            <span aria-hidden="true" className="details-chevron">
              ⌄
            </span>
          </summary>
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              { cat: "health", label: "Appointment" },
              { cat: "travels", label: "Travel" },
              { cat: "events", label: "Event" },
            ].map((item) => (
              <Link
                key={item.cat}
                to="/entry/$id"
                params={{ id: "new" }}
                search={{ cat: item.cat, date: dayKey(selected) }}
                className="inline-flex min-h-11 items-center rounded-md border border-brass/40 px-3 text-sm text-primary"
              >
                + {item.label}
              </Link>
            ))}
          </div>
        </details>
        <details className="rounded-sm border border-brass/30 p-3">
          <summary className="flex min-h-11 cursor-pointer items-center justify-between font-display text-xl">
            Use your phone calendar?
            <span aria-hidden="true" className="details-chevron">
              ⌄
            </span>
          </summary>
          <p className="mb-3 text-sm text-muted-foreground">
            Add this day’s events to your phone calendar when you choose. Your calendar app may
            store them outside this archive. This is an event import; it doesn’t sync changes
            automatically.
          </p>
          <PhoneCalendar events={dayEvents} />
        </details>
        <details className="border-t border-border pt-2">
          <summary className="flex min-h-11 cursor-pointer items-center justify-between font-display text-xl">
            Current & upcoming dates
            <span aria-hidden="true" className="details-chevron">
              ⌄
            </span>
          </summary>
          <div className="space-y-3 pt-2">
            {upcoming.map((event) => (
              <div key={event.id}>
                <p className="mb-1 text-xs text-primary">
                  {event.start.slice(0, 10)}
                  {event.end && ` – ${event.end.slice(0, 10)}`}
                </p>
                {eventCard(event)}
              </div>
            ))}
            {entries && upcoming.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No upcoming dates yet. Add an appointment, journey, event, or reminder.
              </p>
            )}
          </div>
        </details>
      </div>
    </AppShell>
  );
}
