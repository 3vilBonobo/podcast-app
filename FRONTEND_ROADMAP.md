# Dumb and Dahmer — frontend roadmap

Prepared 12 November 2026 from the supplied development roadmap and current local source. The October 30 reports are historical evidence. Fresh findings are in [FRONTEND_AUDIT.md](FRONTEND_AUDIT.md).

## Working scope and approval gates

- Current product phase: complete the existing responsive web application and PWA.
- Current milestone: **Milestone 1, audit and stabilization — complete within the approved local scope**. Pages branch/README and two reproduced keyboard navigation bugs are fixed locally. The final suite passes 38 tests across seven files, the Pages production build succeeds and the required browser smoke checks pass, including no autoplay on first opening/reload. See [VERIFICATION.md](VERIFICATION.md) for evidence and release-verification limits.
- Keep `master` as the branch convention. Preserve the existing architecture, Gothic Noir identity, public Buzzsprout audio delivery and local library.
- The untracked `IMPLEMENTATION_REPORT.md` existed before this pass and must be preserved.
- No staging, commits, pushes, branch operations, deployments, dependency installations or backend/native infrastructure are authorized by this document.
- Every later milestone requires its own approval. Waking Machine implementation additionally requires an approved gameplay/content specification.

## Milestone overview

| Milestone | Current status | Dependency / exit gate |
| --- | --- | --- |
| 1. Current-state audit and stabilization | Complete locally: fixes, 38 tests, production build and required browser checks pass | Review recorded results; no commit, push or deployment performed |
| 2. Responsive design and UX | Existing responsive UI; new systematic size/accessibility review pending | Approval after Milestone 1 completion |
| 3. Audio player reliability | Functional player exists; expanded reliability audit pending | Approved scope; preserve working web playback and library |
| 4. Catalog and RSS improvements | Existing catalog and filters; curated overrides and automation missing | Editorial decisions and approved refresh configuration |
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
- Milestone 2 remains unstarted until review and approval.

Relevant checks: `npm.cmd test`; `npm.cmd run build -- --base-href=/podcast-app/`; generated `index.html`/`ngsw.json` inspection; focused browser smoke checks. Seven test files cover state, RSS, localization, category classification, filters, asset URLs and navigation focus. Five new keyboard regressions failed before their corrections and pass afterward. Two startup tests verify no autoplay for an empty or restored library. The interrupted browser pass resumed, all required functional checks were completed, and final-production keyboard/paused-player evidence was recorded. Full device, offline/install, background playback and hosted deployment verification remain assigned to later release milestones.

## Milestone 2 — responsive design and UX

Status: the responsive shell, screens, theme tokens and reduced-motion rules already exist. Current comprehensive visual verification is pending.

Tasks:

- Review every route at approximately 360, 390, 768 and 1280 CSS pixels.
- Check navigation, safe areas, scrolling, mini-player clearance and the full player.
- Check long Greek titles, forms, validation, overlays and empty/loading/error states.
- Review touch targets, keyboard focus, theme contrast and reduced-motion behavior.
- Review auth form state when changing between login/register/reset: prior feedback and password visibility currently persist across the reused component. Keep prototype behavior explicit.
- Refine existing components and semantic tokens while retaining Gothic Noir branding.
- Resolve the first-visit theme policy during this milestone if a forced Noir default is desired; current behavior follows the system when no explicit choice exists.

Acceptance: all reviewed routes are usable at the target widths; controls remain reachable; no unintended horizontal overflow or content obstruction; keyboard/focus and theme findings have evidence and recorded outcomes.

Tests: focused browser flow checks and screenshots at each representative width; targeted regression checks for changed behavior. Physical mobile-browser checks remain distinct from desktop viewport simulation.

Dependency: completed, approved Milestone 1. No redesign or new feature work is implied.

## Milestone 3 — audio player reliability

Status: one root audio service, mini/full players, queue, timer, Media Session hooks and local positions are implemented. Extended interruption/race testing is pending.

Tasks:

- Exercise loading, buffering, failure/retry, interruptions and network loss.
- Verify route-independent playback, seeking, restored positions and playback speed.
- Test queued and ordinary previous/next transitions, ended events and rapid episode switches.
- Check sleep-timer state, cancellation and browser suspension behavior.
- Audit persistence timing, library hydration and stale media-event handling.
- Check supported Media Session controls and document unsupported browser/OS behavior.

Acceptance: reproduced failures have targeted fixes and tests; transitions are predictable; failed playback does not silently lose saved progress or queue intent; no native code is introduced. Actual streaming observations are recorded separately from fake-audio unit tests.

Tests: expanded audio/state regressions and real-browser playback checks; website/PWA device matrix for Safari and Chrome.

Dependency: approved scope and stable Milestone 1 baseline. Do not replace the existing audio architecture without evidence requiring it.

## Milestone 4 — catalog and RSS improvements

Status: public RSS normalization and static import, metadata, preview labels, filters and stable GUID routes exist. Search normalization, curated overrides and refresh automation are incomplete.

Tasks:

- Improve Greek search, season/category navigation, sorting, details and metadata fallbacks.
- Introduce a GUID-keyed override file for reviewed categories and curated collections while retaining original feed fields and attribution.
- Distinguish suggested keyword tags from approved editorial classifications.
- Produce a review list of the currently 98 Other entries; leave decisions unresolved until editorial input is supplied.
- Preserve verified public Plus-preview identification and original audio enclosure URLs.
- Add a manual RSS-refresh GitHub Actions workflow and configurable publication-day schedules after configuration approval.
- Detect meaningful catalog changes; skip deployment of unchanged catalogs.
- Preserve the last known-good catalog on failed imports.

Acceptance: overrides apply by stable GUID, feed metadata remains recoverable, unreviewed tags are not treated as authoritative, unchanged refreshes do not deploy, and failed refreshes preserve valid catalog data.

Tests: normalization/override validation, Greek search cases, preview labeling, meaningful-change detection and failed/no-change imports.

Dependencies: approved editorial taxonomy/collection decisions and publication-day configuration. No runtime RSS proxy, backend or paid infrastructure.

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
