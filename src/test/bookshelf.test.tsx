import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookshelfOptions } from "@/components/BookshelfOptions";
import { normalizeBookshelf } from "@/lib/bookshelf-preferences";
import { normalizeCabinets } from "@/lib/cabinet-preferences";
import { CATEGORIES } from "@/lib/categories";

describe("Bookshelf choices", () => {
  it("starts with only the media shelf and leaves additions unchecked", () => {
    const choice = normalizeBookshelf(undefined);
    expect(choice.shelves).toEqual(["shelf"]);
    expect(choice.expanded).toEqual(["shelf"]);
    expect(choice.subshelves).toContain("books");
    expect(choice.subshelves).toContain("travels");
    expect(choice.subshelves).toContain("health");
    expect(choice.subshelves).not.toContain("subscriptions");
    expect(choice.subshelves).not.toContain("dreams");
  });

  it("preserves stored choices and closed shelves as the catalog grows", () => {
    const stored = {
      shelves: ["travel", "sanctum"],
      subshelves: ["dreams", "travels"],
      expanded: [],
    };
    expect(normalizeBookshelf(stored)).toEqual({ ...stored, frameColor: "walnut" });
    expect(normalizeBookshelf({ shelves: [], subshelves: [], expanded: [] })).toEqual({
      shelves: ["shelf"],
      subshelves: [],
      expanded: [],
      frameColor: "walnut",
    });
    expect(normalizeCabinets([{ id: "travel", title: "My journeys", color: "rose" }])[0]).toEqual({
      id: "travel",
      title: "My journeys",
      color: "rose",
    });
  });

  it("ignores invalid and duplicated choices without enabling unrelated shelves", () => {
    expect(
      normalizeBookshelf({
        shelves: ["sanctum", "sanctum", null, "missing"],
        subshelves: ["dreams", "dreams", "missing"],
        expanded: ["missing"],
      }),
    ).toEqual({ shelves: ["sanctum"], subshelves: ["dreams"], expanded: [], frameColor: "walnut" });
  });

  it("offers unchecked subshelves, excludes hidden ones, and supports selecting or hiding", () => {
    const onUpdate = vi.fn();
    const onHide = vi.fn();
    const selection = normalizeBookshelf({
      shelves: ["sanctum"],
      subshelves: [],
      expanded: ["sanctum"],
    });
    render(
      <BookshelfOptions
        shelf="sanctum"
        selection={selection}
        hidden={["shadow"]}
        disabled={false}
        onUpdate={onUpdate}
        onHide={onHide}
      />,
    );
    expect(screen.queryByLabelText("Show Shadow Journal")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Show Dream Journal")).not.toBeChecked();
    fireEvent.click(screen.getByLabelText("Show Dream Journal"));
    expect(onUpdate).toHaveBeenCalledWith({ ...selection, subshelves: ["dreams"] });
    fireEvent.click(screen.getByRole("button", { name: "Hide Dream Journal" }));
    expect(onHide).toHaveBeenCalledWith("dreams");
  });

  it("keeps legacy category identifiers and gives every new shelf usable entry fields", () => {
    for (const id of ["books", "health", "travels", "favourites"])
      expect(CATEGORIES.find((item) => item.id === id)).toBeDefined();
    for (const drawer of ["keepsakes", "sanctum", "compass", "pursuits", "motion"]) {
      const categories = CATEGORIES.filter((item) => item.drawer === drawer);
      expect(categories.length).toBeGreaterThan(0);
      for (const category of categories)
        expect(category.fields.some((field) => field.key === "date")).toBe(true);
    }
    expect(new Set(CATEGORIES.map((item) => item.id)).size).toBe(CATEGORIES.length);
  });
});
