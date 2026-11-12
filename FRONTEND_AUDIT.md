# Frontend audit — 12 November 2026

Scope: approved Milestone 1 stabilization, including source/configuration inspection, critical fixes, regression coverage and current verification. **Milestone 1 is complete within the approved local scope.** The interrupted browser pass resumed after the user reconnected access; final keyboard checks pass. Hosted deployment and physical-device certification are not claimed. Milestone 2 remains unstarted.

## Repository and evidence

- Branch: `master`, tracking `origin/master`, at `b8c62e3` when inspected.
- Initial tracked working tree and index: no staged or unstaged changes.
- Initial untracked file: `IMPLEMENTATION_REPORT.md`; preserved without edits.
- README, VERIFICATION and IMPLEMENTATION_REPORT were read alongside Angular configuration, routes, core services, authentication/Extras components, tests, manifest, service worker and RSS importer.
- The October 30 browser/test results remain historical. They are not current verification claims.
- Baseline `npm.cmd test`: 31 tests passed across six files. The final run on 12 November 2026 passed **38 tests across seven files**, including five keyboard/navigation regressions and two no-autoplay startup checks.
- Final `npm.cmd run build -- --base-href=/podcast-app/`: **passed**, executed 12 November 2026. Initial output is 466.11 kB raw, with an estimated 117.53 kB transfer size, excluding lazy chunks and media.
- Generated artifact inspection confirmed `/podcast-app/` as the base href, `/podcast-app/index.html` in the service-worker manifest, the 172-entry catalog, all 25 referenced packaged artwork files present, and the generated worker file.
- Current browser checks exercised the production output at `http://127.0.0.1:4201/podcast-app/`. Real audio playback, route-independent playback, seeking, favorites, queue ordering, automatic queued-next playback and persisted positions/speed passed. Detailed results and remaining checks are in [VERIFICATION.md](VERIFICATION.md).
- Natural keyboard typing reproduced a critical focus defect. Four regressions failed before the fix and passed after it; rebuilt-browser typing and library arrow-key tests also pass. An additional skip-link defect was reproduced, corrected and covered by a red-to-green regression.
- All three themes persisted after reload. Greek/English persistence, mock login/register/reset/Google feedback, demo login/reload/logout, all five Extras previews, Plus information, episode/catalog deep reload and unknown-route fallback were exercised after reconnection.
- No-autoplay is already the player restoration behavior: empty startup is idle and saved playback restores paused. New tests explicitly prove no startup call to play, and real browser opening/reloading stayed paused. No player service or schema changes were needed.

## What is present and should be preserved

- Angular 21 standalone/lazy feature architecture, strict typing, Signals and Transloco.
- Existing Gothic Noir branding, Inter typography, SVG crime icons and the two alternative themes.
- Static normalized catalog fetched at import/build time; runtime loads local JSON instead of browser RSS/CORS workarounds.
- Current checked-in snapshot: 172 public entries, 18 labeled Plus previews and 98 Other entries, imported October 30. No fixture flag is set.
- One root-owned audio element with shared mini/full players, original official enclosure URLs, queue, sleep timer, playback speed, position persistence and Media Session hooks.
- Guest-capable IndexedDB library and clearly labeled demo identity/authentication forms.
- Five Extras placeholders and public Plus information. These are intentionally incomplete product experiences.
- Repository-relative local assets, GitHub Pages base-path support, manifest and generated production service-worker configuration.

These observations establish source presence. Runtime verification is limited to the flows explicitly recorded below and in VERIFICATION; historical checks do not replace the outstanding checks.

## Findings by severity

| ID | Severity | Evidence / impact | Planned handling |
| --- | --- | --- | --- |
| M1-01 | High — fixed locally | Pages push trigger used `main` while this repository uses `master` | Changed trigger to `master`; manual dispatch, build and deploy steps preserved. Actual Actions execution/deployment is unverified and unauthorized |
| M1-02 | Medium — fixed locally | README publishing instructions used `main` and included branch renaming | Aligned instructions with `master`; removed the rename command |
| M1-03 | Verification gap — closed for local scope | Browser connection disappeared mid-pass and was reconnected by the user | Required functional checks completed; final evidence is in VERIFICATION. Physical-device/hosted release checks remain outside this pass |
| M1-04 | High — reproduced and fixed | Root shell focused main after every NavigationEnd. Typing `Lead` stopped at `L`; library arrow-key selection also moved focus to main | Focus main only when the pathname changes; preserve query/fragment focus and cancel stale focus timers. Four red-to-green regressions and post-fix browser checks pass |
| M1-05 | High — reproduced and fixed | Skip-to-content href resolved against the Pages base URL and returned catalog users to Home | Router-generated current-page link preserves filters; activation explicitly focuses main. Integration regression and final production-browser check pass under `/podcast-app/` |
| M3-01 | Medium — source-visible reliability risk, not reproduced | `play()` reads saved records synchronously, while library hydration is asynchronous. Early interaction and rapid media-event transitions need dedicated tests | Milestone 3 unless reproduction establishes a critical issue within the approved Milestone 1 scope |
| M4-01 | Medium — confirmed missing editorial capability | Categories are keyword-based; no GUID override/curated metadata layer exists, and 98 entries remain Other | Milestone 4; obtain editorial decisions rather than invent classifications |
| M4-02 | Medium — confirmed missing maintenance workflow | Only a deployment workflow exists. RSS import is manual and replaces the generated catalog timestamp; no meaningful-change comparison or configurable schedule exists | Milestone 4 |
| M4-03 | Medium — source-visible validation risk, not reproduced | Runtime catalog loading checks schema version and that episodes is an array, but does not validate every consumed field or a null top-level response | Milestone 4 hardening unless a critical failure is reproduced earlier |
| M5-01 | Medium — confirmed missing functionality | No share/copy episode controls or versioned, validated library export/import | Milestone 5 |
| M5-02 | Medium — source-visible persistence debt | IndexedDB snapshot reads merge a typed assertion with defaults rather than validating stored shapes; no migration/export contract is implemented | Milestone 5; preserve existing records and design changes carefully |
| M6-01 | Product approval dependency | Waking Machine is a coming-soon preview; gameplay and official content are undefined | Milestone 6 specification and review before implementation |
| M7-01 | Medium — confirmed release gap | Manifest currently supplies an SVG icon with purpose `any`; dedicated raster/maskable icons and update UI are absent | Milestone 7 |
| M7-02 | Verification gap | Tests are Vitest/jsdom services/data checks; no checked-in browser end-to-end runner or comprehensive physical-device matrix | Milestones 2, 3 and 7 as appropriate |
| UX-01 | Product decision for a later milestone | First-visit theme follows system preference, so a light system selects Archive rather than Noir | Preserve during Milestone 1; settle the intended first-visit branding policy in Milestone 2 |
| UX-02 | Low — prototype polish | Moving between reused auth modes retains the previous feedback message and password visibility choice until the next submission/reload | Milestone 2 form-state review; submissions still clear passwords and explicitly describe prototype behavior |

No critical data-loss or security defect was reproduced in the exercised flows. The branch mismatch and two keyboard navigation defects were corrected within the approved scope. Missing future-milestone features are not grounds for expanding Milestone 1.

## Approved Milestone 1 implementation scope

1. Correct the local Pages push branch from `main` to `master`; align README publishing steps without renaming any branch.
2. Finalize [FRONTEND_ROADMAP.md](FRONTEND_ROADMAP.md) and this audit with current completion status, severity, dependencies and acceptance criteria.
3. Finish fresh automated checks and inspect generated base paths/static catalog assets.
4. Run focused browser smoke checks for routes, public playback, IndexedDB persistence, themes/languages, prototype authentication and Extras navigation. Record any access or physical-device limitations precisely.
5. Fix only additional confirmed critical issues reproduced within those flows, with targeted regression checks. Keep medium technical debt assigned to its relevant future milestone.
6. Append a dated verification entry, review the final diff and report changes/results/blockers for Milestone 1 review.

Constraints: preserve the existing untracked report, public RSS snapshot and user library schema; no new dependencies, backend/native work, significant redesign, editorial invention, staging, commits, pushes, deployments or branch operations. Milestone 2 requires separate approval after Milestone 1 completion.

The user explicitly approved this scope, including the deployment configuration correction and critical regression fixes. No additional routine implementation approval is needed. No deployment or Git write operation was performed. IMPLEMENTATION_REPORT.md remains unchanged (SHA-256: C16664837543F8A36E72CF0F6CDB86AF46451FC309B25445B2AFC0C7028DADB2).

## Completion gate

Automated checks, local corrections and the required functional browser checks pass. The final production module was verified after service-worker refresh; keyboard skip navigation retains `/episodes?q=Lead#main-content`, focuses main and preserves the search. Final console inspection captured no warnings/errors in the exercised routes. No uncaught-exception, physical-device or hosted deployment certification is implied. The final diff was reviewed and the original report checksum is unchanged. Milestone 2 remains unstarted and requires separate approval.

## Current follow-up — catalog/discovery UX (12 November 2026)

The historical M1 findings above are superseded where later milestone evidence documents fixes. The new local follow-up consolidates discovery controls, separates Plus previews, refreshes the snapshot to 173 entries and refines shared visual surfaces. Final 155 tests and production build pass. [Current report](docs/CATALOG_UX_OVERHAUL.md) records actual browser coverage and remaining editorial/release limits. The underlying independent case research is not complete; unresolved classifications remain flagged rather than invented.
