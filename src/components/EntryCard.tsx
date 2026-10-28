import { Link } from "@tanstack/react-router";
import type { Entry } from "@/lib/db";
import { ArchiveIcon } from "./ArchiveIcon";
import { getCategory, getListLabel } from "@/lib/categories";
import { getEntryTitle } from "@/lib/entry-details";
import { readingStatus } from "@/lib/reading";
import { StarRating } from "./StarRating";

export function EntryCard({ e, showCat }: { e: Entry; showCat?: boolean }) {
  const c = getCategory(e.category);
  const music = c?.music && e.fields["creator"];
  const heading = music ? e.fields["creator"] : getEntryTitle(e) || "Untitled";
  const sub = music
    ? [e.title, e.fields["year"]].filter(Boolean).join(" · ")
    : [
        e.category === "concerts" ? undefined : e.fields["creator"],
        e.fields["town"],
        e.fields["country"],
        e.fields["city"],
        e.fields["venue"],
        e.fields["year"] || e.fields["date"],
        e.fields["time"],
      ]
        .filter(Boolean)
        .join(" · ");
  return (
    <Link
      to="/entry/$id"
      params={{ id: e.id }}
      className="block rounded-md border border-border bg-card px-3 py-2 shadow-[var(--shadow-drawer)] transition-colors active:bg-secondary/40"
    >
      <div className="flex items-center gap-2.5">
        {e.image ? (
          <img src={e.image} alt="" className="h-9 w-9 shrink-0 rounded-sm object-cover" />
        ) : (
          <ArchiveIcon category={e.category} className="h-8 w-8" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-display text-lg font-semibold leading-tight">{heading}</h3>
            {e.category === "books" && readingStatus(e) !== "Not started" && (
              <span className="shrink-0 rounded-sm border border-brass/30 px-1 text-[10px] text-primary">
                {readingStatus(e)}
              </span>
            )}
            {e.want && (
              <span className="stamp shrink-0 px-1 text-[9px] text-primary">
                {getListLabel(e.category).replace(" List", "")}
              </span>
            )}
          </div>
          {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className="shrink-0">
          {e.rating > 0 && <StarRating value={e.rating} size="sm" />}
          <p className="text-right text-[10px] text-muted-foreground">
            {showCat && c ? `${c.singular} · ` : ""}
            {e.notes && "✎ "}
            {e.audio.length > 0 && `♪${e.audio.length}`}
          </p>
        </div>
      </div>
      {e.notes && (
        <p className="mt-0.5 truncate pl-8.5 font-hand text-base leading-snug text-muted-foreground">
          {e.notes}
        </p>
      )}
    </Link>
  );
}
