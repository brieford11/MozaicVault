import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CATEGORIES, DRAWERS } from "@/lib/categories";
import { toggleHiddenPage, usePageVisibility } from "@/lib/page-visibility";
import { ArchiveIcon } from "./ArchiveIcon";

export function PageVisibility() {
  const { hidden, ready, error, update } = usePageVisibility();
  return <Dialog>
    <DialogTrigger asChild><Button variant="ghost" size="icon" aria-label="Customize pages" title="Customize pages" className="border border-brass/40 bg-background/80 text-primary"><SlidersHorizontal /></Button></DialogTrigger>
    <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-md">
      <DialogTitle className="text-2xl">Your cabinet</DialogTitle>
      <DialogDescription>Choose which pages to show. Hidden pages keep all their memories.</DialogDescription>
      {DRAWERS.map((drawer) => <fieldset key={drawer.id} className="space-y-1"><legend className="mb-2 font-display text-xl text-primary">{drawer.name}</legend>
        {CATEGORIES.filter((c) => c.drawer === drawer.id).map((c) => <label key={c.id} className="flex cursor-pointer items-center gap-3 py-1.5"><ArchiveIcon category={c.id} /><span className="flex-1">{c.name}</span><input type="checkbox" aria-label={`Show ${c.name}`} checked={!hidden.includes(c.id)} disabled={!ready} onChange={() => update(toggleHiddenPage(hidden, c.id))} className="h-4 w-4 accent-primary" /></label>)}
      </fieldset>)}
      <Button variant="outline" disabled={!ready || hidden.length === 0} onClick={() => update([])}>Show all pages</Button>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </DialogContent>
  </Dialog>;
}