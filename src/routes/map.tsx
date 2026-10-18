import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { WorldMap, type Pin } from "@/components/WorldMap";
import { EntryCard } from "@/components/EntryCard";
import { useEntries } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { getEntryTitle } from "@/lib/entry-details";
import { getPinCity } from "@/lib/pin-city";
import { X } from "lucide-react";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Atlas of Travels — Mozaic Vault" },
      { name: "description", content: "A private map of every journey, place and social space you've kept." },
      { property: "og:title", content: "Atlas of Travels — Mozaic Vault" },
      { property: "og:description", content: "Your private map of past travels." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Atlas,
});

const TONE: Record<string, Pin["tone"]> = { travels: "brass", places: "moss", thirdplaces: "heather" };
const FILTERS = [{ id: "all", label: "All" }, { id: "travels", label: "Journeys" }, { id: "places", label: "Places" }, { id: "thirdplaces", label: "Social spaces" }];

function Atlas() {
  const { entries } = useEntries();
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [f, setF] = useState("all");
  const [sort, setSort] = useState("recent");
  const geo = (entries ?? []).filter((e) => e.lat != null && e.lng != null && TONE[e.category] && (f === "all" || e.category === f));
  const sorted = [...geo].sort((a, b) => sort === "page" ? a.category.localeCompare(b.category) || getEntryTitle(a).localeCompare(getEntryTitle(b)) : sort === "az" ? getEntryTitle(a).localeCompare(getEntryTitle(b)) : b.updatedAt - a.updatedAt);
  const selected = geo.find((entry) => entry.id === selectedPin);

  return (
    <AppShell title="Atlas">
      <div className="space-y-4 px-4">
        <div className="drawer rounded-md p-2">
          <WorldMap pins={geo.flatMap((e) => e.lat != null && e.lng != null ? [{ id: e.id, lat: e.lat, lng: e.lng, label: getPinCity(e), tone: TONE[e.category] }] : [])}
            onPinClick={setSelectedPin} />
          {selected && <div role="status" className="flex items-center justify-between gap-2 border-t border-border px-2 py-2"><span className="break-words font-display text-xl">{getPinCity(selected)}</span><Button variant="ghost" size="icon" aria-label="Dismiss city" title="Dismiss city" onClick={() => setSelectedPin(null)}><X /></Button></div>}
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map((x) => (
            <Button key={x.id} variant="ghost" size="sm" aria-pressed={f === x.id} onClick={() => setF(x.id)}
              className={`whitespace-nowrap border font-display text-base ${f === x.id ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>
              {x.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-2xl font-semibold">Pinned memories</h2><select aria-label="Sort pinned memories" value={sort} onChange={(ev) => setSort(ev.target.value)} className="rounded-md border border-input bg-card px-2 py-2 text-sm"><option value="recent">Recent</option><option value="page">By page</option><option value="az">A–Z</option></select></div>
        {geo.length === 0 && <p className="font-hand text-xl text-muted-foreground">Add a journey or place and tap its map to pin it here.</p>}
        <div className="space-y-2">{sorted.map((e) => <EntryCard key={e.id} e={e} showCat />)}</div>
      </div>
    </AppShell>
  );
}
