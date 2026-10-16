import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { WorldMap, type Pin } from "@/components/WorldMap";
import { EntryCard } from "@/components/EntryCard";
import { useEntries } from "@/lib/db";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Atlas of Travels — Bothy" },
      { name: "description", content: "A private map of every journey, place and third place you've kept." },
      { property: "og:title", content: "Atlas of Travels — Bothy" },
      { property: "og:description", content: "Your private map of past travels." },
    ],
  }),
  component: Atlas,
});

const TONE: Record<string, Pin["tone"]> = { travels: "brass", places: "moss", thirdplaces: "heather" };
const FILTERS = [{ id: "all", label: "All" }, { id: "travels", label: "Journeys" }, { id: "places", label: "Places" }, { id: "thirdplaces", label: "Third places" }];

function Atlas() {
  const { entries } = useEntries();
  const nav = useNavigate();
  const [f, setF] = useState("all");
  const geo = (entries ?? []).filter((e) => e.lat != null && e.lng != null && TONE[e.category] && (f === "all" || e.category === f));
  const travels = (entries ?? []).filter((e) => e.category === "travels");
  const intl = travels.filter((e) => e.fields.scope === "International").length;
  const countries = new Set(travels.map((e) => e.fields.country?.trim().toLowerCase()).filter(Boolean)).size;

  return (
    <AppShell title="Atlas">
      <div className="space-y-4 px-4">
        <div className="drawer rounded-md p-2">
          <WorldMap pins={geo.map((e) => ({ id: e.id, lat: e.lat!, lng: e.lng!, label: e.title, tone: TONE[e.category] }))}
            onPinClick={(id) => nav({ to: "/entry/$id", params: { id } })} />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map((x) => (
            <button key={x.id} onClick={() => setF(x.id)}
              className={`whitespace-nowrap rounded-full border px-3 py-1 font-display text-base ${f === x.id ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>
              {x.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[["Journeys", travels.length], ["Abroad", intl], ["Regions", countries]].map(([l, n]) => (
            <div key={l} className="page rounded-sm py-3">
              <p className="font-display text-3xl font-semibold">{n}</p>
              <p className="text-xs uppercase tracking-widest text-ink-soft">{l}</p>
            </div>
          ))}
        </div>
        <h2 className="pt-2 text-2xl font-semibold">Pinned memories</h2>
        {geo.length === 0 && <p className="font-hand text-xl text-muted-foreground">Add a journey or place and tap its map to pin it here.</p>}
        <div className="space-y-3">{geo.map((e) => <EntryCard key={e.id} e={e} showCat />)}</div>
      </div>
    </AppShell>
  );
}
