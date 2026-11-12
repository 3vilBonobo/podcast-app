**GitHub Pages:** [https://3vilbonobo.github.io/podcast-app/](https://3vilbonobo.github.io/podcast-app/) · Available after the first successful deployment.

# Dumb & Dahmer — Phase 1

A complete, Greek-first Angular frontend for the Dumb and Dahmer podcast. There is no application backend, real authentication, payment integration, private feed playback, or entitlement system.

## Publish to GitHub Pages

Repository: [3vilBonobo/podcast-app](https://github.com/3vilBonobo/podcast-app). The included [deployment workflow](.github/workflows/deploy-pages.yml) installs dependencies, runs tests, builds the Angular frontend and deploys its static output. No backend or separate hosting service is required.

1. Create the `podcast-app` repository under `3vilBonobo` if it does not already exist. For GitHub Free, use a public repository. If it is a new repository, create it empty without a generated README so it can receive these files cleanly.
2. Push this project and its `package-lock.json` to the repository's `master` branch. This repository uses `master`; keep that branch convention. If the folder is already connected, use your normal commit and push workflow; do not reinitialize it or add a duplicate remote.
3. In GitHub, open **Settings → Pages → Build and deployment → Source**, then select **GitHub Actions**. This workflow publishes built artifacts; do not select “Deploy from a branch.”
4. Open **Actions → Deploy to GitHub Pages**. The push to `master` starts deployment automatically. If necessary, select **Run workflow → master → Run workflow** after enabling Pages.
5. When both `build` and `deploy` are green, open [the live app](https://3vilbonobo.github.io/podcast-app/). Later pushes to `master` publish updates automatically.

First push from this project folder, for a new empty repository:

```sh
git init --initial-branch=master
git add .
git commit -m "Build Dumb and Dahmer frontend"
git remote add origin https://github.com/3vilBonobo/podcast-app.git
git push -u origin master
```

If the remote already contains commits, clone it into another folder and copy this project into that clone before committing. Do not force-push over existing work. Git may ask you to authenticate with your GitHub account.

The workflow derives Angular's `base href` from the repository name, so the catalog, locally packaged artwork, fonts, router links and service worker work under `/podcast-app/`. It also includes a copy of `index.html` as `404.html`, allowing direct navigation to client routes on GitHub Pages. GitHub still returns an HTTP 404 status for such first-load deep links; the Angular app renders normally. The main app URL returns normally.

For a manual production build matching this URL:

```sh
npm ci
npm test
npm run build -- --base-href=/podcast-app/
```

In Windows PowerShell, use `npm.cmd run build -- --base-href=/podcast-app/` if the npm PowerShell shim does not forward the extra arguments.

The artifact directory is `dist/dumb-and-dahmer/browser`. Normal application releases use the checked-in public snapshot without depending on Buzzsprout. The prepared RSS refresh workflow uses the same validated build/Pages publication pipeline. No custom secret or paid service is required; it uses the built-in `GITHUB_TOKEN`.

If deployment reports “Pages not enabled,” check that **Source = GitHub Actions**. If the workflow never starts, confirm that you pushed to `master` and that Actions are enabled. For a custom domain, change the build base to `/` and configure the domain in Pages settings before deployment.

See [GitHub's official custom workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) for Pages permissions, artifact upload and deployment details.

## Automatic public catalog refresh

Schedules run only after their workflow definitions are approved and published to the repository's default branch. Editing local files does not activate GitHub Actions. Commit, push, deployment and activation require the project's explicit approval; see VERIFICATION.md for the current implementation and activation status.

After approval and publication, **Actions → Refresh public RSS catalog → Run workflow** refreshes manually. Its two schedules are `5 7 * * 3` and `5 7 13 * *`, each with `timezone: Europe/Athens`: Wednesday and the monthly 13th at 07:05 local time. GitHub supports [IANA timezone schedules and DST](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onschedule); scheduled execution may be delayed by Actions load. The Wednesday run owns an overlapping Wednesday/13th refresh, while manual refresh remains available.

The importer reads only the official public Buzzsprout feed, validates XML and consumed metadata, and compares normalized data with the published catalog. Timestamps and derived packaged-image paths do not trigger publication. Unchanged runs do not build, commit or deploy. Invalid/unavailable feeds, duplicate GUIDs, missing existing GUIDs or unusable metadata fail before replacing the previous catalog. A feed reduction stops for review rather than guessing whether episodes were intentionally removed.

Changed data is tested and built before the prepared workflow commits only the generated catalog/artwork to `master` and deploys the artifact. Publication is serialized with normal releases; stale-source checks block superseded builds. A failed deployment can retry against the published baseline without another timestamp-only commit. Repository policy must permit the bot's restricted `contents: write` push; branch protection is not bypassed. [Built-in-token pushes do not start another push workflow](https://docs.github.com/en/actions/concepts/security/github_token), so the same reusable pipeline performs the deployment directly.

For a read-only local comparison:

```sh
npm run refresh:catalog -- --dry-run --published-url https://3vilbonobo.github.io/podcast-app/
```

Run `npm run refresh:catalog` to update local generated files after review; `--all-artwork` retains the optional full artwork packaging mode. Official GUIDs, enclosure URLs and preview identification are preserved. Changed catalogs are atomically replaced after validation; existing artwork references are retained, including entries moving out of the newest 24.

Once the updated client/service worker is adopted, catalog JSON uses network-first data caching with a bounded offline fallback, independent of application asset versions. Open clients recheck every 15 minutes while visible and on return after that interval. A failed/invalid background response retains the valid in-memory catalog and does not interrupt playback. Existing installations need the initial client/service-worker upgrade; future catalog changes require no new application feature release. This does not provide offline audio.

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

Crime-category tags are explicitly **application editorial tags**, inferred from public episode titles and descriptions in `scripts/crime-categories.mjs`. They are not official RSS categories or verified claims. Episodes can have multiple tags; unmatched entries remain visible under Other cases. Catalog filters combine selected categories with OR, then intersect them with search, season and duration filters. Choices are shareable query parameters. The keyword rules are intentionally easy to review and refine.

At runtime, `PodcastService` loads this static JSON with Angular HttpClient. No browser RSS request, CORS proxy, or security bypass is used. The first 24 episode artworks and the show artwork are packaged locally for a reliable first render; other images use official URLs. Original artwork URLs remain in the catalog. To package every image, run `npm run refresh:catalog -- --all-artwork`; cached images are reused on subsequent imports. The audio player sets `HTMLAudioElement.src` directly to each official enclosure, preserving Buzzsprout's redirects and audio delivery. No audio download, proxy, rehosting, Web Audio interception, or audio caching is introduced.

## Features and architecture

```text
src/app/core/             Typed models; podcast, player, library, preferences
src/app/shared/           Custom crime icons, episode cards, empty states, duration pipes
src/app/i18n/             Complete Greek and English Transloco dictionaries
src/app/features/home/    Editorial home and computed collections
src/app/features/episodes/Search, season/category filters, sorting, pagination, details
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

**Appearance.** The default dark Noir theme uses velvet black, oxblood, blood-red details and candlelit brass inspired by the supplied brand reference. Self-hosted Inter Variable supplies modern Greek and Latin typography; its OFL license is included in `public/Inter-LICENSE.txt`. Original SVG icons use mansion architecture, evidence files, blades, seals and blood-ink details, with familiar functional silhouettes. Noir, Archive and After Hours use semantic tokens for surfaces, text, borders, cards, controls, navigation and player UI. Noir is the dark default. With no explicit choice, system light preference selects Archive and system dark selects Noir. Choosing “Ακολούθησε το σύστημα” clears the explicit preference. Explicit choices persist locally. Reduced motion, visible keyboard focus, a skip link, labeled controls and navigation focus handling are included.

**Language.** Greek is the default. **Transloco 8** provides complete Greek and English interface dictionaries in `src/app/i18n/el.json` and `en.json`. The EN/EL control in the header and the Profile language setting switch navigation, page titles, controls, forms, settings, Extras, errors and empty states immediately. The choice persists locally. Both dictionaries are bundled for offline switching. RSS titles and descriptions retain their original Greek; the application does not invent translated episode content.

**Mock identity.** Only a boolean demo-session flag is stored. Entered passwords are reset after submission and never stored, transmitted, logged or turned into tokens. Google and password actions display explicit prototype feedback. Recovery never sends an email. Demo users cannot access protected or premium resources. The library is independent of mock identity and remains available after demo logout.

**Extras.** Five clickable cards each have their own route, illustration, coming-soon status and expandable preview. The content is explicitly UI concept copy, not an announcement of released podcast benefits. Collections on Home are labeled application selections and are computed by chronology or actual public duration.

**Plus.** The application links to the [official subscription page](https://www.buzzsprout.com/2006539/subscribe) and [Buzzsprout's private RSS instructions](https://www.buzzsprout.com/help/186-personal-rss). It never asks for or stores a private RSS URL. There is no payment or subscription management UI pretending to be functional.

## Editorial metadata and discovery

Search ignores Greek accents, case and final-sigma differences. Every search word must match somewhere in the title, description or reviewed tags. Selected categories use OR; season, collection and search use AND. Publication-date sorting and filter URLs work together.

Host-reviewed categories, additional tags, collections and featured selections are kept separately in [editorial/overrides.json](editorial/overrides.json), keyed by exact RSS GUIDs. The original RSS snapshot and official audio/artwork remain unchanged. Episode details distinguish importer suggestions from reviewed categories. Overrides are initially empty; no editorial decisions have been invented.

The [host guide](editorial/README.md) explains the editable [Other review CSV](editorial/review-other.csv) and these local tools:

```sh
npm run editorial:review
npm run editorial:apply
npm run editorial:check
```

Review only episodes the hosts have actually checked. CSV application ignores rows without `reviewed=yes`; generation preserves prior decisions and notes. Collections require host-supplied titles and memberships. These commands never publish or perform Git operations. Editorial updates use the normal application build; automatic RSS updates retain their independent Milestone 3 path.

## PWA and browser behavior

Production builds generate an Angular service worker and web manifest. The worker caches the application shell and locally packaged catalog/artwork, not external episode audio. A previously visited shell can be available offline; podcast streaming still needs internet. Service worker registration is disabled during development. The supplied SVG icon is scalable; dedicated raster/maskable icons can be added for broader install support before a public release.

The catalog's network-first cache can fall back on connection loss/timeouts after a successful visit. A cold reload receiving an HTTP error such as 503 instead shows Retry; Angular does not treat HTTP error responses as connection failures. Already-open clients retain their valid in-memory catalog on either failure. See the Milestone 4 verification entry for the exercised cases and remaining hosted-deployment limits.

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
