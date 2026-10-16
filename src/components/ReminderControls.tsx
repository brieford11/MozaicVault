import { useState } from "react";
import { Bell, CalendarPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Entry, Reminder } from "@/lib/db";
import { calendarReminder } from "@/lib/reminders";
import { downloadArchive } from "@/lib/archive-export";

export function ReminderControls({ entry, onChange }: { entry: Entry; onChange: (value: Reminder | undefined) => void }) {
  const [status, setStatus] = useState("");
  const requestAlerts = async () => {
    if (!("Notification" in window)) { setStatus("Browser alerts aren't available here. Use a calendar reminder instead."); return; }
    try {
      const permission = await Notification.requestPermission();
      setStatus(permission === "granted" ? "Browser alerts enabled while Mozaic Vault is open." : "Browser alerts aren't enabled. Calendar reminders are still available.");
    } catch { setStatus("Browser alerts aren't available here. Use a calendar reminder instead."); }
  };
  return <div className="space-y-3">
    <label className="block text-xs uppercase text-ink-soft">Remind me at
      <input type="datetime-local" aria-label="Remind me at" value={entry.reminder?.at ?? ""} onChange={(ev) => onChange(ev.target.value ? { at: ev.target.value } : undefined)} className="field min-w-0 text-base normal-case" />
    </label>
    <p className="text-xs text-ink-soft">Save this page to keep the reminder. Browser alerts need Mozaic Vault open; add it to your calendar for reminders when closed.</p>
    <div className="flex flex-wrap gap-2">
      <Button variant="ghost" size="sm" className="border border-ink-soft/40 text-ink" onClick={requestAlerts}><Bell />Enable alerts</Button>
      <Button variant="ghost" size="sm" className="border border-ink-soft/40 text-ink" disabled={!entry.reminder?.at} onClick={() => {
        try { downloadArchive(new File([calendarReminder(entry)], "mozaic-vault-reminder.ics", { type: "text/calendar" })); setStatus("Calendar file downloaded. Open it in your calendar to add the reminder."); }
        catch (err) { setStatus(err instanceof Error ? err.message : "Could not prepare the reminder."); }
      }}><CalendarPlus />Add to calendar</Button>
      {entry.reminder && <Button variant="ghost" size="sm" className="text-ink-soft" onClick={() => onChange(undefined)}><X />Clear</Button>}
    </div>
    {status && <p role="status" className="text-sm text-ink-soft">{status}</p>}
  </div>;
}