# Catalog and discovery refinement — 12 November 2026

Local implementation after `96e688e`. No Git publication or workflow activation performed.

## Discovery and design

The Episodes page now has a compact heading, a separate public/Plus collection switch and one rounded discovery panel. Search, season and sort share a row. Crime categories and format tags have distinct, quiet labels. Advanced Filters is a native keyboard-operable disclosure, closed by default. Its country selection survives closing and URL reload, with an active indicator. Guidance lives inside the disclosure rather than between competing panels.

On narrow screens, category and format chips scroll within their own rows. The document itself does not overflow. Existing crime categories remain; categories use OR, while every selected format tag and country use AND. All Cases clears only crime categories. Clear Filters resets discovery to the default public collection. Search, collection, categories, formats, country, season and sorting use the existing router query parameters.

Shared visual refinements cover navigation, inputs, buttons, cards, Home hero, Library tabs, Profile, backup dialogs, authentication, Extras, Plus and player surfaces. Inter and all three theme palettes remain. Consistent radii, quieter borders, artwork-led cards, typography hierarchy and restrained shadows replace competing square boxes. Motion respects reduced-motion preferences. The first-visit system-theme policy is unchanged.

The separate creative review identified two weaknesses in the first implementation: repeated bordered filter panels and excessive height before results. A second pass consolidated the panels, shortened labels, moved guidance into Advanced and tightened mobile spacing. At the five requested viewport settings, final DOM measurements placed the results line around 745–780 px from the top, compared with approximately 813–1023 px in the earlier pass after manually refreshing. These are approximate layout measurements, not a controlled performance benchmark.

Screenshots: [before](screenshots/catalog-overhaul/before.png), [final desktop](screenshots/catalog-overhaul/episodes-1280.png), [final mobile](screenshots/catalog-overhaul/episodes-390.png). The baseline shows the older worker-controlled application; it is not the exact user-supplied screenshot. Final production screen verified `main-P7F52DFI.js`.

## Catalog and evidence coverage

The existing strict importer refreshed the local snapshot from 172 to **173** entries: **155 public listening entries and 18 verified public Plus promotional previews**. The missing entry is the November 4 OneTaste episode. No duration-only preview heuristic was introduced. Official enclosure URLs, GUIDs, original titles/descriptions and source season values remain in the raw catalog. Home's latest/recent browsing and default discovery exclude Plus previews; previews remain accessible in the collection switch and existing episode permalinks.

The metadata inventory covers all 173 GUIDs. `editorial/catalog-review.csv` records dates, source type, public/preview status, source/display season, categories, countries, Greek qualification, guests, format tags, evidence references and per-dimension review status. `editorial/research-summary.json` contains complete counts. This is **not a completed independent case-by-case historical/legal research project**. RSS descriptions were inspected in excerpts and processed across the complete feed; not every full description or linked show note was independently examined. No audio or transcript was listened to or reviewed. No transcript-based claims are made.

Reviewed format memberships: **12 Double Slashers, 16 With Guests, 5 Bloopers, 21 Specials, 2 positively qualified Greek Cases**. Memberships overlap and include both active collections. Double Slashers use explicit recurring-format identifiers, including the early misspelling “Slahser”; ordinary multiple-perpetrator cases are not automatically included. Credits saying only “special thanks” are not sufficient guest evidence. Greek qualification is conservative: only the RSS's explicit Greek nationality plus domestic case location was used for the two positive entries. Another 20 domestic-location entries remain for host qualification; a Greek name does not establish nationality.

Current category memberships across both collections: serial killers **39**, cults **6**, robberies **6**, historical **6**, unsolved **22**, disappearances **7**, Other **95**. Counts overlap. **104 entries retain suggested category decisions requiring review**, and **27 have no reviewed country mapping**. Other is not a declaration that no crime classification applies. Location coverage and taxonomy accuracy still require host review. No new arbitrary one-case crime category, curated collection or featured selection was invented. The UI retains the existing keyword suggestions for unreviewed categories and the CSV distinguishes them from reviewed decisions.

Metadata is applied through the existing GUID sidecar. Its validated optional fields now include countries, guest names, season exceptions and HTTPS evidence references. Runtime raw catalog input cannot supply those editorial fields. The original Other review CSV remains available (99 raw suggested-Other rows after refresh); CSV application preserves the new discovery fields and still permits withdrawal of a category override. The complete inventory CSV is a review/report aid; runtime classifications come exclusively from `overrides.json`, not a second classifier.

## Seasons

The first season launches in June 2022 and continues through August 2023; subsequent seasons follow September–August. Existing September/October launches and the Lead Masks description's explicit fifth-season announcement support this cycle. Four GUID exceptions correct inconsistent source markers: September 2025 domestic preview 3→4; September and October 2026 previews 4→5; March 2023 Locusta 3→1. Source markers remain available as `rssSeason` in the derived view and unchanged in raw JSON. The original trailer remains unnumbered. Hosts should review these inferred cycle-boundary corrections, especially summer/early-autumn promotional entries; edit explicit GUID exceptions when needed. No calendar-year rollover rule was added.

## Freshness and reliability

Startup remains guest-capable and root-owned: one startup request plus the existing visible 15-minute checks, not a request on every route. It reads the existing service-worker CacheStorage entry when available while requesting the published JSON. Cached content is validated before display. No second RSS fetcher or separate persistence schema was introduced. Existing cache freshness/revalidation policy and RSS automation remain unchanged.

Manual refresh now has checking/current/updated/error feedback in Greek and English. Meaningful comparison ignores import timestamps and local artwork paths. A failed/invalid refresh keeps the previous loaded catalog. Refresh does not clear the list, navigate, change filters or invoke the player. Cached warm-start behavior was source-reviewed; a controlled new browser offline/HTTP-503 replay was not performed in this pass. CacheStorage absence/private-mode denial is caught and leaves the existing network loading path available.

`npm run refresh:catalog` refreshes development's static assets using the existing importer. Browser refresh only reads the latest **published** JSON; it cannot edit local files or initiate GitHub publication. The original Wednesday and monthly-13th Athens schedules, overlap guard and manual dispatch/reusable publication flow were preserved. Remote enablement/Actions execution and production service-worker rollout were not verified or activated.

## Verification and readiness

- Final full suite: **155 tests / 20 files PASS**, including earlier milestones. Added combination, preview/count/season isolation, refresh-state/meaningful-change and editorial field/CSV preservation regressions.
- Final production build: **PASS**, `/podcast-app/`, **544.53 kB initial raw / 129.11 kB estimated transfer**. No dependencies installed.
- Browser interaction PASS: default 155 versus Plus 18; Double Slashers 12; Double Slashers + Greece 4; closing Advanced preserves country; URL reload preserves filters and re-collapses Advanced; manual refresh reports current; keyboard Enter toggles the native disclosure; Greek/English switching; three Profile theme controls. These checks used a disposable local QA origin; no existing user library was cleared or imported over.
- Simulated responsive DOM checks: **360, 390, 768, 1024, 1280 × 900 CSS-pixel viewport settings** for Episodes. The native scrollbar reduces the content viewport by approximately 15 px; measured document widths were 345, 375, 753, 1009 and 1265 px. No document overflow in these checks.
- Additional layout smoke checks at desktop 1280 and mobile 390: Home, episode details, Library, Extras, Profile, Login/Register, Password Recovery, Plus and empty player. No overflow observed. Desktop `/auth/reset` is an invalid-mode fallback; the actual `/auth/forgot` recovery route was verified on mobile. These were rendered-layout checks, not complete interaction certification for every screen.
- Captured browser warning/error logs: none in the exercised flows. Comprehensive uncaught-exception detection was not independently exercised.
- Not verified: every route at all five widths in all six language/theme combinations, physical devices, active mini/full-player responsive matrix, playback during failed refresh, new cold/offline cache scenarios, hosted deployment and workflow activation. Earlier milestone evidence remains historical rather than newly rerun browser certification.

Readiness: **ready with conditions for local design review; not yet certified as a fully researched public editorial release**. Remaining work is editorial review of flagged cases and focused device/player/offline verification. Backend, authentication, Android and unrelated Extras work remain outside this change. Preserve the separate untracked implementation report.

## Latest requested layout revision

The later user-directed layout replaces the earlier separate format section and Advanced disclosure: format chips are now included in Case Categories with five custom blood-accented SVG icons. Country appears between Season and Sort in the toolbar. Mobile retains readable field widths and visible chip icons. Styles are consolidated into the existing src/styles.css entry so the development stylesheet watcher loads them consistently. The filter semantics and URL data contract are unchanged. Focused follow-up: 14 tests PASS, build PASS, desktop/mobile and Greek/English order verified. See the latest [desktop screenshot](screenshots/catalog-overhaul/unified-categories-desktop.png) and [mobile screenshot](screenshots/catalog-overhaul/unified-categories-mobile.png). Earlier screenshots/disclosure test descriptions in this report are historical.

## Final acceptance review — 12–13 November 2026

The full **155-test / 20-file suite** and production build now pass against the unified-layout revision (`main-BMMX47HP.js`). A separate concurrent suite run hit one importer CLI timeout; an isolated full rerun passed without changing code or test deadlines. Actual browser checks found a remaining Country presentation defect on URL reload: Greece-filtered results remain correct but the dropdown shows All countries. Final technical acceptance therefore awaits a focused fix and browser regression, with no further redesign proposed.

External evidence now accompanies 32 inventory rows, covering 29 unreviewed category decisions. The CSV preserves the runtime baseline and adds separate facts, legal status, proposed classifications, citations and host actions. All 27 country gaps are triaged and all 20 domestic-location nationality flags have individual review actions; none was automatically applied. See [final verification and editorial uncertainties](FINAL_CATALOG_REVIEW.md). Earlier readiness language and narrower layout-only checks above are historical.
