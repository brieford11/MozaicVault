import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bell, Camera, Heart, MapPin, ImagePlus } from "lucide-react";
import { JourneyPlans } from "@/components/JourneyPlans";
import { ReminderControls } from "@/components/ReminderControls";
import { Button } from "@/components/ui/button";
import { AppShell, BackLink } from "@/components/AppShell";
import { StarRating } from "@/components/StarRating";
import { AudioRecorder } from "@/components/AudioRecorder";
import { WorldMap } from "@/components/WorldMap";
import { ArchiveIcon } from "@/components/ArchiveIcon";
import { parseDay } from "@/lib/calendar-events";
import { getCategory, getListLabel, SENSES } from "@/lib/categories";
import { blankEntry, db, type Entry } from "@/lib/db";
import { normalizeEntry } from "@/lib/entry-details";

export const Route = createFileRoute("/entry/$id")({
  validateSearch: (s: Record<string, unknown>): { cat?: string; date?: string } => ({
    ...(typeof s["cat"] === "string" ? { cat: s["cat"] } : {}),
    ...(typeof s["date"] === "string" && parseDay(s["date"]) ? { date: s["date"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Journal Page — Mozaic Vault" },
      {
        name: "description",
        content: "A single page in your private archive, with notes, ratings and memories.",
      },
      { property: "og:title", content: "Journal Page — Mozaic Vault" },
      { property: "og:description", content: "A page in your private archive." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EntryPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open={title === "Notes"} className="space-y-2">
      <summary className="flex min-h-11 cursor-pointer items-center justify-between border-b border-ink-soft/30 pb-1 font-display text-lg font-semibold text-ink-soft">
        {title}
        <span aria-hidden="true" className="details-chevron">
          ⌄
        </span>
      </summary>
      <div className="space-y-2 pt-2">{children}</div>
    </details>
  );
}

function EntryPage() {
  const { id } = Route.useParams();
  const { cat, date } = Route.useSearch();
  const nav = useNavigate();
  const [e, setE] = useState<Entry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const cameraInput = useRef<HTMLInputElement>(null);
  const ticketInput = useRef<HTMLInputElement>(null);
  const mapSection = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id === "new") {
      setE({ ...blankEntry(cat ?? "favourites"), ...(date ? { fields: { date } } : {}) });
      setIsNew(true);
    } else db.get(id).then((x) => setE(x ? normalizeEntry(x) : null));
  }, [id, cat, date]);

  if (!e)
    return (
      <AppShell title="…" back={<BackLink />}>
        <p className="p-6 text-muted-foreground">Opening the page…</p>
      </AppShell>
    );
  const c = getCategory(e.category);
  if (!c)
    return (
      <AppShell title="Page unavailable" back={<BackLink />}>
        <p className="p-6 text-muted-foreground">This category is unavailable.</p>
      </AppShell>
    );
  const set = (patch: Partial<Entry>) => {
    setE({ ...e, ...patch });
    setSaved(false);
  };
  const setField = (k: string, v: string) => set({ fields: { ...e.fields, [k]: v } });
  const readTicket = (file?: File) => {
    if (!file) return;
    setPhotoError("");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") set({ ticketImage: reader.result });
    };
    reader.onerror = () => setPhotoError("Could not open that photo. Please try another.");
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await db.put({ ...e, title: e.title.trim() || "Untitled", updatedAt: Date.now() });
      setSaved(true);
      if (isNew) nav({ to: "/entry/$id", params: { id: e.id }, replace: true });
      setIsNew(false);
    } catch {
      setSaveError(
        "Could not save this page. Check that this browser can use device storage and has free space, then try again.",
      );
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (!confirm("Tear this page out of the archive?")) return;
    await db.del(e.id);
    nav({ to: "/shelf/$cat", params: { cat: e.category } });
  };

  return (
    <AppShell
      title={isNew ? `New ${c.singular}` : c.singular}
      back={<BackLink cat={e.category} />}
      actions={
        <>
          {c.travel && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Pin this place"
              title="Pin this place"
              onClick={() =>
                mapSection.current?.scrollIntoView({
                  behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                    ? "instant"
                    : "smooth",
                  block: "center",
                })
              }
            >
              <MapPin />
            </Button>
          )}
          {c.reminder && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Set reminder"
              title="Set reminder"
              aria-expanded={showReminder}
              onClick={() => setShowReminder(!showReminder)}
            >
              <Bell className={e.reminder ? "fill-primary/20 text-primary" : ""} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label={e.favourite ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={e.favourite ?? false}
            title="Favorites"
            onClick={() => set({ favourite: !e.favourite })}
          >
            <Heart className={e.favourite ? "fill-primary text-primary" : ""} />
          </Button>
        </>
      }
    >
      <div className="px-3 pb-6">
        <article className="page space-y-6 rounded-sm px-5 py-6">
          {c.reminder && showReminder && (
            <Section title="Upcoming reminder">
              <ReminderControls entry={e} onChange={(reminder) => set({ reminder })} />
            </Section>
          )}
          <div>
            <p className="inline-flex items-center gap-2 font-display text-sm text-heather">
              <ArchiveIcon
                category={c.id}
                className="h-8 w-8 border-ink-soft/30 bg-ink/5 text-heather"
              />
              {c.singular}
            </p>
            <input
              aria-label={c.titleLabel ?? "Title"}
              value={e.title}
              onChange={(ev) => set({ title: ev.target.value })}
              placeholder={`${c.titleLabel ?? "Title"}…`}
              className="field mt-2 font-display text-3xl font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {c.fields
              .filter((f) => !f.showWhen || e.fields[f.showWhen.key] === f.showWhen.value)
              .map((f) => (
                <label
                  key={f.key}
                  className={`block text-xs uppercase tracking-widest text-ink-soft ${f.type === "textarea" ? "col-span-2" : ""}`}
                >
                  {f.label}
                  {f.type === "select" ? (
                    <select
                      aria-label={f.label}
                      value={e.fields[f.key] ?? ""}
                      onChange={(ev) => setField(f.key, ev.target.value)}
                      className="field text-base normal-case tracking-normal"
                    >
                      <option value="">—</option>
                      {f.options?.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  ) : f.type === "combo" ? (
                    <>
                      <input
                        aria-label={f.label}
                        list={`opts-${f.key}`}
                        value={e.fields[f.key] ?? ""}
                        placeholder={f.placeholder ?? "choose or type your own…"}
                        onChange={(ev) => setField(f.key, ev.target.value)}
                        className="field text-base normal-case tracking-normal"
                      />
                      <datalist id={`opts-${f.key}`}>
                        {f.options?.map((o) => (
                          <option key={o} value={o} />
                        ))}
                      </datalist>
                    </>
                  ) : f.type === "textarea" ? (
                    <textarea
                      aria-label={f.label}
                      value={e.fields[f.key] ?? ""}
                      placeholder={f.placeholder}
                      rows={3}
                      onChange={(ev) => setField(f.key, ev.target.value)}
                      className="field resize-y text-base normal-case tracking-normal"
                    />
                  ) : (
                    <input
                      aria-label={f.label}
                      type={f.type ?? "text"}
                      value={e.fields[f.key] ?? ""}
                      placeholder={f.placeholder}
                      onChange={(ev) => setField(f.key, ev.target.value)}
                      className="field text-base normal-case tracking-normal"
                    />
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
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(ev) => {
                      const file = ev.target.files?.[0];
                      if (!file) return;
                      const r = new FileReader();
                      r.onload = () => set({ image: String(r.result) });
                      r.readAsDataURL(file);
                    }}
                  />
                </label>
                {e.image && (
                  <button
                    type="button"
                    onClick={() => set({ image: "" })}
                    className="text-sm text-ink-soft underline"
                  >
                    remove
                  </button>
                )}
              </div>
              <p className="text-xs text-ink-soft">Stored only on this device.</p>
            </Section>
          )}

          {c.ticket && (
            <Section title="Ticket stub">
              {e.ticketImage && (
                <img
                  src={e.ticketImage}
                  alt="Ticket stub"
                  className="max-h-64 w-full rounded-sm object-contain"
                />
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="ghost"
                  className="border border-ink-soft/40 text-ink"
                  onClick={() => cameraInput.current?.click()}
                >
                  <Camera />
                  Take a photo
                </Button>
                <Button
                  variant="ghost"
                  className="border border-ink-soft/40 text-ink"
                  onClick={() => ticketInput.current?.click()}
                >
                  <ImagePlus />
                  Choose photo
                </Button>
                {e.ticketImage && (
                  <Button
                    variant="ghost"
                    className="text-ink-soft"
                    onClick={() => set({ ticketImage: "" })}
                  >
                    Remove photo
                  </Button>
                )}
              </div>
              <input
                ref={cameraInput}
                aria-label="Take ticket stub photo"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(ev) => {
                  readTicket(ev.target.files?.[0]);
                  ev.target.value = "";
                }}
              />
              <input
                ref={ticketInput}
                aria-label="Choose ticket stub photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(ev) => {
                  readTicket(ev.target.files?.[0]);
                  ev.target.value = "";
                }}
              />
              {photoError && (
                <p role="alert" className="text-sm text-destructive">
                  {photoError}
                </p>
              )}
            </Section>
          )}

          {e.category === "travels" && (
            <Section title="Upcoming transport">
              <JourneyPlans legs={e.legs ?? []} onChange={(legs) => set({ legs })} />
            </Section>
          )}

          {c.wantable && (
            <label className="flex items-center gap-3 rounded-sm border border-ink-soft/40 px-3 py-2.5">
              <input
                type="checkbox"
                checked={e.want ?? false}
                onChange={(ev) => set({ want: ev.target.checked })}
                className="h-4 w-4 accent-[var(--heather)]"
              />
              <span className="font-hand text-xl text-ink">{getListLabel(c.id)}</span>
            </label>
          )}

          {e.category !== "health" && (
            <Section title="My rating">
              <StarRating value={e.rating} onChange={(rating) => set({ rating })} />
            </Section>
          )}

          {e.category === "favourites" && (
            <Section title="Details">
              <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="grid grid-cols-2 gap-4">
                    <input
                      aria-label={`Detail ${n} label`}
                      placeholder="Detail name…"
                      value={e.fields[`customLabel${n}`] ?? ""}
                      onChange={(ev) => setField(`customLabel${n}`, ev.target.value)}
                      className="field text-base"
                    />
                    <input
                      aria-label={`Detail ${n} value`}
                      placeholder="Value…"
                      value={e.fields[`customValue${n}`] ?? ""}
                      onChange={(ev) => setField(`customValue${n}`, ev.target.value)}
                      className="field text-base"
                    />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {c.travel && (
            <>
              <Section title="The sensory mood">
                <div className="space-y-2">
                  {SENSES.map((s) => (
                    <label key={s.key} className="flex min-w-0 items-start gap-3">
                      <span className="w-16 shrink-0 font-display text-base italic text-ink-soft">
                        {s.label}
                      </span>
                      <textarea
                        aria-label={s.label}
                        rows={2}
                        value={e.senses[s.key] ?? ""}
                        onChange={(ev) => {
                          set({ senses: { ...e.senses, [s.key]: ev.target.value } });
                          ev.target.style.height = "auto";
                          ev.target.style.height = `${ev.target.scrollHeight}px`;
                        }}
                        ref={(node) => {
                          if (node) {
                            node.style.height = "auto";
                            node.style.height = `${node.scrollHeight}px`;
                          }
                        }}
                        className="field sensory-line min-w-0 flex-1 resize-y font-hand text-xl"
                      />
                    </label>
                  ))}
                </div>
              </Section>

              <div ref={mapSection} className="scroll-mt-20">
                <Section title="On the map">
                  <p className="text-xs text-ink-soft">
                    Tap the map to place a pin, or type coordinates. No location services are used.
                  </p>
                  <div className="overflow-hidden rounded-sm border border-ink-soft/40">
                    <WorldMap
                      pins={[]}
                      selected={
                        e.lat != null && e.lng != null ? { lat: e.lat, lng: e.lng } : undefined
                      }
                      onPick={(lat, lng) => set({ lat, lng })}
                    />
                  </div>
                  <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
                    <label className="text-xs uppercase tracking-widest text-ink-soft">
                      Latitude
                      <input
                        inputMode="decimal"
                        value={e.lat ?? ""}
                        onChange={(ev) =>
                          set({ lat: ev.target.value === "" ? undefined : Number(ev.target.value) })
                        }
                        className="field text-base"
                      />
                    </label>
                    <label className="text-xs uppercase tracking-widest text-ink-soft">
                      Longitude
                      <input
                        inputMode="decimal"
                        value={e.lng ?? ""}
                        onChange={(ev) =>
                          set({ lng: ev.target.value === "" ? undefined : Number(ev.target.value) })
                        }
                        className="field text-base"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => set({ lat: undefined, lng: undefined })}
                      className="pb-2 text-sm text-ink-soft underline"
                    >
                      clear
                    </button>
                  </div>
                </Section>
              </div>

              <Section title="Record audio snippet">
                <AudioRecorder clips={e.audio} onChange={(audio) => set({ audio })} />
              </Section>
            </>
          )}

          <Section title="Notes">
            <textarea
              value={e.notes}
              onChange={(ev) => set({ notes: ev.target.value })}
              rows={8}
              placeholder="write what you'd like to remember…"
              className="ruled w-full resize-y bg-transparent font-hand text-2xl text-ink outline-none placeholder:text-ink-soft/50"
            />
          </Section>

          {!isNew && (
            <p className="text-right font-hand text-lg text-ink-soft">
              first kept {new Date(e.createdAt).toLocaleDateString()}
            </p>
          )}
        </article>

        {saveError && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {saveError}
          </p>
        )}
        <div className="mt-4 flex gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-md bg-primary py-3 font-display text-xl font-semibold text-primary-foreground"
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save this page"}
          </button>
          {!isNew && (
            <button
              onClick={remove}
              className="rounded-md border border-destructive px-4 text-destructive"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
