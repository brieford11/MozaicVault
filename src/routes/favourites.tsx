import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { EntryCard } from "@/components/EntryCard";
import { Button } from "@/components/ui/button";
import { useEntries } from "@/lib/db";

export const Route = createFileRoute("/favourites")({
  head: () => ({ meta: [
    { title: "Favorites — Mozaic Vault" },
    { name: "description", content: "Your favorite things and memories, kept privately on this device." },
    { property: "og:title", content: "Favorites — Mozaic Vault" },
    { property: "og:description", content: "A personal collection of your treasured things and memories." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Favourites,
});

function Favourites() {
  const { entries } = useEntries();
  const favourites = (entries ?? []).filter((e) => e.favourite || e.category === "favourites");
  return <AppShell title="Favorites">
    <div className="space-y-3 px-4">
      {entries && favourites.length === 0 && <p className="py-12 text-center font-hand text-2xl text-muted-foreground">Your treasured things belong here.</p>}
      <div className="space-y-2">{favourites.map((e) => <EntryCard key={e.id} e={e} showCat />)}</div>
      <Button asChild className="w-full font-display text-lg"><Link to="/entry/$id" params={{ id: "new" }} search={{ cat: "favourites" }}>+ Add a favorite</Link></Button>
    </div>
  </AppShell>;
}