import { Plane, TrainFront, Ship, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JourneyLeg } from "@/lib/db";
import { blankLeg } from "@/lib/reminders";

const modes = [{ mode: "Flight", Icon: Plane }, { mode: "Train", Icon: TrainFront }, { mode: "Boat", Icon: Ship }] as const;

export function JourneyPlans({ legs, onChange }: { legs: JourneyLeg[]; onChange: (legs: JourneyLeg[]) => void }) {
  const update = (id: string, patch: Partial<JourneyLeg>) => onChange(legs.map((leg) => leg.id === id ? { ...leg, ...patch } : leg));
  return <div className="space-y-4">
    {legs.map((leg, i) => <div key={leg.id} className="space-y-3 border-b border-ink-soft/30 pb-4">
      <div className="flex flex-wrap items-center gap-1">
        {modes.map(({ mode, Icon }) => <Button key={mode} variant="ghost" size="sm" aria-pressed={leg.mode === mode} onClick={() => update(leg.id, { mode })} className={leg.mode === mode ? "bg-heather/15 text-heather" : "text-ink-soft"}><Icon />{mode}</Button>)}
        <Button variant="ghost" size="icon" className="ml-auto text-ink-soft" title="Remove transport" aria-label={`Remove transport ${i + 1}`} onClick={() => onChange(legs.filter((l) => l.id !== leg.id))}><Trash2 /></Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {([{ key: "operator", label: "Operator" }, { key: "number", label: `${leg.mode} number` }, { key: "from", label: "From" }, { key: "to", label: "To" }, { key: "departure", label: "Departure", type: "datetime-local" }, { key: "arrival", label: "Arrival", type: "datetime-local" }, { key: "booking", label: "Booking reference" }] as const).map((field) => <label key={field.key} className={`min-w-0 text-xs uppercase text-ink-soft ${field.key === "departure" || field.key === "arrival" || field.key === "booking" ? "col-span-2" : ""}`}>
          {field.label}<input aria-label={`${field.label} ${i + 1}`} type={"type" in field ? field.type : "text"} value={leg[field.key]} onChange={(ev) => update(leg.id, { [field.key]: ev.target.value })} className="field min-w-0 text-base normal-case" />
        </label>)}
      </div>
      <label className="block text-xs uppercase text-ink-soft">Transport notes<textarea aria-label={`Transport notes ${i + 1}`} rows={2} value={leg.notes} onChange={(ev) => update(leg.id, { notes: ev.target.value })} className="field text-base normal-case" /></label>
    </div>)}
    <Button variant="ghost" className="border border-ink-soft/40 text-ink" onClick={() => onChange([...legs, blankLeg()])}><Plus />Add transport</Button>
  </div>;
}