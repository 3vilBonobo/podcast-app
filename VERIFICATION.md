# Phase 1 verification

Verified locally on 30 October 2026. The initial workspace was empty and was not a Git repository. No GitHub commit, push, or hosted deployment was performed.

## Automated checks

- `npm test`: **31 tests passed across six files**.
- `npm run build`: production compilation passed before the Pages path changes.
- `npm.cmd run build -- --base-href=/podcast-app/`: final production build passed. Initial JavaScript/CSS is approximately **466 kB raw / 117 kB estimated compressed**, excluding lazy feature chunks and assets.
- The generated index uses `/podcast-app/`; the generated service-worker manifest uses `/podcast-app/index.html` and correctly prefixes its cached asset paths.

Coverage includes RSS normalization and original enclosure URLs, theme persistence, guest/demo sessions, IndexedDB storage and failures, favorites, queue changes, saved positions, playback controls, previous-track history, ended/error states, sleep timer expiry, bilingual dictionary parity, referenced translation keys, persisted language, crime tagging, combined catalog filters, and repository-relative asset resolution.

## Browser checks

Checked the actual application with the in-app browser, using desktop and mobile layouts:

- Loaded the real catalog of **172 public RSS entries** and official podcast artwork.
- **Played real Buzzsprout audio.** The latest full episode's elapsed time advanced while playing and continued advancing after navigation from Home to the full player. Later playback position restored after reloading. Unit audio tests separately use a fake audio element.
- Verified skip-forward seeking, playback-speed selection, favorite changes, library persistence after reload, and timer selection/cancellation.
- Verified Archive theme persistence after reload and switching among all three themes. Final Noir uses the requested black, oxblood and brass palette, with custom SVG crime icons.
- Verified the rendered modern typeface is `Inter Variable`.
- Verified invalid and valid mock password forms display prototype feedback; Google shows the explicit unavailable state. Demo account state survives reload, and logout returns to guest mode.
- Opened all five Extras details and expanded their coming-soon previews.
- Verified episode search, season selection, date sorting and combined crime-category selection. Cults plus Robberies returned their combined results.
- Switched to English and verified translated navigation, document titles, catalog filters, Library, Extras, Profile, form validation and duration units. No unresolved translation keys were found in those views. Switched back to Greek.
- Checked mobile layout at 390×844; the measured content and viewport widths both equaled 375 CSS pixels after the scrollbar. No horizontal overflow was observed. The bottom navigation remained visible.
- Saved [desktop](docs/screenshots/desktop-home.jpg) and [mobile](docs/screenshots/mobile-home.jpg) screenshots of the final design.

## GitHub Pages path check

Served the final production output with a temporary local static server beneath **`/podcast-app/`**, matching the target repository URL. The optimized app loaded the catalog, local artwork and typography correctly. Image URLs resolved beneath `/podcast-app/images/`. Navigating to `/podcast-app/episodes` and reloading directly rendered the full catalog correctly, using an index-document fallback equivalent to the workflow's `404.html`. No browser runtime warnings or errors were recorded in that check. The temporary production QA server was stopped afterwards.

The checked-in GitHub Actions workflow is prepared for [3vilBonobo/podcast-app](https://github.com/3vilBonobo/podcast-app). Actual GitHub execution, repository settings, environment approval rules, and availability of the public URL remain unverified until the user pushes the source and enables Pages.

## Verification limits

No real iOS/Android hardware, uninterrupted background playback, lock-screen actions, private feeds, real authentication, subscription entitlement, payment processing or reward validation were tested. Service-worker generation and path configuration were checked; a full offline/install test was not performed. Episode category tags are transparent keyword-based application labels and may need editorial refinement. These limits are also documented in README.

## Milestone 1 stabilization — 12 November 2026

Status: **Milestone 1 complete within the approved local scope**. Browser connection restored and all required functional smoke checks completed. The user approved stabilization and explicitly required no autoplay on app opening. No staging, commit, push, deployment, branch operation, dependency installation, schema change, Milestone 2, backend or Android work was performed. The October 30 results above remain historical.

### Local changes and automated results

- PASS: Pages workflow push trigger changed from `main` to `master`; README uses `master` and no longer tells users to rename branches. Manual dispatch, artifact upload, repository-relative build and `404.html` copy are preserved. No hosted workflow/deployment was run.
- FIXED: root navigation focus stole focus on query-string changes. In the actual production UI, sequential typing `Lead` stopped at `L`, with `main-content` becoming active. Arrow-key library tab selection likewise moved focus to main.
- PASS: root focus now changes only for pathname navigation; query strings/fragments preserve focus, stale scheduled focus is cancelled and teardown clears the timer. Four meaningful tests failed against the original code and passed after correction. Rebuilt-browser typing and library arrow-key checks also pass.
- FIXED: skip-to-content navigation incorrectly returned users from the catalog to Home because its fragment href resolved against the base URL. The link now uses the current route and preserves query parameters while focusing main. Integration regression failed before the correction and passes afterward.
- PASS: two added audio startup tests establish that an empty library stays idle, and a saved episode/position restores paused without any call to `audio.play()`. Explicit Play then starts playback. This confirms existing restoration behavior; no audio-service changes were required.
- PASS: final `npm.cmd test` — **38 tests across seven files**, exit 0 (12 November). These use jsdom/fake audio; they do not establish real media playback or browser UX by themselves.
- PASS: final `npm.cmd run build -- --base-href=/podcast-app/` — production build, exit 0 (12 November); initial output 466.11 kB raw / 117.53 kB estimated transfer, excluding lazy chunks and media.
- PASS: final artifact inspection confirmed `/podcast-app/` base href, `/podcast-app/index.html` service-worker index, generated worker, 172 catalog entries and all 25 referenced packaged artwork files (24 episode images plus podcast artwork).
- PASS: direct HTTP request to the production preview's stable episode URL returned the final app document with the expected 404 fallback status, independently of the browser service worker. Hosted GitHub Pages behavior is still unverified.
- PASS: final diff review and `git diff --check`; no staged changes. Existing source/catalog/styles/dependencies outside the documented scope are unchanged.
- PASS: `IMPLEMENTATION_REPORT.md` preserved byte-for-byte; SHA-256 remains `C16664837543F8A36E72CF0F6CDB86AF46451FC309B25445B2AFC0C7028DADB2`.

### Current browser observations

Production output was served locally at `http://127.0.0.1:4201/podcast-app/`, matching the repository base path. Initial audio/library observations preceded the focus fix. After reconnection, the rebuilt module was identified in the DOM and the remaining checks resumed. A separate `http://localhost:4201/podcast-app/` origin supplied an empty first-visit library without clearing existing data. The browser's actual viewport was initially 1280×720, later 512×601 as the host window changed; no viewport override or systematic Milestone 2 responsive audit was performed.

| Flow | Result | Observed evidence |
| --- | --- | --- |
| Home/catalog and artwork | PASS | Actual 172-entry catalog and packaged artwork rendered |
| Home → catalog → full player → Profile → player → Library navigation | PASS | Each exercised view rendered; shared player persisted across route changes |
| Actual public audio | PASS | Official full Lead Masks episode (`Buzzsprout-19971494`) advanced to 0:18 and then 0:52 across navigation |
| Seeking and controls | PASS | Paused audio, +30 seconds, keyboard range seeking to 1:24; selected 1.25× speed |
| Playback/favorite persistence | PASS | Reload restored 1:24, 1.25× and the selected favorite; Favorites displayed the episode |
| Queue persistence | PASS | Added Chernobyl and Marvin Gaye previews, reordered Marvin first, reloaded and observed retained order |
| Queued transitions | PASS | Next selected Marvin; keyboard End on the full seek control caused actual ended → Chernobyl transition; playback then paused |
| Sleep timer | PASS | Selected 30 minutes, saw 30:00 and retained timer across Profile navigation; cancelled it |
| Programmatic search/filter/sort | PASS | Full-value search returned one Lead Masks result; clear restored catalog; season 4 returned 46; oldest sort began with the trailer |
| Natural typing and library keyboard tabs | FAIL before fix → PASS after fix | Sequential `Lead` remains focused with one result; ArrowRight selects Continue with focus retained on that tab; pathname navigation still focuses main |
| Theme switching and reload persistence | PASS | Archive, After Hours and Noir each retained their `data-theme` and pressed state after reload; restored Follow the system afterward |
| Greek/English UI and reload persistence | PASS | English Profile title/heading and `lang=en` persisted; English catalog/auth/Extras/Plus rendered. Returned to Greek, reloaded, saw `lang=el` and translated Profile |
| Mock login/register/reset/Google/demo/logout | PASS | Empty login reports field errors; valid login/register clear password and show prototype feedback; visibility button changes input type; Google explicitly unavailable; reset explicitly says no email sent; demo survives reload and logout restores guest |
| All five Extras detail routes/previews | PASS | Opened Waking Machine, Secret Archive, Seasonal Events, Rewards and Behind the Mic, expanded each design preview and returned to Extras |
| Direct deep-route reload, episode permalink, Plus and not-found | PASS | Stable Chernobyl GUID detail and catalog query route reloaded beneath base path; Plus linked to official subscription/help URLs without external submission; unknown route showed 404 and recovery link |
| Combined crime categories | PASS | Cults + Robberies selected together, 14 results, URL retained both categories after reload |
| No autoplay on opening/reloading | PASS | Empty first-visit origin showed no current player. Existing-library app opening restored Chernobyl with Play available. Explicit playback reached 43 seconds; reload restored paused at last persisted 39 seconds. Position stayed paused during subsequent navigation |
| Skip-to-content | FAIL before fix → PASS after fix | Final module `main-G2JVPHLS.js`: Enter preserved `/episodes?q=Lead#main-content`, retained `Lead`, kept the archive view and focused main |
| Final production keyboard/player check | PASS | On the final module, natural typing stayed focused; library ArrowRight retained tab focus; full player remained paused at 0:39 with Play available |
| Console review | PASS within exercised scope | No captured warning/error entries in either test tab; final-module console review also returned none. Uncaught-exception detection was not separately exercised |
| Screenshot | PASS | Saved [paused-player evidence](docs/screenshots/milestone-1-paused-player-2026-11-12.jpg), a full-page capture at the observed 512×601 viewport |

The first pass was interrupted by an empty browser inventory; the user reconnected access and testing resumed. An old service-worker version initially reproduced the already-fixed focus bug; the rebuilt module was then loaded and the focus checks passed. The final rebuild was also identified before checking the skip-link correction. This cache observation is not a new source regression; update UX remains a later PWA milestone. No physical-device, background/lock-screen, offline/install, complete runtime-exception detection or hosted GitHub Pages verification is claimed. Auth mode changes retaining previous feedback/visibility are a low-priority UX observation deferred to Milestone 2; no real authentication or email delivery is implied. Test tabs were closed, no viewport override was left, the test speed was restored to 1×, the UI returned to Greek/system theme, and playback was left paused. Existing library data was not cleared.

## Milestone 2 — responsive design, UX and visual quality — 12 November 2026

Milestone 1 was accepted and its changes were committed/pushed as `7fd1573` under the user's separate instruction. This entry records the subsequent, explicitly approved Milestone 2 work. Milestone 2 is implemented and locally verified, ready for user review. Milestone 3, backend and Android development were not started. No Milestone 2 changes were staged, committed, pushed or deployed. The original untracked IMPLEMENTATION_REPORT.md remains unchanged.

### Findings and changes

| Finding | Before | After / evidence |
| --- | --- | --- |
| Full-player obstruction and duplication | At 360px, the fixed mini-player occupied the area over the full player's primary controls | Mini-player is hidden on the full-player route; compact mobile artwork exposes the main controls above bottom navigation. It remains available on other routes. Player controls, seeking, speed, volume, timer and queue were exercised |
| Small interaction targets | Episode play actions were approximately 19px high; some profile/player actions were about 22px | Shared action/icon/range/select targets now have 44px minimum sizing where applicable. The recorded main button/input/select samples have no dimension below 24px; inline text links are not included in that count |
| Narrow Library tab strip | Queue tab extended outside the 360/390px viewport inside a horizontal scroller | Tabs wrap, remain visible and retain keyboard focus; Home/End/arrow behavior is preserved |
| Theme contrast | Archive muted/faint text reached 3.99/3.40:1 on raised surfaces; After Hours faint text 3.63:1 and primary hover text 4.37:1 | Refined semantic colors, accessible control borders and decorative text colors. Measured results below |
| Auth state leakage | Login → Register/Recovery retained obsolete feedback, visible-password choice and validation state | Mode changes clear feedback, password and visibility/validation state while keeping the email. Two new tests failed before the correction and pass afterward |
| Form accessibility | Invalid submission left focus on Submit; description attributes could reference absent error nodes | First invalid field receives focus; description IDs exist only with their rendered errors; visible focus and mobile input sizing improved |
| Player and empty-state semantics | Range values were raw numbers; empty player/404 lacked a primary heading; a translation key appeared as a host tooltip in the accessibility tree | Readable time/percentage range values, configurable primary headings, and removal of the unintended translation-key tooltip |
| Mobile safe-area/scroll clearance | Bottom padding used fixed values in parts of the shell | Added safe-area-aware clearance, scroll margins and viewport-fit coverage. Hardware notch/virtual-keyboard behavior is not claimed |

Code changed: `src/styles.css`, `src/index.html`, `src/app/app.ts`, `src/app/features/auth/auth.ts`, `src/app/features/player/player.ts`, `src/app/shared/empty-state.ts`, `src/app/features/not-found.ts`, and new `tests/auth-ux.test.ts`. Library/Extras layout refinements use existing shared CSS; their state logic is unchanged. No audio-service, RSS, IndexedDB schema, routing configuration, authentication backend or dependency changes were made. All Milestone 1 regressions remain present.

### Browser and viewport coverage

Testing used the in-app Chromium browser and actual rendered DOM/UI interactions. These are **simulated CSS viewports**, not physical-device results. Main matrix origin: Angular development preview `http://127.0.0.1:4202/`. Final optimized build: `http://127.0.0.1:4203/podcast-app/`; separate `localhost:4203` origin checked the empty player without clearing data.

| Width | Main matrix height | Languages | Themes | Post-fix route samples |
| --- | --- | --- | --- | --- |
| 360 | 800 | Greek, English | Noir, Archive, After Hours | 102 |
| 390 | 844 | Greek, English | Noir, Archive, After Hours | 102 |
| 768 | 900 | Greek, English | Noir, Archive, After Hours | 102 |
| 1024 | 900 | Greek, English | Noir, Archive, After Hours | 102 |
| 1280 | 900 | Greek, English | Noir, Archive, After Hours | 102 |

Each configuration covered 17 views: Home, Episodes, stable-GUID Episode Details with the long Greek Lead Masks title/notes, Library, Extras index, all five Extras details, Profile, Plus, Login, Register, Recovery, full player and not-found. All 510 post-fix samples passed the recorded horizontal page-overflow, measured control-size, off-screen measured-control and primary-heading checks. The 85-sample baseline and all 510 results are saved in [responsive matrix](docs/milestone-2-responsive-matrix.json). This is geometry evidence plus representative visual review; it does not imply exhaustive pixel review or every dynamic state in all 510 configurations.

Actual interaction results, saved in [interaction evidence](docs/milestone-2-interaction-results.json):

- PASS at all five widths: natural search typing retains focus; season/date/category controls update the query; Cults and Robberies can be combined; keyboard skip navigation keeps the route/query and focuses main.
- PASS at all five widths: Library End selects and focuses Queue with its tab visible; keyboard focus outlines remain visible. The pre-existing navigation regressions continue to pass.
- PASS at all five widths: invalid auth submission focuses Email with a real error-description target; changing mode clears obsolete feedback and password visibility/value; valid registration and recovery retain explicit prototype/no-email feedback. Greek production checks also confirm the reset; demo reload/logout still works.
- PASS at all five widths: keyboard seeking, 1.25× speed, volume keyboard adjustment with `75%` value text, timer selection/cancellation, player keyboard focus and absence of the duplicate mini-player. Queue add/access/remove and its empty-state recovery were also exercised.
- PASS: all five Extras inline previews opened and closed with Enter at each width (25 expanded-state checks), with correct expanded state and no measured horizontal overflow. There are no custom modal dialogs in this implementation; dropdowns are native selects.
- PASS in the optimized build: full-player checks at all five widths, repo-relative navigation, natural typing/skip-link regression and auth-mode reset. A public Buzzsprout episode actually advanced to **0:33** after explicit Play; reload restored **0:33 paused**. A fresh origin had no player/audio selection, and an empty-player deep link displayed a primary heading. Startup remains free of autoplay.

### Contrast, focus and motion

Solid-background rendered-text checks covered 17 routes in each theme (51 samples), excluding disabled text and reporting gradients/images separately. No failures remained in those computed samples. This is a focused contrast check, not a WCAG certification or pixel-level artwork audit.

| Theme | Minimum tested text-token contrast on four semantic surfaces | Primary hover text | Minimum tested control-boundary contrast |
| --- | --- | --- | --- |
| Noir | 4.58:1 | 6.16:1 | 3.87:1 |
| Archive | 5.35:1 | 9.49:1 | 3.31:1 |
| After Hours | 5.02:1 | 5.31:1 | 3.30:1 |

Decorative gold text was also adjusted in Archive and After Hours; contrast against the respective bright hero-gradient endpoint is 4.63:1 and 5.14:1. Representative gradient/artwork views were visually reviewed; the computed text scan deliberately excludes those backgrounds. First-visit system-theme behavior is preserved. Recommendation: keep that behavior until a separate product decision approves any Noir-first default.

PASS: actual keyboard focus outlines measured 2px on player/range controls; form focus boundaries are visible and have accessible description/state relationships. The shared reduced-motion media rule was inspected in the loaded stylesheet and suppresses animation/transitions and smooth scrolling. **UNVERIFIED:** actual reduced-motion preference emulation (the connected browser exposes viewport/visibility controls only), physical touch/hover behavior, hardware safe areas, virtual keyboards, and a real screen-reader session. Accessibility-tree roles/names/states were inspected; no assistive-technology certification is claimed.

### Screenshots and automated checks

- [Player before, 360px](docs/screenshots/milestone-2/player-360-before.jpg) → [Player after, 360px](docs/screenshots/milestone-2/player-360-after.jpg): the main playback controls are exposed and the duplicate bar is removed.
- [Auth before, 360px](docs/screenshots/milestone-2/auth-360-before.jpg) → [Auth after, 360px](docs/screenshots/milestone-2/auth-360-after.jpg): obsolete validation feedback/visible-password state removed; clearer controls and spacing.
- Representative [Archive tablet Home](docs/screenshots/milestone-2/archive-home-768.jpg) and [After Hours desktop Extras](docs/screenshots/milestone-2/after-hours-extras-1280.jpg) evidence.
- PASS: `npm.cmd test` — **40 tests across eight files**, including all 38 Milestone 1 tests and two new auth regressions.
- PASS: `npm.cmd run build -- --base-href=/podcast-app/` — optimized production build; approximately **469.3 kB raw / 118.0 kB estimated transfer** initial output, excluding lazy chunks/media.
- PASS: final build identity confirmed in the browser (`main-A7T3OER5.js`, `styles-4E2LEXGO.css`); empty-player primary heading, absent raw-key tooltip, paused restored player and hidden duplicate bar verified. The prior preview service worker retained an older module during rebuilds, so the final check used Angular's supported `ngsw-bypass` query without clearing user data. Full update UX remains a Milestone 7 task.
- Console review: no production warnings/errors captured in the exercised flows. Development recorded one Angular **NG0913** warning that a lazy-loaded episode image became LCP; image prioritization/performance measurement is retained for Milestone 7. No application runtime errors were captured; comprehensive uncaught-exception detection was not separately exercised.

PASS: final diff/whitespace review and artifact inspection; Pages base/worker paths, 172 catalog entries and all 25 packaged artwork references remain valid. Test tabs were closed, viewport overrides reset, preferences returned to Greek/system theme/1×, and playback left paused. Temporary QA servers were stopped. No library data was cleared; IMPLEMENTATION_REPORT.md retains SHA-256 `C16664837543F8A36E72CF0F6CDB86AF46451FC309B25445B2AFC0C7028DADB2`.

Remaining limitations: one Chromium engine; no physical iOS/Android, screen-reader session, actual reduced-motion emulation, background/lock-screen/network-interruption certification, offline/install or hosted Pages deployment test. Existing loading/error/empty UI is retained; this pass exercised library/queue and empty-player states but did not inject catalog/network failures. Milestone 3 should next address audio hydration/event races, failure/retry, persistence timing, rapid transitions, sleep-timer suspension and supported Media Session/device interruptions under separately approved scope. No Milestone 3 implementation was performed.
