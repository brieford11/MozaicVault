export type FieldDef = { key: string; label: string; placeholder?: string; type?: "text" | "date" | "select"; options?: string[] };
export type Category = {
  id: string;
  name: string;
  singular: string;
  glyph: string;
  drawer: string;
  fields: FieldDef[];
  travel?: boolean; // sensory, coordinates, audio
};

export const DRAWERS = [
  { id: "shelf", name: "The Bookshelf", note: "pages, reels & records" },
  { id: "stubs", name: "Ticket Stubs", note: "nights to remember" },
  { id: "travel", name: "Travel Journal", note: "roads & resting places" },
  { id: "curios", name: "Curiosities", note: "small treasured things" },
] as const;

const date: FieldDef = { key: "date", label: "Date", type: "date" };

export const CATEGORIES: Category[] = [
  { id: "books", name: "Books", singular: "Book", glyph: "❧", drawer: "shelf", fields: [
    { key: "creator", label: "Author" }, { key: "year", label: "Year" }, { key: "format", label: "Edition", placeholder: "Hardback, first printing…" }] },
  { id: "films", name: "Films", singular: "Film", glyph: "🎞", drawer: "shelf", fields: [
    { key: "creator", label: "Director" }, { key: "year", label: "Year" }, { key: "format", label: "Format", type: "select", options: ["Blu-ray", "DVD", "VHS", "4K", "Digital"] }] },
  { id: "vinyl", name: "Vinyl", singular: "Record", glyph: "◉", drawer: "shelf", fields: [
    { key: "creator", label: "Artist" }, { key: "year", label: "Year" }, { key: "format", label: "Pressing", placeholder: "180g, reissue…" }] },
  { id: "cds", name: "CDs", singular: "CD", glyph: "◎", drawer: "shelf", fields: [
    { key: "creator", label: "Artist" }, { key: "year", label: "Year" }, { key: "format", label: "Label" }] },
  { id: "cassettes", name: "Cassettes", singular: "Tape", glyph: "▭", drawer: "shelf", fields: [
    { key: "creator", label: "Artist" }, { key: "year", label: "Year" }, { key: "format", label: "Side A / B notes" }] },

  { id: "concerts", name: "Concerts", singular: "Concert", glyph: "♫", drawer: "stubs", fields: [
    { key: "creator", label: "Artist" }, { key: "venue", label: "Venue" }, date] },
  { id: "festivals", name: "Festivals", singular: "Festival", glyph: "⛺", drawer: "stubs", fields: [
    { key: "venue", label: "Location" }, date, { key: "creator", label: "Favourite act" }] },
  { id: "shows", name: "Shows", singular: "Show", glyph: "🎭", drawer: "stubs", fields: [
    { key: "creator", label: "Company / cast" }, { key: "venue", label: "Theatre" }, date] },
  { id: "events", name: "Events", singular: "Event", glyph: "✦", drawer: "stubs", fields: [
    { key: "venue", label: "Where" }, date, { key: "creator", label: "With whom" }] },

  { id: "travels", name: "Travels", singular: "Journey", glyph: "✈", drawer: "travel", travel: true, fields: [
    { key: "country", label: "Country / region" },
    { key: "scope", label: "Kind", type: "select", options: ["National", "International"] },
    date, { key: "endDate", label: "Until", type: "date" }, { key: "creator", label: "Travelled with" }] },
  { id: "places", name: "Places Visited", singular: "Place", glyph: "⌂", drawer: "travel", travel: true, fields: [
    { key: "country", label: "Town / country" }, date] },
  { id: "thirdplaces", name: "Third Places", singular: "Third Place", glyph: "☕", drawer: "travel", travel: true, fields: [
    { key: "kind", label: "Kind", type: "select", options: ["Café", "Walking path", "Scenery", "Library", "Pub", "Bookshop", "Other"] },
    { key: "country", label: "Town / country" }, date] },

  { id: "fragrances", name: "Fragrances", singular: "Fragrance", glyph: "❦", drawer: "curios", fields: [
    { key: "creator", label: "House" }, { key: "format", label: "Notes", placeholder: "peat, smoke, bergamot…" }] },
  { id: "brews", name: "Coffees & Teas", singular: "Brew", glyph: "☕", drawer: "curios", fields: [
    { key: "creator", label: "Roaster / estate" }, { key: "format", label: "Origin" }, { key: "kind", label: "Kind", type: "select", options: ["Coffee", "Tea", "Tisane"] }] },
  { id: "favourites", name: "Other Favourites", singular: "Favourite", glyph: "❀", drawer: "curios", fields: [
    { key: "creator", label: "Maker / source" }, date] },
];

export const SENSES = [
  { key: "sight", label: "Sight" }, { key: "sound", label: "Sound" }, { key: "smell", label: "Scent" },
  { key: "taste", label: "Taste" }, { key: "touch", label: "Touch" }, { key: "weather", label: "Weather" },
  { key: "mood", label: "Mood" },
];

export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);
