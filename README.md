# Mozaic Vault

build a mobile app that is:

a cozy and moody aesthetic (think scottish highlands) media and memory archive. A place to manually input all of ones owned books, movies, cds, vinyls, cassettes....as well as manually inputting places they have visited, concerts, festivals, shows, events, other favorites (fragrances, coffees/teas). Separated within a beautifully UI designed, user friendly interface.

it needs to be all manual entry, and only hosted locally (nothing to do with outside parties or clouds). Also, no location services to keep things even more secure.

also have a section for logging past national and international travels. Being able to manually capture the sensory mood of the location. This could also include a map showing past travels, and a pin board for recording "third-places" (cafes, walking paths, beautiful scenery). Being able to give your own person star rating on a 10 star scale. also, there should be an option in addition to notes, to be able to record unedited 20 second audio clips of their present environment for future memories of their travels.

it needs to have the nostalgic feel of a mixture of a physical journal, filling cabinet, scrapbook, bookshelf all in one.

every single item needs to be able to have notes connected to it.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/36d57208-3416-4349-9b74-598db8a24d4f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development and publishing

The app uses React 19 and Vite 8 with React Router 7 framework mode. React Router owns the document and publishing build; its catch-all archive route mounts the existing TanStack Router pages, preserving cabinet links, entry URLs, and local IndexedDB data. SPA mode (`ssr: false`) produces static publishing assets in `build/client`; no runtime server or cloud storage is required for the archive.

Draftbit manages sandbox dependencies with Yarn. The `dev` and `build` scripts use the React Router CLI, `preview` serves the static build, and `test` runs Vitest. Draftbit visual editing uses the source-injection plugin and the client entry’s generated `.draftbit/init.js` bootstrap; do not edit that bootstrap.

Save your work in Draftbit, then use Publishing settings to publish the web app.
