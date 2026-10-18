import { BookOpen, Film, Tv, Disc3, Disc, CassetteTape, Music2, TentTree, Drama, Sparkles, Plane, House, Trees, Flower2, Coffee, Heart, LibraryBig, Map, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = { books: BookOpen, films: Film, tvshows: Tv, vinyl: Disc3, cds: Disc, cassettes: CassetteTape, concerts: Music2, festivals: TentTree, shows: Drama, events: Sparkles, travels: Plane, places: House, thirdplaces: Trees, fragrances: Flower2, brews: Coffee, favourites: Heart, cabinet: LibraryBig, atlas: Map };

export function ArchiveIcon({ category, className }: { category: string; className?: string }) {
  const Icon = icons[category] ?? Flower2;
  return <span aria-hidden="true" className={cn("inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brass/30 bg-brass/10 text-brass", className)}><Icon className="h-5 w-5" strokeWidth={1.5} /></span>;
}