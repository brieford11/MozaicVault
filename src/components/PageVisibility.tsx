import { ArrowUp, ArrowDown, SlidersHorizontal, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CATEGORIES, DRAWERS } from "@/lib/categories";
import { toggleHiddenPage, usePageVisibility } from "@/lib/page-visibility";
import { ArchiveIcon } from "./ArchiveIcon";
import { CABINET_COLORS, moveCabinet, useCabinets } from "@/lib/cabinet-preferences";

export function PageVisibility() {
  const { hidden, ready, error, update } = usePageVisibility();
  const { cabinets, ready: cabinetsReady, error: cabinetError, update: updateCabinets } = useCabinets();
  return <Dialog>
    <DialogTrigger asChild><Button variant="ghost" size="icon" aria-label="Customize pages" title="Customize pages" className="border border-brass/40 bg-background/80 text-primary"><SlidersHorizontal /></Button></DialogTrigger>
    <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-md">
      <DialogTitle className="text-2xl">Your cabinets</DialogTitle>
      <DialogDescription>Choose which pages to show. Hidden pages keep all their memories.</DialogDescription>
      {cabinets.map((cabinet, index) => <fieldset key={cabinet.id} className="space-y-2 border-b border-border pb-4"><legend className="mb-2 font-display text-xl text-primary">{DRAWERS.find((drawer) => drawer.id === cabinet.id)?.name}</legend>
        <div className="flex items-center gap-1">
          <input aria-label={`Cabinet title ${cabinet.id}`} defaultValue={cabinet.title} key={`${cabinet.id}-${cabinet.title}`} maxLength={60} disabled={!cabinetsReady} onBlur={(ev) => { if (ev.target.value !== cabinet.title) updateCabinets(cabinets.map((item) => item.id === cabinet.id ? { ...item, title: ev.target.value } : item)); }} className="min-w-0 flex-1 rounded-sm border border-input bg-background px-2 py-2" />
          <Button variant="ghost" size="icon" title={`Move ${cabinet.title} up`} aria-label={`Move ${cabinet.title} up`} disabled={!cabinetsReady || index === 0} onClick={() => updateCabinets(moveCabinet(cabinets, cabinet.id, -1))}><ArrowUp /></Button>
          <Button variant="ghost" size="icon" title={`Move ${cabinet.title} down`} aria-label={`Move ${cabinet.title} down`} disabled={!cabinetsReady || index === cabinets.length - 1} onClick={() => updateCabinets(moveCabinet(cabinets, cabinet.id, 1))}><ArrowDown /></Button>
        </div>
        <div className="flex gap-2" role="group" aria-label={`${cabinet.title} color`}>{CABINET_COLORS.map((color) => <Button key={color.id} variant="ghost" size="icon" disabled={!cabinetsReady} title={color.name} aria-label={`${cabinet.title}: ${color.name}`} aria-pressed={color.id === cabinet.color} data-cabinet-color={color.id} className="cabinet-swatch rounded-full border-2 border-border" onClick={() => updateCabinets(cabinets.map((item) => item.id === cabinet.id ? { ...item, color: color.id } : item))}>{color.id === cabinet.color && <Check />}</Button>)}</div>
        {CATEGORIES.filter((c) => c.drawer === cabinet.id).map((c) => <label key={c.id} className="flex cursor-pointer items-center gap-3 py-1.5"><ArchiveIcon category={c.id} /><span className="flex-1">{c.name}</span><input type="checkbox" aria-label={`Show ${c.name}`} checked={!hidden.includes(c.id)} disabled={!ready} onChange={() => update(toggleHiddenPage(hidden, c.id))} className="h-4 w-4 accent-primary" /></label>)}
      </fieldset>)}
      <Button variant="outline" disabled={!ready || hidden.length === 0} onClick={() => update([])}>Show all pages</Button>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {cabinetError && <p role="alert" className="text-sm text-destructive">{cabinetError}</p>}
    </DialogContent>
  </Dialog>;
}