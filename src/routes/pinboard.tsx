import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEntries } from "@/lib/db";

export const Route = createFileRoute("/pinboard")({
  head: () => ({
    meta: [
      { title: "Third Places Pinboard — Bothy" },
      { name: "description", content: "A corkboard of your favourite cafés, walking paths and beautiful views." },
      { property: "og:title", content: "Third Places Pinboard — Bothy" },
      { property: "og:description", content: "Your corkboard of cafés, paths and views." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pinboard,
});

const TILT = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "rotate-0"];

function Pinboard() {
  const { entries } = useEntries();
  const pins = (entries ?? []).filter((e) => e.category === "thirdplaces");
  return (
    <AppShell title="Pinboard">
      <div className="mx-4 min-h-[60vh] rounded-md p-4" style={{ background: "var(--gradient-wood)", boxShadow: "inset 0 0 40px oklch(0 0 0 / 0.6)" }}>
        {pins.length === 0 && <p className="py-20 text-center font-hand text-2xl text-muted-foreground">pin your first café, path or view.</p>}
        <div className="grid grid-cols-2 gap-4">
          {pins.map((e, i) => (
            <Link key={e.id} to="/entry/$id" params={{ id: e.id }} className={`page relative block rounded-sm p-3 pt-5 ${TILT[i % TILT.length]}`}>
              <span className="absolute left-1/2 top-1 h-3 w-3 -translate-x-1/2 rounded-full bg-heather shadow" />
              <p className="text-[10px] uppercase tracking-widest text-ink-soft">{e.fields["kind"] || "Third place"}</p>
              <h3 className="text-lg font-semibold leading-tight">{e.title}</h3>
              {e.fields["country"] && <p className="text-xs text-ink-soft">{e.fields["country"]}</p>}
              {e.rating > 0 && <p className="mt-1 font-display text-sm text-ink">★ {e.rating}/10</p>}
              {e.senses["mood"] && <p className="mt-1 line-clamp-2 font-hand text-base text-ink-soft">{e.senses["mood"]}</p>}
            </Link>
          ))}
        </div>
      </div>
      <div className="px-4 pt-4">
        <Link to="/entry/$id" params={{ id: "new" }} search={{ cat: "thirdplaces" }}
          className="block rounded-md bg-primary py-3 text-center font-display text-xl font-semibold text-primary-foreground">+ Pin a third place</Link>
      </div>
      
    </AppShell>
  );
}
