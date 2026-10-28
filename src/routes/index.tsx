import { createFileRoute, Link } from "@tanstack/react-router";
import { Archive, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ArchiveActions } from "@/components/ArchiveActions";
import { ArchiveIcon } from "@/components/ArchiveIcon";
import { ShelfEditor } from "@/components/ShelfEditor";
import { PageVisibility } from "@/components/PageVisibility";
import { BookshelfOptions } from "@/components/BookshelfOptions";
import { HiddenCabinet } from "@/components/HiddenCabinet";
import { Button } from "@/components/ui/button";
import { usePageVisibility } from "@/lib/page-visibility";
import { CATEGORIES, DRAWERS } from "@/lib/categories";
import { useEntries } from "@/lib/db";
import { useCabinets } from "@/lib/cabinet-preferences";
import { shelfHiddenKey, toggleSelection, useBookshelf } from "@/lib/bookshelf-preferences";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Bookshelf — Mozaic Vault" },
      {
        name: "description",
        content:
          "Your private bookshelf of collections, journals and memories. Stored only on your device.",
      },
      { property: "og:title", content: "The Bookshelf — Mozaic Vault" },
      { property: "og:description", content: "A keeping place for your collections and memories." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { entries } = useEntries();
  const {
    hidden,
    ready: visibilityReady,
    saving: hiddenSaving,
    error: visibilityError,
    update: updateHidden,
  } = usePageVisibility();
  const {
    cabinets,
    ready: cabinetsReady,
    error: cabinetError,
    update: updateCabinets,
  } = useCabinets();
  const { selection, ready, saving, error, update } = useBookshelf();
  const disabled = !ready || !visibilityReady || !cabinetsReady || saving || hiddenSaving;
  const count = (id: string) => entries?.filter((e) => e.category === id).length ?? 0;
  const shelfCount = (id: string) =>
    entries?.filter((e) => CATEGORIES.some((c) => c.id === e.category && c.drawer === id)).length ??
    0;
  const visible = cabinets.filter(
    (item) => selection.shelves.includes(item.id) && !hidden.includes(shelfHiddenKey(item.id)),
  );
  const available = cabinets.filter(
    (item) => !selection.shelves.includes(item.id) && !hidden.includes(shelfHiddenKey(item.id)),
  );
  const hide = (id: string) => updateHidden([...hidden, id]);
  const title = (id: string, name: string) =>
    id === "shelf" && name === "The Bookshelf" ? "Media" : name;

  return (
    <AppShell>
      <header className="bookshelf-heading flex items-center justify-between gap-3 px-5 pb-5 pt-9">
        <div>
          <h1 className="font-display text-4xl font-semibold">The Bookshelf</h1>
        </div>
        <PageVisibility />
      </header>
      {(!ready || !visibilityReady || !cabinetsReady) &&
        !error &&
        !visibilityError &&
        !cabinetError && (
          <p role="status" className="px-5 py-8 font-hand text-xl text-muted-foreground">
            Opening your bookshelf…
          </p>
        )}
      {[error, visibilityError, cabinetError].filter(Boolean).map((message) => (
        <p key={message} role="alert" className="px-5 pb-3 text-sm text-destructive">
          {message}
        </p>
      ))}
      {ready && visibilityReady && cabinetsReady && (
        <>
          <div className="antique-bookshelf mx-3" data-cabinet-color={selection.frameColor}>
            <div className="bookshelf-crown" aria-hidden="true">
              <span>❧</span>
            </div>
            {visible.map((cabinet) => {
              const categories = CATEGORIES.filter(
                (item) =>
                  item.drawer === cabinet.id &&
                  selection.subshelves.includes(item.id) &&
                  !hidden.includes(item.id),
              );
              const remaining = CATEGORIES.filter(
                (item) =>
                  item.drawer === cabinet.id &&
                  !selection.subshelves.includes(item.id) &&
                  !hidden.includes(item.id),
              ).length;
              return (
                <section
                  key={cabinet.id}
                  className="bookshelf-bay"
                  aria-label={title(cabinet.id, cabinet.title)}
                >
                  <div className="cabinet antique-cabinet" data-cabinet-color={cabinet.color}>
                    <div className="flex items-center pr-2">
                      <h2 className="min-w-0 flex-1">
                        <button
                          type="button"
                          disabled={disabled}
                          aria-expanded={selection.expanded.includes(cabinet.id)}
                          aria-controls={`bay-${cabinet.id}`}
                          onClick={() =>
                            update({
                              ...selection,
                              expanded: toggleSelection(selection.expanded, cabinet.id),
                            })
                          }
                          className="shelf-heading flex w-full items-center gap-3 text-left"
                        >
                          <span className="brass-nameplate min-w-0 flex-1 break-words font-display text-2xl font-semibold">
                            {title(cabinet.id, cabinet.title)}
                          </span>
                          <span
                            aria-hidden="true"
                            className={`shelf-chevron ${selection.expanded.includes(cabinet.id) ? "is-open" : ""}`}
                          >
                            ⌄
                          </span>
                        </button>
                      </h2>
                      <ShelfEditor
                        cabinet={cabinet}
                        cabinets={cabinets}
                        selection={selection}
                        hidden={hidden}
                        disabled={disabled}
                        onCabinets={updateCabinets}
                        onSelection={update}
                        onHidden={updateHidden}
                      />
                    </div>
                    {selection.expanded.includes(cabinet.id) && (
                      <div id={`bay-${cabinet.id}`} className="px-3 pb-3">
                        <div className="shelf-links grid grid-cols-2 items-stretch gap-2">
                          {categories.map((category) => (
                            <Link
                              key={category.id}
                              to="/shelf/$cat"
                              params={{ cat: category.id }}
                              className="cabinet-label antique-label flex min-h-16 items-center gap-2 rounded-sm px-2 py-3 active:translate-y-px"
                            >
                              {category.drawer === "shelf" &&
                              entries?.some(
                                (entry) => entry.category === category.id && entry.image,
                              ) ? (
                                <span
                                  className="media-previews flex shrink-0 -space-x-2"
                                  aria-label="Saved cover previews"
                                >
                                  {entries
                                    .filter(
                                      (entry) => entry.category === category.id && entry.image,
                                    )
                                    .slice(0, 2)
                                    .map((entry) => (
                                      <img
                                        key={entry.id}
                                        src={entry.image}
                                        alt=""
                                        loading="lazy"
                                        className="h-9 w-6 rounded-sm border border-parchment-deep object-cover shadow-sm"
                                      />
                                    ))}
                                </span>
                              ) : (
                                <ArchiveIcon
                                  category={category.id}
                                  className="h-7 w-7 border-ink-soft/25 bg-ink/5 text-heather"
                                />
                              )}
                              <span className="min-w-0 flex-1 break-words font-display text-lg font-semibold leading-tight">
                                {category.name}
                              </span>
                              <span className="shrink-0 text-xs text-ink-soft">
                                {entries ? count(category.id) : "…"}
                              </span>
                            </Link>
                          ))}
                        </div>
                        {categories.length === 0 && (
                          <p className="py-4 font-hand text-xl text-parchment/80">
                            Choose a subshelf below to make this space yours.
                          </p>
                        )}
                        <details className="shelf-options mt-4 border-t border-brass/30 pt-1">
                          <summary className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-parchment">
                            <Plus className="h-4 w-4" />
                            <span className="flex-1">Explore & choose subshelves</span>
                            <span className="text-xs">{remaining} more</span>
                            <span aria-hidden="true" className="details-chevron">
                              ⌄
                            </span>
                          </summary>
                          <p className="mb-2 text-xs text-parchment/75">
                            Unchecked options are available to add. Hidden options stay in the
                            hidden cabinet.
                          </p>
                          <BookshelfOptions
                            shelf={cabinet.id}
                            selection={selection}
                            hidden={hidden}
                            disabled={disabled}
                            onUpdate={update}
                            onHide={hide}
                          />
                        </details>
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
            {visible.length === 0 && (
              <p className="px-6 py-10 text-center font-hand text-2xl text-parchment">
                A little room for what matters.
                <br />
                <span className="font-sans text-sm">Add a shelf below to begin.</span>
              </p>
            )}
            <div className="bookshelf-foot" aria-hidden="true" />
          </div>
          <div className="space-y-3 px-4 pb-5 pt-5">
            <details className="rounded-sm border border-brass/30 px-4 py-2">
              <summary className="flex min-h-11 cursor-pointer items-center gap-2 font-display text-xl text-primary">
                <Plus className="h-4 w-4" />
                <span className="flex-1">Add a shelf</span>
                <span className="font-sans text-xs text-muted-foreground">
                  {available.length} available
                </span>
                <span aria-hidden="true" className="details-chevron">
                  ⌄
                </span>
              </summary>
              <p className="pb-2 text-sm text-muted-foreground">
                Let your bookshelf grow with you. Open a shelf to choose its subshelves.
              </p>
              {available.map((cabinet) => (
                <div
                  key={cabinet.id}
                  className="flex items-center gap-2 border-t border-border py-1"
                >
                  <label className="flex min-h-12 min-w-0 flex-1 cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={false}
                      disabled={disabled}
                      aria-label={`Add shelf ${cabinet.title}`}
                      onChange={() =>
                        update({
                          ...selection,
                          shelves: [...selection.shelves, cabinet.id],
                          expanded: selection.expanded.includes(cabinet.id)
                            ? selection.expanded
                            : [...selection.expanded, cabinet.id],
                        })
                      }
                      className="h-4 w-4 shrink-0 accent-primary"
                    />
                    <span className="text-sm">
                      {cabinet.title}
                      {shelfCount(cabinet.id) > 0 && (
                        <span className="block text-xs text-muted-foreground">
                          {shelfCount(cabinet.id)} saved records
                        </span>
                      )}
                    </span>
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    aria-label={`Hide shelf ${cabinet.title}`}
                    title="Move to hidden cabinet"
                    onClick={() => hide(shelfHiddenKey(cabinet.id))}
                  >
                    <Archive className="mr-1 h-4 w-4" />
                    <span className="text-xs">Cabinet</span>
                  </Button>
                </div>
              ))}
              {available.length === 0 && (
                <p className="pb-3 text-sm text-muted-foreground">
                  All available shelves are on your bookshelf. Restore hidden shelves in the cabinet
                  below.
                </p>
              )}
            </details>
            <HiddenCabinet
              hidden={hidden}
              cabinets={cabinets}
              disabled={disabled}
              onRestore={(id) => updateHidden(hidden.filter((item) => item !== id))}
            />
            <details className="border-t border-border px-1 pt-1">
              <summary className="min-h-11 cursor-pointer pt-3 text-sm text-muted-foreground">
                Backup & share archive
              </summary>
              <ArchiveActions entries={entries} />
            </details>
            <p className="pt-2 text-center font-hand text-xl text-muted-foreground">
              kept here. shared only by you.
            </p>
          </div>
        </>
      )}
    </AppShell>
  );
}
