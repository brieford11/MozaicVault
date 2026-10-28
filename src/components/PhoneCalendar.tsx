import { useMemo, useState } from "react";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadArchive } from "@/lib/archive-export";
import { eventsToCalendar, type ArchiveEvent } from "@/lib/calendar-events";

export function PhoneCalendar({ events }: { events: ArchiveEvent[] }) {
  const [status, setStatus] = useState("");
  const file = useMemo(
    () =>
      events.length
        ? new File([eventsToCalendar(events)], "mozaic-vault-calendar.ics", {
            type: "text/calendar",
          })
        : null,
    [events],
  );
  const add = async () => {
    if (!file) return;
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Add to your calendar" });
        setStatus(
          "Choose your calendar app to import the event. Changes here won’t update an imported event.",
        );
      } else {
        downloadArchive(file);
        setStatus(
          "Calendar file downloaded. Open it in your calendar app to import the event. Changes here won’t update it automatically.",
        );
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setStatus("Sharing was unavailable. Use Download calendar file below.");
    }
  };
  return (
    <div className="space-y-2">
      <Button variant="outline" size="sm" disabled={!file} onClick={add}>
        <CalendarPlus className="mr-2 h-4 w-4" />
        Add to phone calendar
      </Button>
      {status && (
        <>
          <p role="status" className="text-xs text-muted-foreground">
            {status}
          </p>
          {file && (
            <button
              className="min-h-11 text-sm text-primary underline"
              onClick={() => downloadArchive(file)}
            >
              Download calendar file
            </button>
          )}
        </>
      )}
    </div>
  );
}
