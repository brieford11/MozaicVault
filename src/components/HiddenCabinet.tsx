import { Eye, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES, DRAWERS } from "@/lib/categories";
import { shelfHiddenKey } from "@/lib/bookshelf-preferences";
import type { CabinetPreference } from "@/lib/cabinet-preferences";

export function HiddenCabinet({
  hidden,
  cabinets,
  disabled,
  onRestore,
}: {
  hidden: string[];
  cabinets: CabinetPreference[];
  disabled: boolean;
  onRestore: (id: string) => void;
}) {
  const shelves = cabinets.filter((item) => hidden.includes(shelfHiddenKey(item.id)));
  const subshelves = CATEGORIES.filter((item) => hidden.includes(item.id));
  const total = shelves.length + subshelves.length;
  return (
    <details className="rounded-sm border border-brass/30 bg-card/60 px-4 py-2">
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 font-display text-xl text-primary">
        <KeyRound className="h-4 w-4" />
        <span className="flex-1">Hidden cabinet</span>
        <span className="font-sans text-xs text-muted-foreground">{total}</span>
        <span aria-hidden="true" className="details-chevron">
          ⌄
        </span>
      </summary>
      <p className="py-2 text-sm text-muted-foreground">
        Tucked away, never deleted. Restore an option to make it available again. Your previous
        choices are kept.
      </p>
      {total === 0 && (
        <p className="pb-3 font-hand text-xl text-muted-foreground">Nothing tucked away yet.</p>
      )}
      {shelves.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-2 border-t border-border py-2"
        >
          <span className="min-w-0 break-words text-sm">
            {item.title}
            <span className="block text-xs text-muted-foreground">Shelf</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            aria-label={`Restore ${item.title}`}
            onClick={() => onRestore(shelfHiddenKey(item.id))}
          >
            <Eye className="mr-1 h-4 w-4" />
            Restore
          </Button>
        </div>
      ))}
      {subshelves.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-2 border-t border-border py-2"
        >
          <span className="min-w-0 break-words text-sm">
            {item.name}
            <span className="block text-xs text-muted-foreground">
              {DRAWERS.find((shelf) => shelf.id === item.drawer)?.name}
            </span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            aria-label={`Restore ${item.name}`}
            onClick={() => onRestore(item.id)}
          >
            <Eye className="mr-1 h-4 w-4" />
            Restore
          </Button>
        </div>
      ))}
    </details>
  );
}
