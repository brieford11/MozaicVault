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

## Development

The app uses React 19, TanStack Start, and Vite with the shared Lovable configuration. Draftbit visual editing uses a source-injection plugin placed before the shared plugins and a custom client entry that imports the generated `.draftbit/init.js` bootstrap. TanStack's route splitting runs before source injection to keep generated branch helpers valid, including in split route modules. Draftbit manages sandbox dependencies with Yarn; do not edit the generated bootstrap.

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
