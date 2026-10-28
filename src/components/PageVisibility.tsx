import { SlidersHorizontal, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HiddenCabinet } from "@/components/HiddenCabinet";
import { ShelfEditor } from "@/components/ShelfEditor";
import { usePageVisibility } from "@/lib/page-visibility";
import { CABINET_COLORS, useCabinets } from "@/lib/cabinet-preferences";
import {
  canRemoveShelf,
  shelfHiddenKey,
  toggleSelection,
  useBookshelf,
} from "@/lib/bookshelf-preferences";

export function PageVisibility() {
  const { hidden, ready, saving: hiddenSaving, error, update } = usePageVisibility();
  const {
    cabinets,
    ready: cabinetsReady,
    error: cabinetError,
    update: updateCabinets,
  } = useCabinets();
  const {
    selection,
    ready: selectionReady,
    saving,
    error: selectionError,
    update: updateSelection,
  } = useBookshelf();
  const disabled = !ready || !cabinetsReady || !selectionReady || saving || hiddenSaving;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Customize bookshelf"
          title="Customize bookshelf"
          className="border border-brass/40 bg-background/80 text-primary"
        >
          <SlidersHorizontal />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-md">
        <DialogTitle className="text-2xl">Your bookshelf</DialogTitle>
        <DialogDescription>
          Choose your shelves. Keep at least one; add as many of the available shelves as you like.
        </DialogDescription>
        <details>
          <summary className="flex min-h-11 cursor-pointer items-center justify-between font-display text-xl">
            Bookshelf color
            <span aria-hidden="true" className="details-chevron">
              ⌄
            </span>
          </summary>
          <div className="grid grid-cols-3 gap-2 pt-2">
            {CABINET_COLORS.map((color) => (
              <button
                key={color.id}
                disabled={disabled}
                aria-pressed={selection.frameColor === color.id}
                aria-label={`Bookshelf: ${color.name}`}
                onClick={() => updateSelection({ ...selection, frameColor: color.id })}
                className="flex min-h-12 flex-col items-center gap-1 rounded-md border border-border p-2 text-xs"
              >
                <span
                  data-cabinet-color={color.id}
                  className="cabinet-swatch flex h-6 w-8 items-center justify-center rounded-sm"
                >
                  {selection.frameColor === color.id && <Check className="h-4 w-4" />}
                </span>
                {color.name}
              </button>
            ))}
          </div>
        </details>
        <div className="divide-y divide-border">
          {cabinets
            .filter((cabinet) => !hidden.includes(shelfHiddenKey(cabinet.id)))
            .map((cabinet) => (
              <div key={cabinet.id} className="flex items-center gap-2 py-1">
                <label className="flex min-h-12 min-w-0 flex-1 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    aria-label={`Show shelf ${cabinet.title}`}
                    checked={selection.shelves.includes(cabinet.id)}
                    disabled={disabled || !canRemoveShelf(selection, hidden, cabinet.id)}
                    onChange={() =>
                      updateSelection({
                        ...selection,
                        shelves: toggleSelection(selection.shelves, cabinet.id),
                        expanded: selection.expanded.includes(cabinet.id)
                          ? selection.expanded
                          : [...selection.expanded, cabinet.id],
                      })
                    }
                    className="h-4 w-4 shrink-0 accent-primary"
                  />
                  <span className="break-words text-sm">{cabinet.title}</span>
                </label>
                <ShelfEditor
                  cabinet={cabinet}
                  cabinets={cabinets}
                  selection={selection}
                  hidden={hidden}
                  disabled={disabled}
                  onCabinets={updateCabinets}
                  onSelection={updateSelection}
                  onHidden={update}
                />
              </div>
            ))}
        </div>
        <HiddenCabinet
          hidden={hidden}
          cabinets={cabinets}
          disabled={disabled}
          onRestore={(id) => update(hidden.filter((item) => item !== id))}
        />
        <p className="text-xs text-muted-foreground">
          No entry limit. Available space depends on this device’s storage.
        </p>
        {[error, cabinetError, selectionError].filter(Boolean).map((message) => (
          <p key={message} role="alert" className="text-sm text-destructive">
            {message}
          </p>
        ))}
      </DialogContent>
    </Dialog>
  );
}
