# Dumb and Dahmer — frontend roadmap

Prepared 12 November 2026 from the supplied development roadmap and current local source. The October 30 reports are historical evidence. Fresh findings are in [FRONTEND_AUDIT.md](FRONTEND_AUDIT.md).

## Working scope and approval gates

Verification cadence follows [project working instructions](AGENTS.md): targeted tests and short visual/browser checks during implementation; one sequential complete suite, production build and focused browser regression at milestone completion; complete release-readiness checks before publication. Reuse unaffected successful evidence, report deferrals, and never run full-suite/build workloads concurrently. This applies to the current All / Regular / Plus catalog work and subsequent milestones; historical checklists below do not require repeating completed checks during every iteration.

- Current product phase: complete the existing responsive web application and PWA.
- Current milestone: **Milestone 6, Extras — presentation delivered locally; Waking Machine functionality blocked on specification/content approval**. Milestone 5 is feature-complete locally with outstanding browser acceptance scenarios retained for release verification. Catalog/Milestone 5 work was separately authorized for commit/push as `771e848` on `codex/milestone-5-library-completion`; that branch push did not deploy Pages. No Git publication, deployment, schedule activation or Milestone 7 work is authorized for this Extras pass. Current evidence and limits are in [VERIFICATION.md](VERIFICATION.md).
- Keep `master` as the branch convention. Preserve the existing architecture, Gothic Noir identity, public Buzzsprout audio delivery and local library.
- The untracked `IMPLEMENTATION_REPORT.md` existed before this pass and must be preserved.
- No staging, commits, pushes, branch operations, deployments, dependency installations or backend/native infrastructure are authorized by this document.
- Every later milestone requires its own approval. Waking Machine implementation additionally requires an approved gameplay/content specification.

## Milestone overview

| Milestone | Current status | Dependency / exit gate |
| --- | --- | --- |
| 1. Current-state audit and stabilization | Accepted; committed/pushed as `7fd1573` under separate authorization | Preserve the completed fixes and regressions |
| 2. Responsive design and UX | Delivered; committed/pushed as `a3794c3` under separate authorization | Preserve completed fixes; physical-device/assistive-technology limits remain documented |
| 3. Audio reliability and approved RSS synchronization | Accepted; included in separately authorized commit/push `12fa35b`; regressions preserved | No new publishing/activation action in Milestone 5; real device/OS and hosted execution remain unverified |
| 4. Catalog discovery and editorial improvements | Accepted locally; included in `12fa35b` | Hosts still supply editorial decisions; cold HTTP-error reload limitation remains documented |
| 5. Library and frontend features | Implemented locally; tests/build pass; actual desktop IndexedDB round trip and listening/sharing flows verified | Review the delivery and remaining unverified responsive/failure browser checks before release |
| 6. Extras | Polished bilingual concept index/detail routes, verified locally; no game implemented | Approve Waking Machine purpose, interaction and complete bilingual content; see proposal |
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

Status: **implementation complete locally; acceptance verification remains partial** (13 November 2026). The completion audit found the requested library, listening, sharing and backup functionality already implemented. This pass corrected five untranslated Profile labels and a late native-share completion error after navigation, with a reproducing regression. No redundant services, persistence schema changes or Milestone 6 work were introduced. This is not complete responsive or release certification.

Delivered:

- Episode Details and full-player Share/Copy actions, base-relative encoded episode permalinks, native share/cancel handling, clipboard fallback and manual-copy recovery. Greek/English status messages and post-share focus restoration are included.
- Profile backup controls available to guests. Version-1 JSON includes favorites, ordered queue, selected episode, progress, completion/history and speed/volume; no credentials, demo identity or unrelated profile data. No IndexedDB database/store/version or snapshot fields were added.
- Size/type/version/feed/GUID/numeric validation, duplicate resolution, preview, default non-destructive merge and separately acknowledged replacement. One existing IndexedDB transaction writes the complete library; errors/aborts do not publish partial in-memory state. Current progress is flushed before applying, playback remains paused and stale transport events cannot recreate outgoing records.
- Merge uses inspected `lastPlayed`, sticky `completed` and cumulative `listenedSeconds`: newer position/duration wins, local wins ties, completion is OR and listening time is max (not sum). Existing favorites/queue ordering and current selection are retained where present. Missing catalog GUIDs are kept and surfaced rather than discarded.
- Cross-tab snapshot mismatch aborts the import, prevents follow-up stale writes and requires reload. General cross-tab live synchronization remains outside the existing architecture.
- Speed/volume remain unchanged during merge/replacement; each can be restored explicitly afterward through its existing localStorage key. Preference-storage failure preserves the current value.
- Recency now updates on actual playback rather than paused persistence/seeking. Queue actions have status feedback, per-episode labels and focus recovery; tabs use a roving tab stop. Cards use live current-player progress, and details expose listening position/completed history with semantic progress bars.
- Cold 503 investigation: the pinned Angular worker falls back on network failure/timeout, not a completed HTTP 503. Milestone 4 already demonstrated cached data surviving connection loss but not the responding 503. This is a real cold-start fallback limitation with cache present, not merely an empty-cache case. No catalog architecture was changed.

Verification: complete automated suite and production build pass; actual desktop browser checks at 1280×720 cover guest persistence, export/import equality, invalid/version/oversized files, duplicates/repeated merge, conflicting records, all library tabs, queue actions, native sharing cancellation, clipboard copying, deep-link reload and real audio progress restored paused. Exact results/counts are in [VERIFICATION.md](VERIFICATION.md) and [the backup format/merge guide](docs/LIBRARY_BACKUP.md).

Completion-pass evidence: full suite **174/174 PASS across 21 files**, followed sequentially by production builds. A subsequently discovered isolated share-lifecycle bug reproduced in a new test, then **7/7 affected sharing tests passed** after the guard; the unchanged full-suite evidence was reused. Final Pages build passed (`main-H3TRMHNJ.js`). Fresh browser checks passed guest IndexedDB reload, all library tabs, favorites, queue reorder/removal/end-of-episode handoff, completion, stored statistics, export/import replacement round trip, invalid JSON rejection, explicit preference restoration, translated Profile settings and Pages deep links. See VERIFICATION.md for exact artifact and failure history.

Remaining acceptance/release checks: mobile/tablet Library/Profile verification (viewport override remained at actual 1280×720), native clipboard payload/denial and manual-copy UI, controlled native IndexedDB abort and live two-tab conflict UI, plus cold-503/cache and physical-device release checks. Native share cancellation/focus was observed before the final guard; final-build copy focus and navigation during sharing passed, but late native completion after navigation has automated regression evidence rather than a fully observed final native-dialog round trip. Automated tests cover these failure paths; no unexecuted browser check is counted as passing.

Next steps: review Milestone 5 implementation and close the explicit browser acceptance gaps before publication. Retain separate approval gates for Git/publishing and later milestones. Authentication remains mocked; no backend, Firebase, Android or Extras implementation was added.

## Milestone 6 — Extras

Status (13 November 2026): **approved presentation scope complete locally; full milestone blocked on Waking Machine specification/content approval**. Audit of the roadmap, README, historical audit/report and existing components found five concept placeholders and no approved functional specification for any of them.

Delivered:

- Waking Machine leads the Extras index with an original, static instrument/eye SVG; four supporting concepts use the existing custom icon language. Rounded components and semantic theme tokens are scoped to Extras; no global redesign or generated horror imagery.
- Greek/English names, availability labels and specific explanations distinguish concepts from released experiences, events, rewards or subscriber benefits. No release date or working entitlement is implied.
- Detail routes show availability immediately, provide native keyboard-accessible concept notes, related-concept navigation and a link back to the unified episode catalog. Keyed route rendering resets disclosure state between concepts. Unknown slugs expose a primary-heading recovery view. Static bundled content requires no artificial loading/error workflow.
- [Waking Machine proposal](docs/EXTRAS_WAKING_MACHINE_PROPOSAL.md): proposed untimed, text-only, host-authored fiction mystery with three clues and an explanation; deterministic frontend state, session-only progress, mobile/desktop/accessibility approach and estimated scope. **This is not an approved game specification.** No story or game was implemented.
- Secret Archive, Seasonal Events, Rewards and Behind the Mic remain honest placeholders. Waking Machine also remains unavailable until approved content and interaction exist.

Verification: targeted Extras/localization **11/11 PASS**; completion full suite **182/182 PASS across 22 files**, then Pages production build PASS, then focused real-browser checks. All five concept routes, native disclosure keyboard/reset behavior, Greek/English, Noir/Archive/After Hours, desktop 1280×720/900 and simulated mobile 390×844 were exercised. No observed page overflow or captured warning/error logs; actual public audio advanced across Extras navigation. Formal screen-reader, physical-device and hosted-release verification remain unclaimed. See VERIFICATION.md for exact results and evidence.

Next gate: hosts approve or replace the proposed purpose, fiction format, interaction and session-only policy, then supply/approve complete bilingual story content and any warning/assets. Full Milestone 6 is **not complete** without that decision. No gameplay, rewards, backend, dependencies, schema, catalog/library/RSS automation or Milestone 7 changes. No staging, commit, push, merge, deployment or publishing activation in this pass.

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

### RSS architecture decision — 12 November 2026

Retain the existing Actions importer and published JSON. Buzzsprout's redirect and XML response allow CORS (*), but the requested local-origin browser fetch returned HTTP 504; successful browser fetching remains unverified. Startup already checks the public JSON without login. Episodes now exposes a bilingual manual refresh through the same loader. Both paths consume the latest published catalog and retain valid in-memory data on failure; they do not trigger a new RSS import. No architecture changes or publishing activation were performed. See VERIFICATION.md for evidence and limitations.

## Catalog, discovery and creative UX refinement — 12 November 2026

Local implementation after 96e688e: consolidated discovery panel, responsive chip rails, public/Plus separation, GUID-based country/guest/format/season metadata, validated cache warm-start and meaningful manual-refresh feedback. Live snapshot now 173 entries (155 public / 18 previews). Final tests: 155/20 PASS; production build PASS. See [the implementation and readiness report](docs/CATALOG_UX_OVERHAUL.md) for exact coverage, screenshots, tag counts and editorial gaps. This is ready for local design review, not a claim of completed independent research for every case. No later milestone, backend, Git publication or workflow activation was started.

### Focused acceptance correction — 13 November 2026

Country's asynchronous URL selection defect is fixed with explicit option selection driven by the URL signal. Complete suite **157/20 PASS**, production build PASS (`main-KVLBX27X.js`), and public/Plus cold reloads verified in the real production browser. The isolated 18-test importer suite passed too; the historical timeout remains documented and has not reproduced normally. No design or persistence schema changed.

Technical follow-up before unconditional discovery acceptance: resolve or explicitly accept the existing unavailable-season edge case when switching public Season 1 to Plus (URL remains Season 1 while the select displays All seasons). Physical-device, cold-cache/offline and hosted publication limits remain. No additional implementation is authorized by this roadmap entry.

Editorial acceptance is separate: 104 category decisions remain pending, including 75 still needing independent research; 27 country gaps and 20 nationality flags remain open. Twelve populated country assignments were audited: Nilsen US → GB is a confirmed factual correction awaiting host approval, three cases need expansion/historical-geography decisions, and eight retain their current mapping with stated evidence limits. The main CSV has 33 externally researched rows; the earlier 32-row summary is historical. Other populated assignments are not certified by this sample. Preserve GUID overrides and apply nothing automatically. See [verification](VERIFICATION.md) and [country audit](editorial/populated-country-audit.csv). No Git publication, workflow activation, backend or Android work.

### Unified episode catalog — 13 November 2026

Approved All / Regular / Plus implementation delivered locally. Episodes defaults to the complete mixed RSS archive (currently 173 entries), with a compact translated content-type control in the existing discovery panel. Regular and Plus narrow the same catalog; preview badges/playback/details are preserved. Unavailable seasons now reset atomically with type switches and are normalized after asynchronous deep-link loading. This resolves the prior Season 1 → Plus blocker. Other applicable filters persist; Clear restores All. No global redesign, taxonomy/editorial application or persistence change.

**Ready for technical acceptance of this scope:** targeted checks 43 PASS; one completion full suite **174 tests / 21 files PASS**; production build PASS (`main-LHH7KYPP.js`, final `styles-VBVZIAKC.css`); focused production browser checks passed counts, season/URL state, combinations, pagination, preview playback, refresh during playback (including HTTP 503), details, languages, themes and desktop/mobile presentation. A hover-only CSS refinement required one rebuild, with unchanged logic/full-suite evidence reused. See [executed results and limits](VERIFICATION.md).

Editorial uncertainties above remain unapproved and unchanged. Full publication verification, physical devices and hosted/service-worker rollout remain release gates. No subsequent milestone, research backlog, backend/Android work or publication operation was started.
