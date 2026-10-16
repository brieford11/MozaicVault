import { cn } from "@/lib/utils";

export function StarRating({ value, onChange, size = "md" }: { value: number; onChange?: (v: number) => void; size?: "sm" | "md" }) {
  return (
    <div className="flex items-center gap-0.5" role={onChange ? "radiogroup" : undefined} aria-label={`${value} of 10 stars`}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const on = n <= value;
        const star = <span className={cn(on ? "text-brass" : "text-ink-soft/30", size === "sm" ? "text-xs" : "text-xl")}>★</span>;
        return onChange ? (
          <button key={n} type="button" aria-label={`${n} stars`} onClick={() => onChange(n === value ? 0 : n)} className="p-0.5 leading-none">
            {star}
          </button>
        ) : <span key={n}>{star}</span>;
      })}
      {onChange && <span className="ml-2 font-display text-sm text-ink-soft">{value}/10</span>}
    </div>
  );
}
