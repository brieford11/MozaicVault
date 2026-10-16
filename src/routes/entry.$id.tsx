import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, BackLink } from "@/components/AppShell";
import { StarRating } from "@/components/StarRating";
import { AudioRecorder } from "@/components/AudioRecorder";
import { WorldMap } from "@/components/WorldMap";
import { getCategory, SENSES } from "@/lib/categories";
import { blankEntry, db, type Entry } from "@/lib/db";
import { normalizeEntry } from "@/lib/entry-details";

export const Route = createFileRoute("/entry/$id")({
  validateSearch: (s: Record<string, unknown>): { cat?: string } => (typeof s["cat"] === "string" ? { cat: s["cat"] } : {}),
  head: () => ({
    meta: [
      { title: "Journal Page — Bothy" },
      { name: "description", content: "A single page in your private archive, with notes, ratings and memories." },
      { property: "og:title", content: "Journal Page — Bothy" },
      { property: "og:description", content: "A page in your private archive." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EntryPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="border-b border-ink-soft/30 pb-1 text-lg font-semibold uppercase tracking-[0.2em] text-ink-soft">{title}</h3>
      {children}
    </div>
  );
}

function EntryPage() {
  const { id } = Route.useParams();
  const { cat } = Route.useSearch();
  const nav = useNavigate();
  const [e, setE] = useState<Entry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (id === "new") { setE(blankEntry(cat ?? "favourites")); setIsNew(true); }
    else db.get(id).then((x) => setE(x ? normalizeEntry(x) : null));
  }, [id, cat]);

  if (!e) return <AppShell title="…" back={<BackLink />}><p className="p-6 text-muted-foreground">Opening the page…</p></AppShell>;
  const c = getCategory(e.category);
  if (!c) return <AppShell title="Page unavailable" back={<BackLink />}><p className="p-6 text-muted-foreground">This category is unavailable.</p></AppShell>;
  const set = (patch: Partial<Entry>) => { setE({ ...e, ...patch }); setSaved(false); };
  const setField = (k: string, v: string) => set({ fields: { ...e.fields, [k]: v } });

  const save = async () => {
    await db.put({ ...e, title: e.title.trim() || "Untitled", updatedAt: Date.now() });
    setSaved(true);
    if (isNew) nav({ to: "/entry/$id", params: { id: e.id }, replace: true });
    setIsNew(false);
  };
  const remove = async () => {
    if (!confirm("Tear this page out of the archive?")) return;
    await db.del(e.id);
    nav({ to: "/shelf/$cat", params: { cat: e.category } });
  };

  return (
    <AppShell title={isNew ? `New ${c.singular}` : c.singular} back={<BackLink cat={e.category} />}>
      <div className="px-3 pb-6">
        <article className="page space-y-6 rounded-sm px-5 py-6">
          <div>
            <p className="stamp inline-block px-2 text-xs text-heather">{c.glyph} {c.singular}</p>
            <input aria-label={c.titleLabel ?? "Title"} value={e.title} onChange={(ev) => set({ title: ev.target.value })} placeholder={`${c.titleLabel ?? "Title"}…`}
              className="field mt-2 font-display text-3xl font-semibold" />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {c.fields.map((f) => (
              <label key={f.key} className={`block text-xs uppercase tracking-widest text-ink-soft ${f.type === "textarea" ? "col-span-2" : ""}`}>
                {f.label}
                {f.type === "select" ? (
                  <select value={e.fields[f.key] ?? ""} onChange={(ev) => setField(f.key, ev.target.value)} className="field text-base normal-case tracking-normal">
                    <option value="">—</option>{f.options?.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : f.type === "combo" ? (
                  <>
                    <input list={`opts-${f.key}`} value={e.fields[f.key] ?? ""} placeholder={f.placeholder ?? "choose or type your own…"}
                      onChange={(ev) => setField(f.key, ev.target.value)} className="field text-base normal-case tracking-normal" />
                    <datalist id={`opts-${f.key}`}>{f.options?.map((o) => <option key={o} value={o} />)}</datalist>
                  </>
                ) : f.type === "textarea" ? (
                  <textarea value={e.fields[f.key] ?? ""} placeholder={f.placeholder} rows={3}
                    onChange={(ev) => setField(f.key, ev.target.value)} className="field resize-y text-base normal-case tracking-normal" />
                ) : (
                  <input type={f.type ?? "text"} value={e.fields[f.key] ?? ""} placeholder={f.placeholder}
                    onChange={(ev) => setField(f.key, ev.target.value)} className="field text-base normal-case tracking-normal" />
                )}
              </label>
            ))}
          </div>

          {c.image && (
            <Section title="Cover photo">
              {e.image && <img src={e.image} alt="Cover" className="max-h-48 rounded-sm shadow" />}
              <div className="flex items-center gap-3">
                <label className="cursor-pointer rounded-md border border-ink-soft/50 px-3 py-2 text-sm text-ink">
                  {e.image ? "Replace photo" : "Add a photo"}
                  <input type="file" accept="image/*" className="hidden" onChange={(ev) => {
                    const file = ev.target.files?.[0];
                    if (!file) return;
                    const r = new FileReader();
                    r.onload = () => set({ image: String(r.result) });
                    r.readAsDataURL(file);
                  }} />
                </label>
                {e.image && <button type="button" onClick={() => set({ image: "" })} className="text-sm text-ink-soft underline">remove</button>}
              </div>
              <p className="text-xs text-ink-soft">Stored only on this device.</p>
            </Section>
          )}

          {c.wantable && (
            <label className="flex items-center gap-3 rounded-sm border border-ink-soft/40 px-3 py-2.5">
              <input type="checkbox" checked={e.want ?? false} onChange={(ev) => set({ want: ev.target.checked })} className="h-4 w-4 accent-[var(--heather)]" />
              <span className="font-hand text-xl text-ink">On my want list — I don't have this yet</span>
            </label>
          )}

          <Section title="My rating"><StarRating value={e.rating} onChange={(rating) => set({ rating })} /></Section>

          {c.travel && (
            <>
              <Section title="The sensory mood">
                <div className="space-y-2">
                  {SENSES.map((s) => (
                    <label key={s.key} className="flex items-baseline gap-3">
                      <span className="w-16 shrink-0 font-display text-base italic text-ink-soft">{s.label}</span>
                      <input value={e.senses[s.key] ?? ""} onChange={(ev) => set({ senses: { ...e.senses, [s.key]: ev.target.value } })}
                        className="field font-hand text-xl" />
                    </label>
                  ))}
                </div>
              </Section>

              <Section title="On the map">
                <p className="text-xs text-ink-soft">Tap the map to place a pin, or type coordinates. No location services are used.</p>
                <div className="overflow-hidden rounded-sm border border-ink-soft/40">
                  <WorldMap pins={[]} selected={e.lat != null && e.lng != null ? { lat: e.lat, lng: e.lng } : undefined} onPick={(lat, lng) => set({ lat, lng })} />
                </div>
                <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
                  <label className="text-xs uppercase tracking-widest text-ink-soft">Latitude
                    <input inputMode="decimal" value={e.lat ?? ""} onChange={(ev) => set({ lat: ev.target.value === "" ? undefined : Number(ev.target.value) })} className="field text-base" />
                  </label>
                  <label className="text-xs uppercase tracking-widest text-ink-soft">Longitude
                    <input inputMode="decimal" value={e.lng ?? ""} onChange={(ev) => set({ lng: ev.target.value === "" ? undefined : Number(ev.target.value) })} className="field text-base" />
                  </label>
                  <button type="button" onClick={() => set({ lat: undefined, lng: undefined })} className="pb-2 text-sm text-ink-soft underline">clear</button>
                </div>
              </Section>

              <Section title="Sound of the place"><AudioRecorder clips={e.audio} onChange={(audio) => set({ audio })} /></Section>
            </>
          )}

          <Section title="Notes">
            <textarea value={e.notes} onChange={(ev) => set({ notes: ev.target.value })} rows={8} placeholder="write what you'd like to remember…"
              className="ruled w-full resize-y bg-transparent font-hand text-2xl text-ink outline-none placeholder:text-ink-soft/50" />
          </Section>

          {!isNew && <p className="text-right font-hand text-lg text-ink-soft">first kept {new Date(e.createdAt).toLocaleDateString()}</p>}
        </article>

        <div className="mt-4 flex gap-3">
          <button onClick={save} className="flex-1 rounded-md bg-primary py-3 font-display text-xl font-semibold text-primary-foreground">
            {saved ? "Saved ✓" : "Save this page"}
          </button>
          {!isNew && <button onClick={remove} className="rounded-md border border-destructive px-4 text-destructive">Remove</button>}
        </div>
      </div>
    </AppShell>
  );
}
