import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/categories";
import { toggleSelection, type BookshelfPreference } from "@/lib/bookshelf-preferences";

export function BookshelfOptions({
  shelf,
  selection,
  hidden,
  disabled,
  onUpdate,
  onHide,
}: {
  shelf: string;
  selection: BookshelfPreference;
  hidden: string[];
  disabled: boolean;
  onUpdate: (next: BookshelfPreference) => void;
  onHide: (id: string) => void;
}) {
  const options = CATEGORIES.filter((item) => item.drawer === shelf && !hidden.includes(item.id));
  return (
    <div className="space-y-1">
      {options.map((item) => (
        <div key={item.id} className="flex items-center gap-2 border-b border-current/10 py-1">
          <label className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={selection.subshelves.includes(item.id)}
              disabled={disabled}
              aria-label={`Show ${item.name}`}
              onChange={() =>
                onUpdate({
                  ...selection,
                  subshelves: toggleSelection(selection.subshelves, item.id),
                })
              }
              className="h-4 w-4 shrink-0 accent-primary"
            />
            <span className="text-sm">{item.name}</span>
          </label>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            aria-label={`Hide ${item.name}`}
            title={`Move ${item.name} to hidden cabinet`}
            onClick={() => onHide(item.id)}
          >
            <Archive className="mr-1 h-4 w-4" />
            <span className="text-xs">Cabinet</span>
          </Button>
        </div>
      ))}
      {options.length === 0 && (
        <p className="py-3 text-sm">All subshelves are in your hidden cabinet.</p>
      )}
    </div>
  );
}
