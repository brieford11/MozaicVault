export type FieldDef = {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "date" | "time" | "select" | "combo" | "textarea";
  options?: string[];
  showWhen?: { key: string; value: string };
};
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
  ticket?: boolean;
  reminder?: boolean;
};

export const DRAWERS = [
  { id: "shelf", name: "Media", note: "pages, reels & records" },
  { id: "stubs", name: "Ticket Stubs", note: "nights to remember" },
  { id: "travel", name: "Travel Journal", note: "roads & resting places" },
  { id: "curios", name: "Curiosities", note: "small treasured things" },
  { id: "hearth", name: "Hearth", note: "home & everyday care" },
  { id: "keepsakes", name: "Keepsakes", note: "objects & stories passed down" },
  { id: "sanctum", name: "The Sanctum", note: "a quiet place within" },
  { id: "compass", name: "Inner Compass", note: "words & ways to live by" },
  { id: "pursuits", name: "Pursuits & Passions", note: "ideas taking shape" },
  { id: "motion", name: "Motion & Medicine", note: "movement & personal care" },
] as const;

const date: FieldDef = { key: "date", label: "Date", type: "date" };
const time: FieldDef = { key: "time", label: "Time", type: "time" };

const GRADING = [
  "Mint (M)",
  "Near Mint (NM)",
  "Very Good+ (VG+)",
  "Very Good (VG)",
  "Good (G)",
  "Fair (F)",
  "Poor (P)",
];
const CONDITION = ["Like new", "Very good", "Good", "Worn", "Damaged"];
const COUNTS = [...Array.from({ length: 30 }, (_, i) => String(i + 1)), "40", "50", "100", "Other"];

const journal = (
  id: string,
  name: string,
  singular: string,
  drawer: string,
  fields: FieldDef[] = [],
): Category => ({
  id,
  name,
  singular,
  drawer,
  glyph: "❧",
  image: true,
  fields: [date, ...fields],
});

const NEW_CATEGORIES: Category[] = [
  journal("subscriptions", "Subscriptions", "Subscription", "shelf", [
    { key: "provider", label: "Service / provider" },
    { key: "cost", label: "Cost & currency" },
    {
      key: "billing",
      label: "Billing cycle",
      type: "select",
      options: ["Weekly", "Monthly", "Quarterly", "Yearly", "Other"],
    },
    { key: "renewal", label: "Renewal date", type: "date" },
    { key: "status", label: "Status", type: "select", options: ["Active", "Paused", "Cancelled"] },
  ]),
  journal("heirlooms", "Heirlooms", "Heirloom", "keepsakes", [
    { key: "from", label: "Passed down by" },
    { key: "story", label: "Family story", type: "textarea" },
  ]),
  journal("antiques", "Antiques", "Antique", "keepsakes", [
    { key: "era", label: "Era / age" },
    { key: "maker", label: "Maker" },
    { key: "condition", label: "Condition" },
  ]),
  journal("armory", "Armory", "Armory Item", "keepsakes", [
    { key: "kind", label: "Kind" },
    { key: "maker", label: "Maker / origin" },
    { key: "storage", label: "Storage / care" },
  ]),
  journal("recipes", "Recipes and Traditions", "Recipe or Tradition", "keepsakes", [
    { key: "from", label: "Passed down by" },
    { key: "occasion", label: "Occasion" },
    { key: "ingredients", label: "Ingredients / materials", type: "textarea" },
    { key: "steps", label: "Method / ritual", type: "textarea" },
  ]),
  journal("dreams", "Dream Journal", "Dream", "sanctum", [
    { key: "dream", label: "The dream", type: "textarea" },
    { key: "symbols", label: "Symbols & feelings", type: "textarea" },
  ]),
  journal("meditations", "Meditations", "Meditation", "sanctum", [
    { key: "practice", label: "Practice" },
    { key: "duration", label: "Duration" },
  ]),
  journal("synchronicities", "Synchronicities", "Synchronicity", "sanctum", [
    { key: "pattern", label: "What you noticed", type: "textarea" },
  ]),
  journal("shadow", "Shadow Journal", "Reflection", "sanctum", [
    { key: "prompt", label: "Prompt / trigger", type: "textarea" },
    { key: "reflection", label: "Reflection", type: "textarea" },
  ]),
  journal("blessings", "Blessings & Prayers", "Blessing or Prayer", "sanctum", [
    { key: "words", label: "Words / intention", type: "textarea" },
  ]),
  journal("astrology", "Astrology", "Astrology Entry", "sanctum", [
    { key: "placement", label: "Placement / transit" },
    { key: "reflection", label: "Personal reflection", type: "textarea" },
  ]),
  journal("oracle", "Oracle & Tarot", "Reading", "sanctum", [
    { key: "deck", label: "Deck" },
    { key: "question", label: "Question / intention" },
    { key: "cards", label: "Cards & interpretation", type: "textarea" },
  ]),
  journal("lifeguides", "Life Guides", "Life Guide", "sanctum", [
    { key: "source", label: "Guide / source" },
    { key: "guidance", label: "Guidance", type: "textarea" },
  ]),
  journal("herbs", "Herbs & Oil Logs", "Herb or Oil Log", "sanctum", [
    { key: "herb", label: "Herb / oil" },
    { key: "preparation", label: "Preparation", type: "textarea" },
    { key: "observations", label: "Personal observations", type: "textarea" },
  ]),
  journal("boundaries", "Boundaries", "Boundary", "compass", [
    { key: "boundary", label: "My boundary", type: "textarea" },
    { key: "practice", label: "How I will honor it", type: "textarea" },
  ]),
  journal("affirmations", "Affirmations", "Affirmation", "compass", [
    { key: "words", label: "Affirmation", type: "textarea" },
  ]),
  journal("breathwork", "Breath Work", "Breath Practice", "compass", [
    { key: "practice", label: "Practice / rhythm" },
    { key: "duration", label: "Duration" },
  ]),
  journal("wisdom", "Wisdom", "Wisdom Entry", "compass", [
    { key: "source", label: "Source" },
    { key: "lesson", label: "What I learned", type: "textarea" },
  ]),
  journal("quotes", "Quotes", "Quote", "compass", [
    { key: "words", label: "Quote", type: "textarea" },
    { key: "source", label: "Said / written by" },
  ]),
  journal("philosophies", "Philosophies", "Philosophy", "compass", [
    { key: "source", label: "Source / school" },
    { key: "idea", label: "The idea", type: "textarea" },
  ]),
  journal("lifegoals", "Life Goals", "Life Goal", "compass", [
    { key: "why", label: "Why it matters", type: "textarea" },
    { key: "next", label: "Next small step" },
    { key: "target", label: "Target date", type: "date" },
  ]),
  journal("garden", "Plants & Garden", "Plant or Garden Entry", "hearth", [
    { key: "plant", label: "Plant / variety" },
    { key: "care", label: "Care notes", type: "textarea" },
  ]),
  journal("pets", "Pets", "Pet Entry", "hearth", [
    { key: "pet", label: "Pet's name" },
    { key: "care", label: "Care / routine", type: "textarea" },
  ]),
  journal("groceries", "Home & Grocery List", "Home or Grocery List", "hearth", [
    { key: "items", label: "List items", type: "textarea" },
  ]),
  journal("holidays", "Holiday Attic", "Holiday Keepsake", "hearth", [
    { key: "occasion", label: "Holiday / occasion" },
    { key: "storage", label: "Stored where" },
    { key: "tradition", label: "Tradition / memory", type: "textarea" },
  ]),
  journal("allergies", "Allergies", "Allergy Record", "hearth", [
    { key: "trigger", label: "Allergen / trigger" },
    { key: "reaction", label: "Reaction", type: "textarea" },
    { key: "care", label: "Personal care notes", type: "textarea" },
  ]),
  journal("digitalcrafts", "Digital Crafts & Concepts", "Digital Craft or Concept", "pursuits", [
    { key: "tools", label: "Tools / medium" },
    { key: "concept", label: "Concept", type: "textarea" },
  ]),
  journal("designprojects", "Design Projects", "Design Project", "pursuits", [
    { key: "brief", label: "Project brief", type: "textarea" },
    { key: "status", label: "Progress / next step" },
  ]),
  journal("research", "Research Topics", "Research Topic", "pursuits", [
    { key: "question", label: "Research question", type: "textarea" },
    { key: "sources", label: "Sources", type: "textarea" },
  ]),
  journal("writings", "Writings & Narratives", "Writing or Narrative", "pursuits", [
    { key: "kind", label: "Form / genre" },
    { key: "draft", label: "Draft", type: "textarea" },
  ]),
  journal("movement", "Movement Log", "Movement Entry", "motion", [
    { key: "activity", label: "Activity" },
    { key: "duration", label: "Duration" },
    { key: "feeling", label: "How it felt", type: "textarea" },
  ]),
  journal("medicine", "Medicine Log", "Medicine Entry", "motion", [
    { key: "medicine", label: "Medicine" },
    { key: "dose", label: "Recorded dose" },
    time,
    { key: "observations", label: "Personal observations", type: "textarea" },
  ]),
];

const BASE_CATEGORIES: Category[] = [
  {
    id: "books",
    name: "Books",
    singular: "Book",
    glyph: "❧",
    drawer: "shelf",
    wantable: true,
    fields: [
      { key: "creator", label: "Author" },
      { key: "year", label: "Year" },
      {
        key: "readingStatus",
        label: "Reading status",
        type: "select",
        options: ["Not started", "Up next", "Reading", "Read"],
      },
      { key: "started", label: "Started reading", type: "date" },
      { key: "finished", label: "Finished reading", type: "date" },
      {
        key: "format",
        label: "Edition",
        type: "combo",
        options: [
          "Hardback",
          "Paperback",
          "First edition",
          "Signed edition",
          "Box set",
          "E-book",
          "Audiobook",
        ],
      },
      { key: "condition", label: "Condition", type: "select", options: CONDITION },
      { key: "seriesCount", label: "Books in series", type: "select", options: COUNTS },
      {
        key: "seriesCountOther",
        label: "Number of books",
        showWhen: { key: "seriesCount", value: "Other" },
      },
    ],
  },
  {
    id: "films",
    name: "Films",
    singular: "Film",
    glyph: "🎞",
    drawer: "shelf",
    wantable: true,
    fields: [
      { key: "creator", label: "Director" },
      { key: "year", label: "Year" },
      {
        key: "format",
        label: "Format",
        type: "select",
        options: ["Blu-ray", "DVD", "VHS", "4K", "Digital"],
      },
    ],
    ticket: true,
  },
  {
    id: "tvshows",
    name: "TV Shows",
    singular: "TV Show",
    glyph: "▣",
    drawer: "shelf",
    wantable: true,
    fields: [
      { key: "creator", label: "Creator" },
      { key: "year", label: "Year" },
      {
        key: "format",
        label: "Format",
        type: "select",
        options: ["Blu-ray", "DVD", "VHS", "4K", "Digital"],
      },
      { key: "season", label: "Season" },
      { key: "episode", label: "Episode" },
    ],
  },
  {
    id: "vinyl",
    name: "Vinyl",
    singular: "Record",
    glyph: "◉",
    drawer: "shelf",
    wantable: true,
    image: true,
    music: true,
    fields: [
      { key: "creator", label: "Artist" },
      { key: "year", label: "Year" },
      { key: "discCount", label: "Number of discs", type: "select", options: COUNTS },
      {
        key: "discCountOther",
        label: "Disc count",
        showWhen: { key: "discCount", value: "Other" },
      },
      {
        key: "format",
        label: "Pressing",
        type: "select",
        options: [
          "Standard",
          "First pressing",
          "Reissue",
          "Limited edition",
          "Picture disc",
          "Colored pressing",
          "Box set",
        ],
      },
      {
        key: "weight",
        label: "Weight",
        type: "select",
        options: ["120g", "140g", "180g", "200g", "Other"],
      },
      { key: "variant", label: "Color / variant", placeholder: "smoke marble, splatter…" },
      { key: "grading", label: "Grading", type: "select", options: GRADING },
      { key: "signed", label: "Signed?", type: "select", options: ["Signed", "Not signed"] },
    ],
  },
  {
    id: "cds",
    name: "CDs",
    singular: "CD",
    glyph: "◎",
    drawer: "shelf",
    wantable: true,
    music: true,
    fields: [
      { key: "creator", label: "Artist" },
      { key: "year", label: "Year" },
      { key: "format", label: "Label" },
      { key: "condition", label: "Condition", type: "select", options: CONDITION },
    ],
  },
  {
    id: "cassettes",
    name: "Cassettes",
    singular: "Tape",
    glyph: "▭",
    drawer: "shelf",
    wantable: true,
    music: true,
    fields: [
      { key: "creator", label: "Artist" },
      { key: "year", label: "Year" },
      { key: "format", label: "Side A / B notes" },
    ],
  },

  {
    id: "concerts",
    name: "Concerts",
    singular: "Concert",
    glyph: "♫",
    drawer: "stubs",
    titleLabel: "Artist",
    wantable: true,
    ticket: true,
    reminder: true,
    fields: [
      { key: "venue", label: "Venue" },
      date,
      time,
      {
        key: "concertType",
        label: "Type of concert",
        type: "select",
        options: [
          "Solo artist",
          "Band",
          "Acoustic",
          "Orchestral",
          "Chamber music",
          "Choral",
          "Jazz",
          "Tribute",
          "Other",
        ],
      },
      {
        key: "concertTypeOther",
        label: "Other concert type",
        showWhen: { key: "concertType", value: "Other" },
      },
    ],
  },
  {
    id: "festivals",
    name: "Festivals",
    singular: "Festival",
    glyph: "⛺",
    drawer: "stubs",
    wantable: true,
    ticket: true,
    reminder: true,
    fields: [
      { key: "venue", label: "Location" },
      date,
      { key: "endDate", label: "Until", type: "date" },
      time,
      { key: "acts", label: "Acts / performers", type: "textarea", placeholder: "one per line…" },
      { key: "creator", label: "Favorite act" },
    ],
  },
  {
    id: "shows",
    name: "Shows",
    singular: "Show",
    glyph: "🎭",
    drawer: "stubs",
    wantable: true,
    ticket: true,
    reminder: true,
    fields: [
      { key: "creator", label: "Company / cast" },
      { key: "venue", label: "Theatre" },
      date,
      time,
    ],
  },
  {
    id: "events",
    name: "Events",
    singular: "Event",
    glyph: "✦",
    drawer: "stubs",
    wantable: true,
    ticket: true,
    reminder: true,
    fields: [{ key: "venue", label: "Where" }, date, time, { key: "creator", label: "With whom" }],
  },

  {
    id: "travels",
    name: "Journeys",
    singular: "Journey",
    glyph: "✈",
    drawer: "travel",
    travel: true,
    reminder: true,
    fields: [
      { key: "country", label: "Countries", placeholder: "Scotland, Japan…" },
      { key: "city", label: "Cities", placeholder: "Edinburgh, Inverness, Kyoto…" },
      date,
      { key: "endDate", label: "Until", type: "date" },
      { key: "creator", label: "Traveled with" },
    ],
  },
  {
    id: "places",
    name: "Places Visited",
    singular: "Place",
    glyph: "⌂",
    drawer: "travel",
    travel: true,
    fields: [{ key: "town", label: "Town" }, { key: "country", label: "Country" }, date],
  },
  {
    id: "thirdplaces",
    name: "Social Spaces",
    singular: "Social Space",
    glyph: "☕",
    drawer: "travel",
    travel: true,
    fields: [
      {
        key: "kind",
        label: "Kind",
        type: "select",
        options: ["Café", "Walking path", "Scenery", "Library", "Pub", "Bookstore", "Other"],
      },
      { key: "kindOther", label: "Other kind of place", showWhen: { key: "kind", value: "Other" } },
      { key: "town", label: "Town" },
      { key: "country", label: "Country" },
      date,
    ],
  },

  {
    id: "fragrances",
    name: "Fragrances",
    singular: "Fragrance",
    glyph: "❦",
    drawer: "curios",
    wantable: true,
    fields: [
      { key: "creator", label: "House" },
      { key: "format", label: "Notes", placeholder: "peat, smoke, bergamot…" },
    ],
  },
  {
    id: "brews",
    name: "Coffees & Teas",
    singular: "Brew",
    glyph: "☕",
    drawer: "curios",
    wantable: true,
    fields: [
      { key: "creator", label: "Roaster / estate" },
      { key: "format", label: "Origin" },
      { key: "kind", label: "Kind", type: "select", options: ["Coffee", "Tea", "Tisane"] },
      {
        key: "roast",
        label: "Roast",
        type: "select",
        options: ["Light", "Medium", "Medium-dark", "Dark"],
      },
      {
        key: "steep",
        label: "Steep time",
        type: "select",
        options: ["30 seconds", "1 minute", "2 minutes", "3 minutes", "4 minutes", "5+ minutes"],
      },
      { key: "flavor", label: "Flavor profile", placeholder: "bright, citrusy, malty…" },
    ],
  },
  {
    id: "favourites",
    name: "Other Favorites",
    singular: "Favorite",
    glyph: "❀",
    drawer: "curios",
    wantable: true,
    fields: [{ key: "creator", label: "Maker / source" }, date],
  },
  {
    id: "health",
    name: "Doctor’s Appointments & Symptoms",
    singular: "Health Entry",
    glyph: "♡",
    drawer: "motion",
    reminder: true,
    fields: [
      {
        key: "entryType",
        label: "Entry type",
        type: "select",
        options: ["Doctor's appointment", "Symptom log"],
      },
      date,
      time,
      {
        key: "appointmentKind",
        label: "Appointment kind",
        type: "select",
        options: [
          "Regular checkup",
          "Consultation",
          "Surgery",
          "Test / screening",
          "Treatment",
          "Follow-up",
          "Other",
        ],
      },
      {
        key: "appointmentOther",
        label: "Other appointment kind",
        showWhen: { key: "appointmentKind", value: "Other" },
      },
      { key: "doctor", label: "Doctor / provider" },
      { key: "clinic", label: "Clinic / location" },
      { key: "reason", label: "Reason for visit", type: "textarea" },
      { key: "symptoms", label: "Symptoms", type: "textarea" },
      { key: "onset", label: "Symptom onset", type: "date" },
      {
        key: "severity",
        label: "Symptom severity (0–10)",
        type: "select",
        options: Array.from({ length: 11 }, (_, i) => String(i)),
      },
      { key: "duration", label: "Duration / frequency" },
      { key: "medications", label: "Medications / treatment", type: "textarea" },
      { key: "questions", label: "Questions for the doctor", type: "textarea" },
      { key: "advice", label: "Doctor's advice / next steps", type: "textarea" },
      { key: "followUp", label: "Follow-up date", type: "date" },
    ],
  },
];

// Keep legacy subshelves selected when their shelf is added; new options are opt-in.
export const INITIAL_SUBSHELVES = BASE_CATEGORIES.map((category) => category.id);

export const SENSES = [
  { key: "sight", label: "Sight" },
  { key: "sound", label: "Sound" },
  { key: "smell", label: "Scent" },
  { key: "taste", label: "Taste" },
  { key: "touch", label: "Touch" },
  { key: "weather", label: "Weather" },
  { key: "mood", label: "Mood" },
];

export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);

const BOOK_GENRES = [
  "Literary fiction",
  "Fantasy",
  "Science fiction",
  "Mystery",
  "Thriller",
  "Romance",
  "Historical fiction",
  "Horror",
  "Poetry",
  "Memoir",
  "Non-fiction",
  "Other",
];
const SCREEN_GENRES = [
  "Drama",
  "Comedy",
  "Documentary",
  "Thriller",
  "Mystery",
  "Horror",
  "Romance",
  "Science fiction",
  "Fantasy",
  "Animation",
  "Action",
  "Other",
];
const MUSIC_GENRES = [
  "Rock",
  "Pop",
  "Indie",
  "Folk",
  "Jazz",
  "Classical",
  "Electronic",
  "Ambient",
  "Hip-hop",
  "Soul",
  "Metal",
  "Country",
  "Other",
];
export const CATEGORIES: Category[] = [...BASE_CATEGORIES, ...NEW_CATEGORIES].map((original) => {
  const category = original.drawer === "shelf" ? { ...original, image: true } : original;
  const genres =
    category.id === "books"
      ? BOOK_GENRES
      : ["films", "tvshows"].includes(category.id)
        ? SCREEN_GENRES
        : category.music || ["concerts", "festivals"].includes(category.id)
          ? MUSIC_GENRES
          : category.id === "shows"
            ? ["Musical", "Drama", "Comedy", "Opera", "Dance", "Other"]
            : null;
  return genres
    ? {
        ...category,
        fields: [
          ...category.fields,
          { key: "genre", label: "Genre", type: "select" as const, options: genres },
          { key: "genreOther", label: "Other genre", showWhen: { key: "genre", value: "Other" } },
        ],
      }
    : category;
});

export function getListLabel(category: string): "Watch List" | "Listen List" | "Want List" {
  return ["films", "tvshows"].includes(category)
    ? "Watch List"
    : ["vinyl", "cds", "cassettes"].includes(category)
      ? "Listen List"
      : "Want List";
}
