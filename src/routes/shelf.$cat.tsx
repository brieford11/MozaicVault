import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, BackLink } from "@/components/AppShell";
import { EntryCard } from "@/components/EntryCard";
import { getCategory } from "@/lib/categories";
import { useEntries } from "@/lib/db";

export const Route = createFileRoute("/shelf/$cat")({
  loader: ({ params }) => { const c = getCategory(params.cat); if (!c) throw notFound(); return { name: c.name }; },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Shelf"} — Bothy` },
      { name: "description", content: `Your private ${loaderData?.name ?? ""} collection.` },
      { property: "og:title", content: `${loaderData?.name ?? "Shelf"} — Bothy` },
      { property: "og:description", content: "A drawer in your private archive." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shelf,
});

type Sort = "recent" | "rating" | "az";

function Shelf() {
  const { cat } = Route.useParams();
  const c = getCategory(cat)!;
  const { entries } = useEntries();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const [wantOnly, setWantOnly] = useState(false);
  const list = (entries ?? [])
    .filter((e) => e.category === cat)
    .filter((e) => !wantOnly || e.want)
    .filter((e) => !q || JSON.stringify([e.title, e.fields, e.notes]).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => sort === "rating" ? b.rating - a.rating : sort === "az" ? a.title.localeCompare(b.title) : b.updatedAt - a.updatedAt);

  return (
    <AppShell title={c.name} back={<BackLink />}>
      <div className="space-y-3 px-4">
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search this drawer…"
            className="flex-1 rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-md border border-input bg-card px-2 text-sm">
            <option value="recent">Recent</option><option value="rating">Rating</option><option value="az">A–Z</option>
          </select>
        </div>
        {c.wantable && (
          <button onClick={() => setWantOnly(!wantOnly)}
            className={`rounded-full border px-3 py-1 font-display text-sm ${wantOnly ? "border-primary bg-secondary text-primary" : "border-border text-muted-foreground"}`}>
            {wantOnly ? "✦ Want list" : "☆ Want list"}
          </button>
        )}
        {entries && list.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-5xl text-muted-foreground/50">{c.glyph}</p>
            <p className="mt-3 font-hand text-2xl text-muted-foreground">an empty drawer, waiting.</p>
          </div>
        )}
        <div className="space-y-3">{list.map((e) => <EntryCard key={e.id} e={e} />)}</div>
      </div>
      <Link to="/entry/$id" params={{ id: "new" }} search={{ cat }}
        className="fixed bottom-20 right-[max(1rem,calc(50%-13rem))] z-30 rounded-full bg-primary px-5 py-3 font-display text-lg font-semibold text-primary-foreground shadow-lg">
        + Add {c.singular}
      </Link>
    </AppShell>
  );
}
