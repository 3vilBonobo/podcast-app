# Dumb & Dahmer implementation report

Reviewed on 30 October 2026 against the local source, checked-in catalog, test files, deployment workflow and recorded browser verification. This review does not change application code or deploy the website.

## Assessment

Phase 1 is a usable frontend with real public podcast playback, a persistent local library, bilingual UI, a complete responsive shell and clearly labeled prototypes. It is ready for a controlled public beta after deployment alignment and real-device checks. It is not yet a complete account-based or premium listening product.

The best next investment is release reliability, catalog accuracy and device testing before adding backend infrastructure.

## Implementation inventory

| Area           | Implemented                                                                                                                                                 | Boundary / remaining work                                                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundation     | Angular 21 standalone components, strict TypeScript, Signals, RxJS, Tailwind 4 and lazy route components                                                    | No application backend or external state-management framework                                                                                              |
| Navigation     | Home, Episodes, Library, Extras and Profile; mobile bottom navigation; desktop sidebar                                                                      | Full automated browser navigation coverage can be expanded                                                                                                 |
| Branding       | Gothic Noir with black, oxblood and brass; modern self-hosted Inter; original SVG crime icons                                                               | Supplied artwork reference informed the palette; episode artwork remains sourced from the official feed                                                    |
| Themes         | Noir, Archive and After Hours; persisted preference; system preference support                                                                              | A first-time visitor with a light system preference sees Archive. Decide whether the updated brand requirement instead calls for Noir on every first visit |
| Home           | Latest entry, recent entries, continue listening when activity exists, season browsing, computed collections, Extras and Plus promotions                    | Collections are application selections, not official podcast-curated collections                                                                           |
| Catalog        | 172 real public feed entries; search, season filter, date sorting, detail pages and incremental rendering                                                   | Catalog refresh is a manual import/build step; it is not live RSS polling                                                                                  |
| Crime filters  | Serial killers, cults, robberies, historical cases, unsolved mysteries, disappearances and Other                                                            | Tags are keyword-based application classifications; 98 entries currently fall into Other. Editorial review is needed                                       |
| Player         | Real official audio URLs; play/pause; previous/next; seeking; −15/+30 seconds; speed; volume; queue; timer; remaining time; favorites; mini and full player | Background playback, lock-screen integration, volume and timer behavior depend on browser/OS support                                                       |
| Persistence    | IndexedDB favorites, listening records, queue and selected episode; position restoration; serialized writes; storage error messages                         | Local to the browser. No cloud sync, backup/export or account-linked storage                                                                               |
| Profile        | Guest/demo identity, local activity statistics, favorites count and preferences                                                                             | No real user identity or editable cloud profile                                                                                                            |
| Authentication | Validated Login/Register/Forgot Password prototypes, password visibility, demo session and explicit Google placeholder feedback                             | No real login, email recovery, OAuth, tokens or protected resources                                                                                        |
| Languages      | Transloco 8; 308 messages in each Greek/English dictionary; runtime switching; translated page titles; persisted choice                                     | Original RSS titles/descriptions remain in Greek                                                                                                           |
| Extras         | Five dedicated coming-soon detail routes and expandable previews                                                                                            | No released game, reward validation, bonus media or collectibles system                                                                                    |
| Plus           | Official subscription link and private RSS guidance                                                                                                         | No payment processing, entitlement checks, private RSS collection or private playback                                                                      |
| PWA            | Production manifest/service worker; packaged shell, catalog, artwork and fonts                                                                              | Install/offline/update flows need full device testing; dedicated raster and maskable icons remain to be added. Audio is not cached                         |
| Hosting        | GitHub Pages workflow, repository-relative assets, SPA fallback and README instructions                                                                     | Current branch mismatch needs resolution; hosted deployment status was not confirmed in this review                                                        |

## Data and quality evidence

- Catalog: **172 public RSS entries**, imported on 30 October 2026; **18 identified public Plus promotional previews** and **154 other public entries**. No invented fixture data is used.
- The first **24 episode artworks** and show artwork are packaged locally. Original image URLs remain in the catalog.
- Category memberships overlap: 33 serial-killer entries, 8 cult entries, 6 robbery entries, 7 historical entries, 19 unsolved entries, 12 disappearance entries, and 98 Other entries. These are discovery labels, not official RSS category metadata.
- Local verification records **31 passing automated tests across six files**. This review inspected those results and source; it did not rerun unchanged tests.
- The last production build passed with the `/podcast-app/` base path: approximately **466 kB initial raw JavaScript/CSS**, or **117 kB estimated compressed**, excluding lazy chunks, fonts and images.
- Browser checks previously confirmed real Buzzsprout playback, playback across navigation, restored positions, local favorites, timer controls, mock account flows, themes, English switching, filtering, Extras and mobile layout.
- A production build was served locally beneath `/podcast-app/`; catalog/artwork paths and direct route reloads worked.
- Actual iOS/Android hardware, uninterrupted background playback, complete PWA installation/offline behavior and WCAG conformance have not been verified.

Detailed test evidence is in [VERIFICATION.md](VERIFICATION.md). Setup, RSS refresh and publishing steps are in [README.md](README.md).

## Immediate deployment finding

The local checkout is on **`master`**, tracking **`origin/master`**, and had no uncommitted changes when this review began. The remote is `https://github.com/3vilBonobo/podcast-app.git`.

However, `.github/workflows/deploy-pages.yml` only triggers automatic deployment for pushes to **`main`**. A push to the current `master` branch will therefore not start that push-triggered deployment. The workflow also supports manual dispatch.

Choose one branch convention before release:

1. Keep `master` and update the workflow trigger and README to match it; or
2. Rename/use `main`, update the repository's default branch and push there consistently.

The review's web lookup could not confirm the live Pages URL or workflow results. That is not proof that deployment failed. Verify the latest workflow run and then smoke-test the live site after aligning branches.

## Recommended next steps

### 1. Stabilize the public release

Resolve the branch mismatch, verify a successful Pages run, then check Home, deep links, streaming, favorites after reload and English switching on the hosted origin. Confirm a second deployment updates existing installations correctly. Keep the guest experience as the release baseline.

**Acceptance:** one repeatable deployment process and a successful hosted smoke test, including a returning browser with previously cached assets.

### 2. Test actual listening devices

Test Safari on an iPhone and Chrome on an Android device, plus desktop browsers. Cover screen lock, returning from another app, network interruption, long episodes, seeking, queue progression, timer expiry and reopening the browser. Document any OS limitations instead of promising universal background audio.

**Acceptance:** a small device matrix recording which controls work and how failures recover without losing the local library.

### 3. Improve category accuracy

Review the 98 Other entries and introduce a curated GUID-to-category override file so the hosts can correct classifications without changing the classifier. Consider adding fraud/scams and individual murder cases only if they fit the actual catalog. Keep the keyword classifier as a fallback.

**Acceptance:** reviewed tags for the public catalog and an easy way to correct an episode while preserving its original RSS metadata.

### 4. Automate catalog maintenance

Add a scheduled GitHub Actions import or an explicit refresh workflow. Keep the existing atomic import behavior so failed feed requests preserve the last good catalog. Record refresh time and report import failures.

**Acceptance:** new public episodes appear through a documented, monitored refresh/deployment process without a runtime CORS proxy or application backend.

### 5. Finish PWA and accessibility checks

Add raster/maskable icons, a clear update-available flow and device installation checks. Review keyboard navigation, focus, screen-reader labels, text sizes, contrast and touch targets in both languages and every theme. Recheck the modern headings on small screens and long episode titles.

**Acceptance:** a documented install/update/offline-shell test and an accessibility review with concrete issues resolved. Streaming remains an online feature.

### 6. Add useful frontend improvements

Add share/copy episode links and local library export/import with schema validation. These improve everyday use while keeping the application independent of accounts. A more intentional empty-library introduction and editorial collections would also help first-time listeners.

### 7. Define one Extras experience

Choose one small, complete experience—such as a short Waking Machine mystery—with clear beginning/end states and original content. Define its rules and content before expanding the other four placeholders or introducing rewards.

### 8. Plan Phase 2 around a real need

When cross-device synchronization is required, define identity, guest-to-account merging, profile ownership and conflict handling first. Introduce actual authentication and synchronization behind explicit service/repository interfaces. Premium content needs a separate provider/entitlement design; a demo session must never become an entitlement.

Backend implementation, private feed playback, payments and reward verification remain outside the delivered Phase 1 scope.

## Suggested milestone order

1. **Public beta:** deployment alignment, hosted smoke test and real-device listening checks.
2. **Reliable listening release:** curated categories, automatic catalog refresh, PWA update flow and accessibility fixes.
3. **Distinctive product release:** sharing, library backup and one finished Extras experience.
4. **Account release:** real identity and cross-device synchronization, once its requirements are agreed.

No additional feature implementation, branch changes or deployment were performed as part of this report.
