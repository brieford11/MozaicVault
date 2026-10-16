import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { db, type Entry } from "@/lib/db";
import { dueReminders } from "@/lib/reminders";

export function LocalReminders() {
  const [due, setDue] = useState<Entry[]>([]);
  useEffect(() => {
    let active = true;
    let checking = false;
    const check = async () => {
      if (checking) return;
      checking = true;
      try {
        const reminders = dueReminders(await db.all(), Date.now());
        for (const entry of reminders) {
          if (!active || !entry.reminder) return;
          await db.put({ ...entry, reminder: { ...entry.reminder, firedAt: Date.now() } });
          if ("Notification" in window && Notification.permission === "granted") {
            try { new Notification("Mozaic Vault", { body: entry.title || "Upcoming memory", tag: entry.id }); } catch { /* The local banner remains available. */ }
          }
        }
        if (active && reminders.length) setDue((previous) => [...previous, ...reminders]);
      } catch { /* Retry local storage on the next interval. */ }
      finally { checking = false; }
    };
    void check();
    const interval = window.setInterval(check, 10_000);
    window.addEventListener("focus", check);
    return () => { active = false; clearInterval(interval); window.removeEventListener("focus", check); };
  }, []);
  if (!due.length) return null;
  return <aside aria-label="Due reminders" className="fixed inset-x-3 top-3 z-50 mx-auto max-w-md space-y-2 rounded-md border border-primary bg-card p-3 shadow-lg">
    {due.map((entry) => <div key={entry.id} className="flex items-center gap-2"><Bell className="size-4 shrink-0 text-primary" /><Link className="min-w-0 flex-1 truncate text-foreground" to="/entry/$id" params={{ id: entry.id }}>{entry.title || "Upcoming memory"}</Link><Button size="icon" variant="ghost" aria-label={`Dismiss ${entry.title || "reminder"}`} onClick={() => setDue((items) => items.filter((item) => item.id !== entry.id))}><X /></Button></div>)}
  </aside>;
}