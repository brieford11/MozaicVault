import { useState } from "react";
import { Pencil, ArrowUp, ArrowDown, Archive, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookshelfOptions } from "@/components/BookshelfOptions";
import {
  CABINET_COLORS,
  moveVisibleCabinet,
  type CabinetPreference,
} from "@/lib/cabinet-preferences";
import {
  canRemoveShelf,
  shelfHiddenKey,
  type BookshelfPreference,
} from "@/lib/bookshelf-preferences";

export function ShelfEditor({
  cabinet,
  cabinets,
  selection,
  hidden,
  disabled,
  onCabinets,
  onSelection,
  onHidden,
}: {
  cabinet: CabinetPreference;
  cabinets: CabinetPreference[];
  selection: BookshelfPreference;
  hidden: string[];
  disabled: boolean;
  onCabinets: (value: CabinetPreference[]) => Promise<void>;
  onSelection: (value: BookshelfPreference) => Promise<void>;
  onHidden: (value: string[]) => Promise<void>;
}) {
  const [name, setName] = useState(cabinet.title);
  const [open, setOpen] = useState(false);
  const removable = canRemoveShelf(selection, hidden, cabinet.id);
  const active = selection.shelves.includes(cabinet.id);
  const visible = cabinets
    .filter(
      (item) => selection.shelves.includes(item.id) && !hidden.includes(shelfHiddenKey(item.id)),
    )
    .map((item) => item.id);
  const position = visible.indexOf(cabinet.id);
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value) setName(cabinet.title);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Edit shelf ${cabinet.title}`}
          title="Edit shelf name, color and order"
          className="shelf-edit shrink-0 text-parchment"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto">
        <DialogTitle className="text-2xl">Edit {cabinet.title}</DialogTitle>
        <DialogDescription>
          Set its name, color and position. Removing a shelf keeps its entries.
        </DialogDescription>
        <label className="space-y-1 text-sm">
          Shelf name
          <input
            aria-label="Shelf name"
            value={name}
            maxLength={60}
            disabled={disabled}
            onChange={(event) => setName(event.target.value)}
            className="block min-h-11 w-full rounded-md border border-input bg-background px-3"
          />
        </label>
        <Button
          size="sm"
          disabled={disabled || !name.trim() || name.trim() === cabinet.title}
          onClick={() =>
            onCabinets(
              cabinets.map((item) =>
                item.id === cabinet.id ? { ...item, title: name.trim() } : item,
              ),
            )
          }
        >
          Save name
        </Button>
        <fieldset>
          <legend className="mb-2 font-display text-lg">Shelf color</legend>
          <div className="grid grid-cols-3 gap-2">
            {CABINET_COLORS.map((color) => (
              <button
                key={color.id}
                disabled={disabled}
                aria-pressed={cabinet.color === color.id}
                aria-label={`${cabinet.title}: ${color.name}`}
                onClick={() =>
                  onCabinets(
                    cabinets.map((item) =>
                      item.id === cabinet.id ? { ...item, color: color.id } : item,
                    ),
                  )
                }
                className="flex min-h-12 flex-col items-center gap-1 rounded-md border border-border p-2 text-xs"
              >
                <span
                  data-cabinet-color={color.id}
                  className="cabinet-swatch flex h-6 w-8 items-center justify-center rounded-sm"
                >
                  {cabinet.color === color.id && <Check className="h-4 w-4" />}
                </span>
                {color.name}
              </button>
            ))}
          </div>
        </fieldset>
        {active && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={disabled || position <= 0}
              onClick={() => onCabinets(moveVisibleCabinet(cabinets, cabinet.id, -1, visible))}
            >
              <ArrowUp className="mr-1 h-4 w-4" />
              Move up
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled || position < 0 || position === visible.length - 1}
              onClick={() => onCabinets(moveVisibleCabinet(cabinets, cabinet.id, 1, visible))}
            >
              <ArrowDown className="mr-1 h-4 w-4" />
              Move down
            </Button>
          </div>
        )}
        <details>
          <summary className="flex min-h-11 cursor-pointer items-center justify-between font-display text-xl">
            Choose subshelves
            <span aria-hidden="true" className="details-chevron">
              ⌄
            </span>
          </summary>
          <BookshelfOptions
            shelf={cabinet.id}
            selection={selection}
            hidden={hidden}
            disabled={disabled}
            onUpdate={onSelection}
            onHide={(id) => onHidden([...hidden, id])}
          />
        </details>
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          {active && (
            <Button
              variant="outline"
              disabled={disabled || !removable}
              onClick={async () => {
                await onSelection({
                  ...selection,
                  shelves: selection.shelves.filter((id) => id !== cabinet.id),
                });
                setOpen(false);
              }}
            >
              <Minus className="mr-2 h-4 w-4" />
              Remove from bookshelf
            </Button>
          )}
          <Button
            variant="outline"
            disabled={disabled || !removable}
            onClick={async () => {
              await onHidden([...hidden, shelfHiddenKey(cabinet.id)]);
              setOpen(false);
            }}
          >
            <Archive className="mr-2 h-4 w-4" />
            Move to hidden cabinet
          </Button>
          {!removable && (
            <p className="text-xs text-muted-foreground">
              Keep at least one shelf on your bookshelf. Add another before removing or hiding this
              one.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
