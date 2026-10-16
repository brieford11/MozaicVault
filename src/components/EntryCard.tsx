import { Link } from "@tanstack/react-router";
import type { Entry } from "@/lib/db";
import { getCategory } from "@/lib/categories";
import { getEntryTitle } from "@/lib/entry-details";
import { StarRating } from "./StarRating";

export function EntryCard({ e, showCat }: { e: Entry; showCat?: boolean }) {
  const c = getCategory(e.category);
  const music = c?.music && e.fields["creator"];
  const heading = music ? e.fields["creator"] : getEntryTitle(e) || "Untitled";
  const sub = music
    ? [e.title, e.fields["year"]].filter(Boolean).join(" · ")
    : [e.category === "concerts" ? undefined : e.fields["creator"], e.fields["country"], e.fields["city"], e.fields["venue"], e.fields["year"] || e.fields["date"], e.fields["time"]].filter(Boolean).join(" · ");
  return (
    <Link to="/entry/$id" params={{ id: e.id }} className="page block rounded-sm p-4 transition-transform active:scale-[0.99]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {showCat && <p className="stamp mb-1 inline-block px-1.5 text-[10px] text-heather">{c?.singular}</p>}
          {e.want && <p className="stamp mb-1 ml-1 inline-block px-1.5 text-[10px] text-sea">want</p>}
          <h3 className="truncate text-xl font-semibold leading-tight">{heading}</h3>
          {sub && <p className="truncate text-sm text-ink-soft">{sub}</p>}
        </div>
        {e.image ? <img src={e.image} alt="" className="h-14 w-14 shrink-0 rounded-sm object-cover shadow" /> : <span className="text-2xl text-ink-soft/60">{c?.glyph}</span>}
      </div>
      <div className="mt-2 flex items-center justify-between">
        {e.rating > 0 ? <StarRating value={e.rating} size="sm" /> : <span />}
        <span className="text-xs text-ink-soft">{e.notes && "✎ "}{e.audio.length > 0 && `♪${e.audio.length}`}</span>
      </div>
      {e.notes && <p className="mt-1 line-clamp-2 font-hand text-lg leading-snug text-ink-soft">{e.notes}</p>}
    </Link>
  );
}
