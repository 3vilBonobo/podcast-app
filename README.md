# Dumb & Dahmer — Phase 1

A complete, Greek-first Angular frontend for the Dumb and Dahmer podcast. There is no application backend, real authentication, payment integration, private feed playback, or entitlement system.

## Run locally

Use Node **20.19+** (or a compatible Node 22 release), and npm. Angular 21 is pinned to match the available Node runtime. Exact transitive versions are in `package-lock.json`.

```sh
npm ci
npm start
```

Open **http://127.0.0.1:4200/**. Guest mode supports the entire public listening experience. Profile → “Μπες στο Demo Account” enables only a local, clearly marked mock profile.

```sh
npm test
npm run build
```

The production output is `dist/dumb-and-dahmer/browser`. Configure static hosting to return `index.html` for application routes. Serve over HTTPS in production. The Angular development server already handles route fallback.

## Public RSS catalog

The checked-in catalog contains **172 real public RSS entries**, imported on **30 October 2026** from [the official Buzzsprout feed](https://feeds.buzzsprout.com/2006539.rss). It includes public Plus promotional clips as well as full public episodes; it is not a catalog of private subscriber audio.

```sh
npm run refresh:catalog
npm run build
```

`scripts/import-rss.mjs` fetches the RSS in Node, normalizes metadata, downloads the official show artwork, and atomically replaces `public/data/catalog.json`. Failed imports preserve the previous catalog and exit unsuccessfully; no invented episode fixture is generated. Rebuilding the app does **not** silently require network access or refresh metadata. Refresh explicitly before a release or from a future CI job.

The normalizer retains stable GUIDs, publication dates, duration, episode/season numbers, description text, artwork, explicit/type metadata and the **original audio enclosure URL including its query string**. Missing seasons have a separate filter. Episode descriptions are converted to safe plain text, keeping paragraph breaks. The app does not render untrusted feed HTML.

The catalog marks a clip as a promotional preview only when its description starts with the feed's explicit “Νέο Dumb & Dahmer Plus Episode” announcement and its public enclosure is no longer than three minutes. This is an explainable metadata rule, not a claim of subscription access. Full subscription episode durations mentioned in descriptions are never substituted for public clip durations. Other entries retain their supplied public RSS metadata.

At runtime, `PodcastService` loads this static JSON with Angular HttpClient. No browser RSS request, CORS proxy, or security bypass is used. The first 24 episode artworks and the show artwork are packaged locally for a reliable first render; other images use official URLs. Original artwork URLs remain in the catalog. To package every image, run `npm run refresh:catalog -- --all-artwork`; cached images are reused on subsequent imports. The audio player sets `HTMLAudioElement.src` directly to each official enclosure, preserving Buzzsprout's redirects and audio delivery. No audio download, proxy, rehosting, Web Audio interception, or audio caching is introduced.

## Features and architecture

```text
src/app/core/             Typed models; podcast, player, library, preferences
src/app/shared/           Icons, episode cards, empty states, duration pipes
src/app/features/home/    Editorial home and computed collections
src/app/features/episodes/Search, season filter, sorting, pagination, details
src/app/features/library/Favorites, progress, recent, completed, editable queue
src/app/features/player/ Full player; mini-player lives in the app shell
src/app/features/auth/   Validated mock login/register/password recovery
src/app/features/profile/Local statistics, theme and playback settings
src/app/features/extras/ Five extensible coming-soon experiences
src/app/features/plus/   Official subscription link and private RSS instructions
scripts/                 Build-time feed importer and normalization
tests/                   Service and RSS tests
```

All route components are standalone and lazy loaded. Shared state uses Angular Signals; HttpClient and routing use RxJS where appropriate. Angular's zoneless change detection is used. Tailwind 4 provides utility classes; semantic CSS variables control the complete visual system. No component framework or state management dependency is needed.

**Audio.** One root `AudioPlayerService` owns one audio element across routes. Supports play/pause, previous/next, seeks, −15/+30 seconds, speed, volume where the browser permits it, queue consumption, sleep timer, favorites, remaining time, loading/buffering/error/ended states, and Media Session actions. Selecting a saved episode restores its local position after metadata loads, without autoplaying on page load. Completed episodes restart from zero. The sleep timer survives in-app navigation, but is intentionally not resumed after a browser restart.

**Local data.** `LocalStorageRepository` is an asynchronous IndexedDB persistence boundary. It stores one typed snapshot containing GUID-keyed listening records, favorites, the queue, and the selected episode. Writes are serialized; mutations during initial hydration are applied afterwards. Playback persists approximately every five seconds, on pause, seek, selection changes, and page visibility changes. Abrupt browser termination can lose the last few seconds. A visible message explains unavailable or failed local storage; the in-memory experience remains usable. Browser data deletion removes the local library. Nothing is uploaded.

Listening minutes are calculated from real active playback intervals, excluding seeks, pauses and buffering. Delayed or suspended browser timers are conservatively capped to avoid counting time that cannot be verified. The completed count uses actual ended events. New users start at zero; replaying a completed episode does not remove its completed history. Playback tests use an isolated database and do not seed production listening statistics.

**Appearance.** Noir, Archive and After Hours use semantic tokens for surfaces, text, borders, cards, controls, navigation and player UI. Noir is the dark default. With no explicit choice, system light preference selects Archive and system dark selects Noir. Choosing “Ακολούθησε το σύστημα” clears the explicit preference. Explicit choices persist locally. Reduced motion, visible keyboard focus, a skip link, labeled controls and navigation focus handling are included.

**Language.** Greek is the default. `I18nService` provides a typed navigation dictionary and persisted language choice as infrastructure for future English localization. The English setting is explicitly a **navigation preview**; editorial content and RSS descriptions remain Greek. Complete English translation is future work.

**Mock identity.** Only a boolean demo-session flag is stored. Entered passwords are reset after submission and never stored, transmitted, logged or turned into tokens. Google and password actions display explicit prototype feedback. Recovery never sends an email. Demo users cannot access protected or premium resources. The library is independent of mock identity and remains available after demo logout.

**Extras.** Five clickable cards each have their own route, illustration, coming-soon status and expandable preview. The content is explicitly UI concept copy, not an announcement of released podcast benefits. Collections on Home are labeled application selections and are computed by chronology or actual public duration.

**Plus.** The application links to the [official subscription page](https://www.buzzsprout.com/2006539/subscribe) and [Buzzsprout's private RSS instructions](https://www.buzzsprout.com/help/186-personal-rss). It never asks for or stores a private RSS URL. There is no payment or subscription management UI pretending to be functional.

## PWA and browser behavior

Production builds generate an Angular service worker and web manifest. The worker caches the application shell and locally packaged catalog/artwork, not external episode audio. A previously visited shell can be available offline; podcast streaming still needs internet. Service worker registration is disabled during development. The supplied SVG icon is scalable; dedicated raster/maskable icons can be added for broader install support before a public release.

Background audio, lock-screen controls, volume changes, install prompts and timers depend on the browser and mobile OS. Background playback is not guaranteed, and a suspended browser may apply the sleep timer only when it resumes. Volume controls can be ignored by iOS. Real-device testing remains necessary before a public release.

## Verification

`npm test` covers RSS normalization, original URL retention, deduplication, invalid entries, missing seasons, preview labels, all three themes and their persistence, guest/demo identity, IndexedDB round trips, favorites, queue ordering, playback position, completed state, unavailable storage, audio controls, queue consumption, errors, ended events and timer expiration.

See [VERIFICATION.md](./VERIFICATION.md) for the executed build, test and browser checks. Unit audio tests use a fake audio element; actual public playback is checked separately in a browser. No claims are made about untested mobile hardware, uninterrupted background playback or private audio.

## Future backend integration (not implemented)

1. Replace `PodcastService.load()` with a typed catalog endpoint returning the same normalized `Catalog` and `Episode` interfaces. Move scheduled RSS imports server-side while keeping original public enclosure URLs.
2. Implement a repository interface around the current asynchronous `read`/`write` boundary, add user-scoped records and explicit conflict resolution, and migrate the IndexedDB schema before synchronizing by episode GUID. Keep guest records accessible and ask how to merge them on sign-in.
3. Replace `MockAuthService` with actual identity/session handling. Never promote a demo flag into a real credential or subscription entitlement.
4. Add protected resource validation, confidential private-feed handling and provider-specific subscription integration only after the backend security and product contracts are defined. Do not place private RSS URLs in a public build or browser logs.
5. Give each Extras experience its own lazy feature when its behavior is defined. Do not infer reward or payment rules from these UI previews.

No backend infrastructure has been added in this phase.
