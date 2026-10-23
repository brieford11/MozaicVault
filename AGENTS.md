<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- All user data is stored only in browser IndexedDB (src/lib/db.ts); no cloud, network APIs, or geolocation — user requires fully local, private storage.
- Archive exports are versioned JSON files with embedded audio data URLs, prepared locally before a download or native share click to preserve mobile user activation.
- Category-specific entry compatibility is handled by browser-safe helpers in src/lib/entry-details.ts so older records remain editable and list titles match the editor.
- Maps use bundled world geometry and d3-zoom for local-only pointer-anchored zoom, pan and touch gestures.
- Favorites aggregates explicitly favorited entries and Other Favorites; retain legacy category IDs and routes to preserve stored archives and old links.
- Ticket photos, journey transport legs, and reminders are optional entry properties in the existing IndexedDB store so old archives remain readable.
- Local reminder checks run in the shared root only while the app is open; downloadable ICS alarms provide an explicit user-controlled handoff to a calendar for closed-app reminders.
- Keep the legacy database name and JSON archive format identifier stable across branding changes to preserve existing user data.
- Firebase's web API key is served to the browser by a server function that reads it from the secret store at request time, so it stays out of the source tree and the client bundle; keep that read inside the handler body.
- Cabinet customization uses the existing IndexedDB preferences store and normalized ordered records so newly added cabinets appear without losing previous settings.
- Health tracker details use the existing entry fields and reminder model so private health data remains local and exports remain compatible.
- Atlas pin selection resolves only manually recorded city/town fields through a browser-safe helper, never navigation or remote lookup.
- React Router framework mode owns the publishing shell (`src/root.tsx`, `src/routes.ts`) in SPA mode; the catch-all archive mounts existing TanStack Router pages. Keep archive URLs, IndexedDB data, and the Draftbit client bootstrap intact. Static build output is `build/client`.
