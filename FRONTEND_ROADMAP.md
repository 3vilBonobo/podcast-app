# Dumb and Dahmer — frontend roadmap

Prepared 12 November 2026 from the supplied development roadmap and current local source. The October 30 reports are historical evidence. Fresh findings are in [FRONTEND_AUDIT.md](FRONTEND_AUDIT.md).

## Working scope and approval gates

- Current product phase: complete the existing responsive web application and PWA.
- Current milestone: **Milestone 4, episode catalog, discovery and editorial metadata — implemented and locally verified; ready for review**. Milestone 3 was accepted locally; its RSS automation was reviewed without rebuilding or activating it. Milestones 1 and 2 were committed/pushed under their separate authorizations (`7fd1573`, `a3794c3`). Their keyboard, responsive and no-autoplay fixes remain intact. Publication and schedule activation still require separate approval. Current evidence and limits are in [VERIFICATION.md](VERIFICATION.md).
- Keep `master` as the branch convention. Preserve the existing architecture, Gothic Noir identity, public Buzzsprout audio delivery and local library.
- The untracked `IMPLEMENTATION_REPORT.md` existed before this pass and must be preserved.
- No staging, commits, pushes, branch operations, deployments, dependency installations or backend/native infrastructure are authorized by this document.
- Every later milestone requires its own approval. Waking Machine implementation additionally requires an approved gameplay/content specification.

## Milestone overview

| Milestone | Current status | Dependency / exit gate |
| --- | --- | --- |
| 1. Current-state audit and stabilization | Accepted; committed/pushed as `7fd1573` under separate authorization | Preserve the completed fixes and regressions |
| 2. Responsive design and UX | Delivered; committed/pushed as `a3794c3` under separate authorization | Preserve completed fixes; physical-device/assistive-technology limits remain documented |
| 3. Audio reliability and approved RSS synchronization | Accepted locally; completed regressions preserved and automation reviewed again in Milestone 4 | Separate Git/publication/activation approval; real device/OS and hosted execution remain unverified |
| 4. Catalog discovery and editorial improvements | Delivered locally; 108 tests/14 files, production build and actual browser discovery/metadata checks pass | Review; hosts must supply editorial decisions. Cold HTTP-error reload limitation documented |
| 5. Library and frontend features | Existing local library; sharing and backup features missing | Stable persistence contract and approved import/merge behavior |
| 6. Extras | Five intentional placeholders; no completed game | Product review of Waking Machine specification and supplied/approved content |
| 7. PWA and release quality | Manifest/service worker exist; comprehensive release verification incomplete | Stable earlier milestones and a documented browser/device matrix |

## Milestone 1 — current-state audit and stabilization

Objective: reconcile source and historical reports, establish a fresh baseline, and fix only confirmed critical/release-blocking issues.

Tasks:

- Inspect applicable instructions, Git branch, staged/unstaged changes and untracked files.
- Read README, VERIFICATION and IMPLEMENTATION_REPORT alongside entry points, routes, services, tests and CI.
- Run the existing test suite and production build with `/podcast-app/` as the base path.
- Verify the generated catalog/artwork asset paths and service-worker base path.
- Smoke-test routing, public playback, library persistence, themes, languages, authentication prototypes and all Extras routes in the browser where available.
- Classify confirmed bugs separately from source-visible risks, missing features and historical/unverified claims.
- Correct the confirmed `master`/`main` push-trigger mismatch locally, and align README instructions with `master` (done under explicit approval). Do not rename branches or deploy.
- Add targeted regression coverage for any approved critical runtime correction that is actually reproduced.
- Record results in the audit and append a dated verification entry while retaining historical evidence.

Acceptance criteria:

- A clear current-state audit distinguishes source inspection, fresh automated results, current browser observations and physical-device checks still outstanding.
- The Pages push trigger matches `master`, and documentation no longer instructs users to rename/push this repository to `main`.
- Existing tests pass and the production build succeeds under `/podcast-app/`, or any failure is documented with a reproducible blocker.
- Core browser flows are checked without rewriting working features or changing persisted library schemas.
- The initial untracked report is preserved; only approved files are modified; nothing is staged, committed, pushed or deployed.
- Milestone 2 requires review and explicit approval after this gate (subsequently received; current results are in the Milestone 2 section).

Relevant checks: `npm.cmd test`; `npm.cmd run build -- --base-href=/podcast-app/`; generated `index.html`/`ngsw.json` inspection; focused browser smoke checks. Seven test files cover state, RSS, localization, category classification, filters, asset URLs and navigation focus. Five new keyboard regressions failed before their corrections and pass afterward. Two startup tests verify no autoplay for an empty or restored library. The interrupted browser pass resumed, all required functional checks were completed, and final-production keyboard/paused-player evidence was recorded. Full device, offline/install, background playback and hosted deployment verification remain assigned to later release milestones.

## Milestone 2 — responsive design and UX

Status: **delivered and locally verified within the approved scope**. The user authorized this milestone after accepting Milestone 1, then separately authorized staging/commit/push as `a3794c3`. The verification entry preserves what was checked before that publication step.

Tasks:

- Review every route at 360, 390, 768, 1024 and 1280 CSS pixels (completed: 17 route views × five widths × two languages × three themes = 510 post-fix layout samples, plus an 85-sample baseline).
- Check navigation, safe areas, scrolling, mini-player clearance and the full player.
- Check long Greek titles, forms, validation, overlays and empty/loading/error states.
- Review touch targets, keyboard focus, theme contrast and reduced-motion behavior.
- Reset auth feedback, password visibility, password values and validation state when changing between login/register/reset, retaining the entered email (implemented; two red-to-green regressions and browser checks at all five widths).
- Refine existing components and semantic tokens while retaining Gothic Noir branding.
- Preserve the first-visit system-theme policy. Recommendation: keep system-following for now; evaluate a Noir-first experience only through a separate product decision. No default-branding behavior was changed.

Delivered refinements:

- Full player owns its playback controls; the mini-player remains available on other routes. More compact mobile artwork, readable options and a single-column mobile settings layout keep the main controls accessible above bottom navigation.
- Wrapped Library tabs expose every category on narrow screens. Shared touch targets, input sizes, focus outlines, scrolling clearance and safe-area padding were refined without changing routing or storage.
- Archive and After Hours text/hover/decorative colors and control boundaries now meet the measured contrast thresholds for the tested semantic pairs. Noir retains its Gothic palette.
- Auth errors have valid description references and focus the first invalid field. Player ranges expose readable time/percentage values. Empty player/404 views have a primary heading and no raw translation-key tooltip.
- Before/after screenshots, the full geometry matrix and interaction/contrast evidence are in `docs/`; executed checks and limits are recorded in VERIFICATION.

Acceptance: all reviewed routes are usable at the target widths; controls remain reachable; no unintended horizontal overflow or content obstruction; keyboard/focus and theme findings have evidence and recorded outcomes.

Tests: focused browser flow checks and screenshots at each representative width; targeted regression checks for changed behavior. Physical mobile-browser checks remain distinct from desktop viewport simulation.

Dependency: completed, accepted Milestone 1. No redesign, new feature, dependency, backend or native work was introduced. Formal screen-reader sessions, physical safe-area/keyboard behavior and actual reduced-motion preference emulation remain unverified. One development-only Angular lazy-LCP image warning is recorded for the Milestone 7 performance review.

## Milestone 3 — audio player reliability

Status: **implemented and locally verified under the approved scope**, including the additional automatic RSS synchronization request. No Milestone 3 work has been staged, committed, pushed, deployed or activated. Device/OS interruption behavior remains explicitly unverified.

Tasks:

- Exercise loading, buffering, failure/retry, interruptions and network loss.
- Verify route-independent playback, seeking, restored positions and playback speed.
- Test queued and ordinary previous/next transitions, ended events and rapid episode switches.
- Check sleep-timer state, cancellation and browser suspension behavior.
- Audit persistence timing, library hydration and stale media-event handling.
- Check supported Media Session controls and document unsupported browser/OS behavior.
- Prepare Wednesday `5 7 * * 3` and monthly `5 7 13 * *` schedules, both with `Europe/Athens`, plus manual dispatch (implemented; not activated).
- Compare meaningful RSS/catalog data against the published baseline; retain source bytes/timestamp on unchanged imports; reject failed/incomplete imports before replacement; preserve GUIDs, audio URLs, preview classification and existing artwork references (implemented and tested).
- Reuse the Pages pipeline with serialized publication, stale-source checks, no-change gating and Wednesday/13th overlap handling. Prepared bot commits are limited to generated catalog/artwork and require separate activation approval.
- Decouple catalog JSON from versioned service-worker assets; recheck visible clients without interrupting audio, retaining valid cached/in-memory data where available (implemented; focused browser cache checks pass).

Acceptance: reproduced failures have targeted fixes and tests; transitions are predictable; failed playback does not silently lose saved progress or queue intent; no native code is introduced. Actual streaming observations are recorded separately from fake-audio unit tests.

Tests: **73 tests across 11 files** pass; production build passes. Six audio regressions were reproduced red then corrected; added rapid-request and optional Media Session checks, importer changed/unchanged/failure/CLI tests, Athens DST/overlap checks, YAML syntax/contracts and runtime refresh tests. Real Chromium playback, queue failure/retry, rapid switching, paused reload, unchanged-module catalog refresh and local-origin offline cached catalog were verified. Safari/physical device/OS suspension checks are not claimed.

Publication gate: the user approved implementation/testing only. Review the prepared workflows and branch/environment permissions before explicitly authorizing commit, push, deployment or schedule activation. The public 172-entry source snapshot remains unchanged; a read-only live check found 173 entries on 12 November. The first rollout must adopt the new client/service worker, after which catalog-only refreshes are independent of app feature releases. No backend, paid service, IndexedDB schema or native Android changes were introduced.

## Milestone 4 — episode catalog, discovery and editorial metadata

Status: **implemented and locally verified under explicit approval**. No staging, commit, push, deployment, schedule activation or Milestone 5 work was performed. Milestone 1–3 tests/functionality and the existing IndexedDB schema remain intact.

Delivered:

- Accent/case/decomposed-accent/final-sigma normalization, with every query word matched across episode title, description and reviewed tags. Categories remain OR; season, search and collection remain AND.
- Safe unknown URL values, explicit no-season navigation, chronological timestamp sorting with deterministic GUID ties, pagination reset on URL changes, sort-only clearing, live result counts and empty-result recovery that restores keyboard focus.
- Missing episode deep links now request a primary empty-state heading and retain archive recovery. Valid GUID links, reloads, browser history and public Plus-preview labels were exercised.
- Separate, validated GUID-based [editorial overrides](editorial/overrides.json), searchable reviewed tags, collection filtering and ordered featured selections. Original RSS fields/audio/artwork remain recoverable and unchanged. The latest hero remains chronological.
- A host-editable [98-row review CSV](editorial/review-other.csv), [host guide](editorial/README.md), and generate/apply/check tools. Regeneration preserves review work; only explicitly reviewed rows are applied. All actual overrides, collections and featured selections remain empty pending host decisions.
- Runtime optional-metadata fallbacks without relaxing the strict RSS publication validator or replacing invalid identities/audio URLs. Malformed optional values no longer reject an otherwise valid catalog. Official URLs and verified preview flags are preserved.
- Read-only review of the existing Milestone 3 automation: direct reusable artifact publication avoids the built-in-token push-trigger limitation; permissions, default-branch scheduling, Athens timezone/DST, overlap guard, stale-source guards and service-worker policy were checked. No RSS/schedule/refresh system was rebuilt.

Verification: **108 tests across 14 files pass**, including all earlier regressions; `/podcast-app/` production build passes. Actual browser interactions cover search/filter/sort combinations, keyboard focus, pagination, deep links, curated QA fixtures, public preview labeling and independent catalog updates. Thirty discovery geometry samples cover five widths × two languages × three themes. Detailed evidence and remaining limits are in [VERIFICATION.md](VERIFICATION.md).

Remaining decisions/limits:

- Hosts must review the Other list, assign classifications/tags and author any collection names, translations, membership and featured ordering. No content or classifications have been invented.
- A cold reload receiving HTTP 503 shows Retry rather than cached data; connection loss fallback and retention in an already-open client work. A dedicated validated last-known-good cold-start fallback would need a separately reviewed persistence/cache design; it was documented rather than rebuilding Milestone 3 or changing IndexedDB.
- Hosted token/branch/environment permissions and scheduled Pages delivery remain unverified until separately authorized. Schedules are best-effort and need the workflow on the repository's default branch. Existing installations first need the Milestone 3 client/service-worker update.
- Editorial configuration is bundled and uses the normal app publication/update. Subsequent RSS-only catalog changes remain independent of app feature releases. Physical devices and formal assistive-technology testing remain outstanding.

Next gate: review Milestone 4. Milestone 5 remains the existing library/sharing/backup scope below and requires its own approval; it has not begun.

## Milestone 5 — library and frontend features

Status: favorites, continue/recent/completed views, editable queue and local statistics exist. Share/copy and library export/import are absent.

Tasks:

- Refine existing library behavior and useful empty states.
- Add share and copy-link controls using stable episode URLs and a browser-compatible fallback.
- Define versioned JSON backup data and validate imported types, limits, IDs and numeric values.
- Define preview/confirmation and merge/replace behavior before implementing import; preserve existing local data on invalid input or failed writes.
- Add clear success/error feedback and preserve the guest experience.

Acceptance: sharing works at the deployed base path; an export/import round trip preserves valid local data; unsupported/malformed files cannot corrupt the library; no login is required and passwords/tokens are never persisted.

Tests: backup version validation, import failures, migration/merge behavior, persistence and browser sharing/clipboard flows.

Dependencies: stable library schema and approved import conflict behavior. Authentication remains an explicit prototype.

## Milestone 6 — Extras

Status: Waking Machine, Secret Archive, Seasonal Events, Rewards and Behind the Mic have detail routes and coming-soon previews.

Tasks:

- Review navigation, consistent placeholders, focus and reusable presentation components.
- Prepare a focused Waking Machine gameplay/content specification for product review.
- Specify interaction/state model, content ownership, accessibility, persistence needs and observable completion behavior.
- Implement the web frontend only after concept and content are approved.
- Keep the other four experiences as intentional placeholders until defined.

Acceptance: coherent navigation across all five routes; the specification is approved before game implementation; no invented official stories, jokes, audio, reward rules, payments or entitlements.

Tests: route/focus checks, placeholder interactions, then approved game-state/accessibility tests after the product gate.

Dependencies: explicit gameplay/content approval. This roadmap does not approve a game concept.

## Milestone 7 — PWA and release quality

Status: manifest and production service worker exist. Raster/maskable icons, comprehensive update/offline checks, full accessibility review and browser end-to-end coverage are outstanding.

Tasks:

- Validate manifest, app icons/maskable icons, installation, updates and cache invalidation.
- Verify offline shell and truthful streaming-unavailable feedback; do not imply cached audio exists.
- Verify deep links and the GitHub Pages fallback.
- Audit keyboard, screen-reader behavior, contrast and touch accessibility.
- Review RSS description rendering and XSS boundaries; inspect dependency vulnerability results and address concrete risks within approved scope.
- Measure performance and expand relevant unit/browser end-to-end coverage.
- Create a manual website/PWA matrix including mobile Safari and Android Chrome, plus a release checklist with blockers.

Acceptance: release evidence records exact build/browser/device coverage, unresolved blockers and limitations. Existing cached installations update predictably. No claim of physical-device or offline correctness is made without a corresponding executed check.

Dependencies: stable feature behavior from earlier approved milestones; approval before dependency installation or consequential configuration changes.

## Deferred phases

- **Phase 2:** real authentication/OAuth, cloud identity and synchronization, server-side functionality and protected/premium entitlement design.
- **Phase 3:** Capacitor, native Android packaging, Android-specific dependencies and platform integration.
- Neither phase is part of current work. The immediate goal is completion and release quality of the responsive web frontend/PWA.
