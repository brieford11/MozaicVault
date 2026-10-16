import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function StarRating({ value, onChange, size = "md" }: { value: number; onChange?: (v: number) => void; size?: "sm" | "md" }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5" role={onChange ? "radiogroup" : undefined} aria-label={`${value} of 10 stars`}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const full = n <= value;
        const half = !full && n - 0.5 <= value;
        return <span key={n} className={cn("relative inline-block shrink-0 leading-none", size === "sm" ? "h-3 w-3 text-xs" : "h-8 w-6 text-2xl")}>
          <span className="opacity-30">★</span>
          {(full || half) && <span className={cn("absolute left-0 top-0 overflow-hidden text-brass", half ? "w-1/2" : "w-full")}>★</span>}
          {onChange && [n - 0.5, n].map((rating, i) => <Button key={rating} type="button" variant="ghost" role="radio" aria-checked={value === rating} aria-label={`${rating} stars`} onClick={() => onChange(rating === value ? 0 : rating)} className={cn("absolute top-0 h-full w-1/2 rounded-none p-0", i === 0 ? "left-0" : "right-0")} />)}
        </span>;
      })}
      {onChange && <span className="ml-2 font-display text-sm text-ink-soft">{value}/10</span>}
    </div>
  );
}
