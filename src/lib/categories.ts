export type FieldDef = { key: string; label: string; placeholder?: string; type?: "text" | "date" | "time" | "select" | "combo" | "textarea"; options?: string[] };
export type Category = {
  id: string;
  name: string;
  singular: string;
  glyph: string;
  drawer: string;
  titleLabel?: string;
  fields: FieldDef[];
  travel?: boolean; // sensory, coordinates, audio
  wantable?: boolean; // can be marked as "want" (not yet owned/seen)
  image?: boolean; // cover photo upload
  music?: boolean; // artist-first card layout
};

export const DRAWERS = [
  { id: "shelf", name: "The Bookshelf", note: "pages, reels & records" },
  { id: "stubs", name: "Ticket Stubs", note: "nights to remember" },
  { id: "travel", name: "Travel Journal", note: "roads & resting places" },
  { id: "curios", name: "Curiosities", note: "small treasured things" },
] as const;

const date: FieldDef = { key: "date", label: "Date", type: "date" };
const time: FieldDef = { key: "time", label: "Time", type: "time" };

const GRADING = ["Mint (M)", "Near Mint (NM)", "Very Good+ (VG+)", "Very Good (VG)", "Good (G)", "Fair (F)", "Poor (P)"];
const CONDITION = ["Like new", "Very good", "Good", "Worn", "Damaged"];

export const CATEGORIES: Category[] = [
  { id: "books", name: "Books", singular: "Book", glyph: "❧", drawer: "shelf", wantable: true, fields: [
    { key: "creator", label: "Author" }, { key: "year", label: "Year" },
    { key: "format", label: "Edition", type: "combo", options: ["Hardback", "Paperback", "First edition", "Signed edition", "Box set", "E-book", "Audiobook"] },
    { key: "condition", label: "Condition", type: "select", options: CONDITION }] },
  { id: "films", name: "Films", singular: "Film", glyph: "🎞", drawer: "shelf", wantable: true, fields: [
    { key: "creator", label: "Director" }, { key: "year", label: "Year" }, { key: "format", label: "Format", type: "select", options: ["Blu-ray", "DVD", "VHS", "4K", "Digital"] }] },
  { id: "vinyl", name: "Vinyl", singular: "Record", glyph: "◉", drawer: "shelf", wantable: true, image: true, music: true, fields: [
    { key: "creator", label: "Artist" }, { key: "year", label: "Year" },
    { key: "format", label: "Pressing", type: "select", options: ["Standard", "First pressing", "Reissue", "Limited edition", "Picture disc", "Coloured pressing", "Box set"] },
    { key: "weight", label: "Weight", type: "select", options: ["120g", "140g", "180g", "200g", "Other"] },
    { key: "variant", label: "Colour / variant", placeholder: "smoke marble, splatter…" },
    { key: "grading", label: "Grading", type: "select", options: GRADING },
    { key: "signed", label: "Signed?", type: "select", options: ["Signed", "Not signed"] }] },
  { id: "cds", name: "CDs", singular: "CD", glyph: "◎", drawer: "shelf", wantable: true, music: true, fields: [
    { key: "creator", label: "Artist" }, { key: "year", label: "Year" }, { key: "format", label: "Label" },
    { key: "condition", label: "Condition", type: "select", options: CONDITION }] },
  { id: "cassettes", name: "Cassettes", singular: "Tape", glyph: "▭", drawer: "shelf", wantable: true, music: true, fields: [
    { key: "creator", label: "Artist" }, { key: "year", label: "Year" }, { key: "format", label: "Side A / B notes" }] },

  { id: "concerts", name: "Concerts", singular: "Concert", glyph: "♫", drawer: "stubs", titleLabel: "Artist", wantable: true, fields: [
    { key: "venue", label: "Venue" }, date, time] },
  { id: "festivals", name: "Festivals", singular: "Festival", glyph: "⛺", drawer: "stubs", wantable: true, fields: [
    { key: "venue", label: "Location" }, date, { key: "endDate", label: "Until", type: "date" }, time,
    { key: "acts", label: "Acts / performers", type: "textarea", placeholder: "one per line…" },
    { key: "creator", label: "Favourite act" }] },
  { id: "shows", name: "Shows", singular: "Show", glyph: "🎭", drawer: "stubs", wantable: true, fields: [
    { key: "creator", label: "Company / cast" }, { key: "venue", label: "Theatre" }, date, time] },
  { id: "events", name: "Events", singular: "Event", glyph: "✦", drawer: "stubs", wantable: true, fields: [
    { key: "venue", label: "Where" }, date, time, { key: "creator", label: "With whom" }] },

  { id: "travels", name: "Travels", singular: "Journey", glyph: "✈", drawer: "travel", travel: true, fields: [
    { key: "country", label: "Countries", placeholder: "Scotland, Japan…" },
    { key: "city", label: "Cities", placeholder: "Edinburgh, Inverness, Kyoto…" },
    date, { key: "endDate", label: "Until", type: "date" }, { key: "creator", label: "Travelled with" }] },
  { id: "places", name: "Places Visited", singular: "Place", glyph: "⌂", drawer: "travel", travel: true, fields: [
    { key: "country", label: "Town / country" }, date] },
  { id: "thirdplaces", name: "Third Places", singular: "Third Place", glyph: "☕", drawer: "travel", travel: true, fields: [
    { key: "kind", label: "Kind", type: "select", options: ["Café", "Walking path", "Scenery", "Library", "Pub", "Bookshop", "Other"] },
    { key: "country", label: "Town / country" }, date] },

  { id: "fragrances", name: "Fragrances", singular: "Fragrance", glyph: "❦", drawer: "curios", wantable: true, fields: [
    { key: "creator", label: "House" }, { key: "format", label: "Notes", placeholder: "peat, smoke, bergamot…" }] },
  { id: "brews", name: "Coffees & Teas", singular: "Brew", glyph: "☕", drawer: "curios", wantable: true, fields: [
    { key: "creator", label: "Roaster / estate" }, { key: "format", label: "Origin" },
    { key: "kind", label: "Kind", type: "select", options: ["Coffee", "Tea", "Tisane"] },
    { key: "roast", label: "Roast", type: "select", options: ["Light", "Medium", "Medium-dark", "Dark"] },
    { key: "steep", label: "Steep time", type: "select", options: ["30 seconds", "1 minute", "2 minutes", "3 minutes", "4 minutes", "5+ minutes"] },
    { key: "flavor", label: "Flavour profile", placeholder: "bright, citrusy, malty…" }] },
  { id: "favourites", name: "Other Favourites", singular: "Favourite", glyph: "❀", drawer: "curios", wantable: true, fields: [
    { key: "creator", label: "Maker / source" }, date] },
];

export const SENSES = [
  { key: "sight", label: "Sight" }, { key: "sound", label: "Sound" }, { key: "smell", label: "Scent" },
  { key: "taste", label: "Taste" }, { key: "touch", label: "Touch" }, { key: "weather", label: "Weather" },
  { key: "mood", label: "Mood" },
];

export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);
