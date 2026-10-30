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
