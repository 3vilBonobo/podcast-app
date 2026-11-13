# Final catalog and discovery acceptance review

Follow-up, 13 November: the valid-Country asynchronous selection defect below has now been corrected and browser-verified. See [the focused correction results](../VERIFICATION.md) for the 157-test full-suite pass, production build, populated-country audit and remaining unavailable-season/collection edge case. The rest of this document records the earlier acceptance review and its evidence.

Review window: **12–13 November 2026, Europe/Athens**. Source HEAD: `a349370dc3c1432a3e77ae5a159e8b4f90c78bd9`. The user-approved unified layout was already present at the start. No application code, runtime metadata, workflow, dependencies or configuration were changed by this review.

**Decision: not yet technically ready for final acceptance.** The complete regression suite and production build pass, and the exercised discovery/refresh flows work, but Country displays the wrong selection after a cold URL reload. Fix that focused state defect and repeat its browser regression before acceptance. This finding does not call for another layout redesign. Editorial acceptance is also outstanding and independent of the technical fix.

## Executed full-suite and build checks

| Check | Result |
| --- | --- |
| Initial sandbox `npm.cmd test` | PASS, **155/155 tests, 20/20 files**, 185.13 s. It initially appeared stalled; collecting its completion later confirmed exit 0. |
| Full-suite rerun outside sandbox while production build ran | **154 pass / 1 timeout**, 19 files pass / 1 fails, 73.10 s. `catalog-sync.test.mjs` real-CLI publication-output test exceeded its 5 s deadline. This result is retained, not hidden by the later pass. |
| Isolated `npm.cmd test`, after build completion | PASS, **155/155 tests, 20/20 files**, exit 0, 41.52 s. Same code and unchanged timeout. Concurrent machine load is a plausible explanation for the earlier timeout, not a proven root cause. |
| Initial sandbox production build | Exit 1 without diagnostics; no pass credited. |
| `npm.cmd run build -- --base-href=/podcast-app/`, permitted outside sandbox | PASS, exit 0. **546.58 kB initial raw / 129.62 kB estimated transfer**. Main module `main-BMMX47HP.js`, stylesheet `styles-IN4S7TJW.css`. |
| `npm.cmd run editorial:check` | PASS: 168 GUID metadata override entries, zero collections and zero featured picks. This validates structure, not the factual accuracy of every decision. |
| Artifact checks | PASS: repository base href; packaged catalog byte-identical to source; catalog excluded from versioned worker asset hashes; browser observed `main-BMMX47HP.js`. |
| Review CSV checks | PASS: 173 rows / 173 unique GUIDs; all original 16 columns unchanged against HEAD; new research columns separate facts, legal status, proposals and approval. |

This is the complete configured Vitest suite, including catalog/importer, workflow/schedule, editorial, filtering, refresh, library/backup/restore, player/state, navigation/focus, authentication prototype, localization and sharing regressions. No test files were skipped or removed. No dependencies were installed. Tests use jsdom/mocks where configured and are not physical-device certification.

## Browser results against the final production assets

Disposable local Pages-style previews used `/podcast-app/` on ports 4213 and 4214. The first sandbox preview on 4212 timed out; a fresh browser tab against the permitted localhost preview succeeded. No existing user-origin library was cleared. Controlled catalog responses existed only in a disposable server, not in source/build catalog files.

| Flow | Result and observed evidence |
| --- | --- |
| Unified tag layout | PASS: one Case Categories region contains category chips plus all five format tags with five SVG icons. No former Advanced disclosure is present. |
| Toolbar | PASS: Greek and English expose Search → Season → Case location → Sort. English mobile geometry places Season/Country on one row and Sort below. |
| Desktop / narrow layout | PASS for exercised states: 1280×900 (also initial 1280×720) and simulated 390×844. Document/client widths were 1265/1265 and 375/375 respectively. Narrow selects measured 142.5×42 CSS px; Sort 297×42. Five format icons remained in the scrollable chip region. These are viewport simulations. |
| Tag/country combination | PASS: Double Slashers 12; + Greece 4; + Season 1 gives 2, with oldest first showing Troumba (March 2023) before Poros/Hydra (June 2023). |
| URL persistence | **FAIL for Country presentation**; PASS for actual result predicate, selected tag, Season and Sort. After reloading `?tag=double-slashers&country=GR&season=1&sort=oldest`, the URL and two results remained correct, but Country showed All countries and its DOM value was empty. A second reload with just tag + GR reproduced the mismatch with four results. |
| Normalized search | PASS: `μασκες βραζιλιας` found one Lead Masks episode. Query and search input value survived reload. |
| Plus separation | PASS: default public 155; Plus previews 18, with explicit public-preview labels and short public clip durations. Plus season options were 5/4/3, versus 5/4/3/2/1 in public. Home's latest episode was public OneTaste. |
| Format AND / empty recovery | PASS: Double Slashers + Greece + With Guests returned zero. Empty-state Clear Filters restored 155 and focused the empty search input. |
| Refresh current | PASS: manual refresh reported the published catalog was current. |
| Changed catalog without rebuild | PASS: a clearly marked QA-only response title loaded and the updated feedback appeared while the module stayed `main-BMMX47HP.js`. No application rebuild or source-data edit occurred between responses. |
| HTTP 503 preservation | PASS: error feedback appeared and the QA-marked last valid title and 155 public entries remained. |
| Invalid JSON contract preservation | PASS: a JSON response with an unusable catalog retained the same valid list and reported failure. |
| Recovery after failure | PASS: normal response removed the QA title; a subsequent check reported current with 155 entries. |
| Keyboard/accessibility | PASS for targeted checks: labeled comboboxes, pressed tag states, polite live status; actual Tab from Search reached Season then Country with a visible 3 px outline; Space activated Double Slashers; clearing returned focus to Search. No complete WCAG or screen-reader audit is claimed. |
| Console | No captured warning/error entries in the exercised tabs at inspection. Comprehensive uncaught-exception detection was not separately exercised. |

Saved evidence: [desktop baseline](screenshots/final-catalog-review/desktop.png), [Country reload defect](screenshots/final-catalog-review/country-reload-defect.png), [desktop recovery](screenshots/final-catalog-review/desktop-recovery.png). The mobile geometry and screenshot were observed in the tool result; no saved mobile image is claimed. Temporary viewport override was reset and owned preview servers were stopped. Closing the original failed tab emitted its stale connection-error page and interrupted the remaining explicit tab cleanup; the other created IAB tabs are temporary and close at turn end. This is not an application failure or a bypassed security warning.

### Acceptance blocker: Country selection after reload

Reproduce on a fresh catalog load:

1. Select Double Slashers and Greece.
2. Confirm `tag=double-slashers&country=GR` and four results.
3. Reload the URL.
4. Observe four results, a still-present `country=GR`, but Country displays All countries.

The result predicate uses `country()` correctly. The select binds `[value]="country()"` before asynchronously populated country options exist; its generated options lack the explicit selected binding used by Season. That timing is the likely mechanism, supported by the cold-load reproduction and source inspection; it is not a separately instrumented framework diagnosis. See `src/app/features/episodes/episodes.ts`, lines 64–66, versus Season's selected option binding. Existing tests initialize mocked data synchronously and do not exercise this cold-load DOM state.

Required follow-up: a minimal selection-synchronization correction, an asynchronous-options reload regression, and a browser rerun of public/Plus country persistence. No implementation was made during this review.

## RSS preservation and existing Pages publication

**PASS by executable local regressions plus source inspection.** The strict importer validates the previous/published baselines and complete new feed before replacing the catalog. The suite exercises unchanged feeds; meaningful changes; unavailable feed; malformed/partial XML; missing duration; missing old GUID; duplicate GUID; empty catalog; published-baseline failures; retained artwork; failed-publication retry; and actual CLI publication outputs. Failure leaves the previous catalog and existing artwork intact and emits no successful publication output. Catalog replacement uses a temporary file plus rename.

The existing schedule remains Wednesday and monthly-13th **07:05 Europe/Athens**, including its Wednesday/13th overlap guard and manual entry point. The caller invokes the existing reusable Pages workflow with catalog refresh enabled. Meaningful changes are tested/built before a restricted generated-data commit; stale-source checks precede publication. The same run uploads and deploys the prepared artifact directly with `needs: build`, the `github-pages` environment and Pages/OIDC permissions. It does not depend on the bot push triggering another build. This matches GitHub's [token trigger behavior](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow) and [Pages workflow requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

**UNVERIFIED remotely:** schedule enablement, default-branch placement, branch protection/bot-write policy, environment approvals, an actual scheduled run, artifact upload/deployment and hosted client delivery. GitHub schedules depend on repository state and can be delayed, as described in the [schedule reference](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule). No workflow was dispatched or activated, and no commit/push/deployment was performed here. The prepared pipeline can publish changed catalogs directly; this review does not claim publication occurred.

## Episode evidence and host review

The updated [catalog-review.csv](../editorial/catalog-review.csv) preserves every original inventory field, GUID and baseline classification. New columns record `research_status`, `verified_facts`, `legal_status`, `proposed_categories`, `proposed_countries`, `research_evidence`, `evidence_scope`, `editorial_assumptions`, `host_approval`, `category_next_action`, `country_research` and `greek_nationality_review`. Sources include court/prosecutor records, institutional histories and established news reporting. Excerpt-only research is labeled as such; older reports establish what was reported then, not the present final disposition of every appeal. A staging-host news copy is explicitly flagged for corroboration.

Coverage: **32 externally researched episode rows, including 29 of the 104 category-backlog rows**. The other 75 backlog rows still require independent external research. Even the 29 remain proposals pending host review, sometimes with incomplete legal history. This pass did not listen to episodes or review transcripts. Existing `reviewed-metadata` is not relabeled as independently verified fact. Runtime remains 104 unapproved category decisions, 27 blank country mappings, and 20 domestic-location nationality flags because no proposal was silently applied. Other remains 95 overlapping memberships across both collections.

Priority editorial decisions:

| Episode / exact GUID suffix | Evidence-backed distinction / host action |
| --- | --- |
| OneTaste / 20056589 | DOJ documents forced labor conspiracy convictions. Cults remains an editorial label; choose it or retain Other without implying a different offense. |
| Marvin Gaye / 19783556; Amanda Riley / 19187116 | Documented manslaughter disposition / wire-fraud guilty plea conflict with suggested Unsolved. Propose Other under the existing taxonomy. |
| Gloria Ramirez / 18484332 | LLNL describes a patient and hospital investigation. Suggested Serial killers is unsupported; propose Other. |
| Lisa Montgomery / 17299259 | DOJ documents kidnapping resulting in death; suggested Cults lacks support. Propose Other. |
| Tsifrika / 18350291 | A contemporary report records a guilty finding and appeal; do not call the case simply unsolved or assert a final appeal outcome without evidence. |
| Selena Parts 1/2 / 15094583, 15141745 | Conviction documented; suggested Unsolved on Part 2 needs correction. |
| Lizzie Borden / 11479462 | Acquitted. Case-level Historical/Unsolved must not portray her as a convicted killer. |
| Dulos / 14536553 | Troconis convicted; Fotis Dulos died before trial. Keep those statuses separate. |
| Godfrey/Jackson / 16593524 | Godfrey's offense is manslaughter; AU and GB are separate case locations. Show format does not imply serial killing. |
| SolarWinds / 16630555 | Government attribution exists; attribution is not a criminal conviction. Reassess Unsolved. |
| Kentiras / 11522938; Mygdalevrou / 18794779 | Death after arrest / charge-stage reporting must not become invented conviction claims. |
| Locusta / 12531825; ancient Greek episodes / 14618238, 13879133 | Separate ancient literary accounts, modern geography codes and retrospective taxonomy; modern citizenship cannot be assigned automatically. |

All 27 missing-country rows were triaged: **8 evidence-backed proposals**, **7 fictional-setting decisions**, **10 descriptions without a single identified real case**, **2 Titanic international-waters decisions**. The eight proposals are Nicolaou (GB), Alahverdian/Rossi (US, optionally GB for extradition coverage), Godfrey/Jackson (AU/GB), Greenbrier (US), Brudos (US), Knight (AU), Locusta (IT for present-day Rome) and Flannan (GB). Hosts must decide geography scope for extradition, fiction, folklore, ancient settings and offshore disasters. Do not assign the Titanic sinking to a country solely from ship registration or a nearby coast.

**All 20 domestic-location flags remain open**, with an individual action in the CSV. Specific complications include partial nationality evidence for Gkouvousi but not her paired Veria case; Georgian suspects in the Hydra segment; unknown perpetrators in the Kavafakis case; unspecified identities in the four-case provincial preview; uncertain legal outcomes in other multi-case episodes; ancient identity; and the need to distinguish ethnicity, birthplace and nationality for Koulaxidis. A Greek victim or Greek location is insufficient. No new Greek Cases tag was applied.

Machine-readable counts: [final editorial summary](final-catalog-editorial-summary.json).

## Preservation and remaining limits

SHA-256 remained unchanged for runtime overrides (`A9973F845AC2B7DEC0CE748E1DD66903520FFBF18530ECECE001765F3ADE1601`), source catalog (`8BB1E89ECA890B2FB6869A809B358E2ADD7A6A37728B22393CF6DE7810A8AC4C`) and the pre-existing untracked implementation report (`C16664837543F8A36E72CF0F6CDB86AF46451FC309B25445B2AFC0C7028DADB2`). There were no staged changes at entry and none were created. The GUID-based override mechanism and Other review/apply workflow were preserved.

UNVERIFIED in this pass: physical devices, all theme/language/viewport combinations, uninterrupted playback during refresh, newly controlled cold offline/HTTP-error CacheStorage hydration, service-worker upgrade/adoption and hosted publication. Earlier cold-start reports predate the later explicit CacheStorage startup path and do not certify this version either way. No backend or Android development, redesign, installation, commit, push or deployment was performed.
