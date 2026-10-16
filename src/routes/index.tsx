import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CATEGORIES, DRAWERS } from "@/lib/categories";
import { useEntries } from "@/lib/db";
import hero from "@/assets/highlands.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bothy — A Private Archive of Things & Places" },
      { name: "description", content: "A cozy, private journal for your books, records, films, travels and memories. Stored only on your device." },
      { property: "og:title", content: "Bothy — A Private Archive of Things & Places" },
      { property: "og:description", content: "A cozy, private journal for your collections and travels." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { entries } = useEntries();
  const count = (id: string) => entries?.filter((e) => e.category === id).length ?? 0;
  return (
    <AppShell>
      <section className="relative h-72 overflow-hidden">
        <img src={hero} alt="Misty highland glen with a lone stone bothy" width={768} height={1024} className="absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-fog)" }} />
        <div className="absolute bottom-6 left-5 right-5">
          <p className="font-hand text-2xl text-primary">the keeping place</p>
          <h1 className="text-5xl font-semibold leading-none tracking-wide">Bothy</h1>
          <p className="mt-2 text-sm text-muted-foreground">{entries?.length ?? 0} memories kept · on this device only</p>
        </div>
      </section>

      <div className="space-y-6 px-4 pt-2">
        {DRAWERS.map((d) => (
          <section key={d.id} className="drawer rounded-md p-3">
            <div className="mb-3 flex items-baseline justify-between px-1">
              <h2 className="text-2xl font-semibold">{d.name}</h2>
              <span className="font-display text-sm italic text-muted-foreground">{d.note}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.filter((c) => c.drawer === d.id).map((c) => (
                <Link key={c.id} to="/shelf/$cat" params={{ cat: c.id }}
                  className="label-tag flex items-center justify-between rounded-sm px-3 py-2.5 active:translate-y-px">
                  <span className="flex items-center gap-2 text-lg font-semibold"><span className="text-ink-soft">{c.glyph}</span>{c.name}</span>
                  <span className="font-sans text-xs text-ink-soft">{count(c.id)}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
        <p className="pb-4 text-center font-hand text-xl text-muted-foreground">nothing leaves this little house.</p>
      </div>
    </AppShell>
  );
}
