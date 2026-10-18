import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ArchiveActions } from "@/components/ArchiveActions";
import { ArchiveIcon } from "@/components/ArchiveIcon";
import { PageVisibility } from "@/components/PageVisibility";
import { usePageVisibility } from "@/lib/page-visibility";
import { CATEGORIES, DRAWERS } from "@/lib/categories";
import { useEntries } from "@/lib/db";
import hero from "@/assets/coastal-highlands.jpg";
import shelf from "@/assets/mosaic-shelf.jpg";
import { useCabinets } from "@/lib/cabinet-preferences";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mozaic Vault — A Private Archive of Things & Places" },
      { name: "description", content: "A cozy, private journal for your books, records, films, travels and memories. Stored only on your device." },
      { property: "og:title", content: "Mozaic Vault — A Private Archive of Things & Places" },
      { property: "og:description", content: "A cozy, private journal for your collections and travels." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { entries } = useEntries();
  const { hidden } = usePageVisibility();
  const { cabinets } = useCabinets();
  const count = (id: string) => entries?.filter((e) => e.category === id).length ?? 0;
  return (
    <AppShell>
      <section className="relative h-72 overflow-hidden">
        <img src={hero} alt="Stone cottage on a rocky Scottish Highlands seashore" width={1024} height={1024} className="absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-fog)" }} />
        <div className="absolute right-4 top-4"><PageVisibility /></div>
        <div className="absolute bottom-6 left-5 right-5">
          <p className="font-hand text-2xl text-primary">the keeping place</p>
          <h1 className="text-4xl font-semibold leading-none">Mozaic Vault</h1>
          <p className="mt-2 text-sm text-muted-foreground">{entries?.length ?? 0} memories kept · on this device only</p>
        </div>
      </section>

      <div className="pt-2">
        {cabinets.filter((d) => CATEGORIES.some((c) => c.drawer === d.id && !hidden.includes(c.id))).map((d) => (
          <section key={d.id} className="bookshelf-bay relative px-8 pb-12 pt-10" aria-label={d.title}>
            <img src={shelf} alt="" aria-hidden="true" loading="lazy" width={1024} height={768} className="absolute inset-0 h-full w-full object-fill" />
            <div className="cabinet relative rounded-sm border-2 p-3" data-cabinet-color={d.color}>
            <div className="mb-3 px-1">
              <h2 className="break-words text-2xl font-semibold">{d.title}</h2>
              <span className="font-display text-sm italic">{DRAWERS.find((drawer) => drawer.id === d.id)?.note}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.filter((c) => c.drawer === d.id && !hidden.includes(c.id)).map((c) => (
                <Link key={c.id} to="/shelf/$cat" params={{ cat: c.id }}
                  className="cabinet-label flex items-center justify-between gap-2 rounded-sm px-2 py-2.5 active:translate-y-px">
                  <span className="flex min-w-0 items-center gap-2 text-base font-semibold"><ArchiveIcon category={c.id} className="h-7 w-7 border-ink-soft/25 bg-ink/5 text-heather" /><span className="break-words">{c.name}</span></span>
                  <span className="shrink-0 font-sans text-xs text-ink-soft">{count(c.id)}</span>
                </Link>
              ))}
            </div>
            </div>
          </section>
        ))}
        <div className="px-4 pt-4">
        <ArchiveActions entries={entries} />
        <p className="pb-4 text-center font-hand text-xl text-muted-foreground">kept here. shared only by you.</p>
        </div>
      </div>
    </AppShell>
  );
}
