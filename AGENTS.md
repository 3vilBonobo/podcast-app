# Dumb and Dahmer working instructions

Preserve existing modifications and untracked work. Inspect Git status, staged/unstaged changes and relevant documentation before editing. Obtain approval for significant implementation scope; once approved, execute routine steps autonomously. Never stage, commit, push, merge, rebase, reset, restore, discard, deploy, activate workflows, install dependencies or make consequential configuration changes without explicit authorization for that operation. Backend and Android development require separate approval.

## Risk-based incremental verification

Applies to the current unified All / Regular / Plus episode catalog and subsequent milestones. It changes verification cadence, not product requirements or approved visual design.

During implementation:

- Run tests directly relevant to the changed files and behavior. Include adjacent consumers when shared contracts or state are affected.
- Reuse successful verification for unchanged, unrelated code. Record which code/build and scope that evidence covered; do not claim historical checks were freshly executed.
- For an isolated defect, reproduce it, implement the smallest fix and verify the specific regression, including asynchronous or failure conditions responsible for the bug.
- For styling, visually check affected states and breakpoints; expand coverage only when the change's reach warrants it. Do not repeat the entire responsive matrix for a local adjustment.
- Use short browser sessions covering changed functionality and critical adjacent flows. Avoid rechecking every route after each adjustment.
- Avoid repeated production builds for minor edits. Never run a CPU-intensive build concurrently with the complete test suite on this machine.
- Generate reports/screenshots only when they add evidence. Keep intermediate notes brief; consolidate concise verification documentation at completion.

At milestone completion, run once, sequentially:

1. The complete automated test suite.
2. The production build.
3. A targeted browser regression pass covering changed functionality and critical adjacent flows against that build.

Repeat the complete suite only if a subsequent change affects shared architecture or otherwise invalidates its verification. Otherwise rerun affected tests. Rebuild only when the artifact needs refreshing for an affected build/browser check. Investigate failures with focused reproduction; retain failed attempts and distinguish a later pass from proof of the failure's cause.

Before actual publication, perform complete release-readiness verification across critical player, catalog, persistence, accessibility and responsive behaviors. Milestone verification is not publication certification or permission to publish. Record browser/device, offline/cache and hosted-delivery limitations honestly.

Never skip relevant regression tests or remove, disable, weaken or rewrite tests merely for speed. Never hide failures or label unexecuted checks as passing. Report what ran, results, evidence reused, and what was intentionally deferred and why. Use judgment autonomously within approved scope.

For catalog/editorial work, preserve exact-GUID overrides and host approval boundaries. Keep confirmed facts, uncertain proposals and legal status distinct; verification of application behavior does not approve editorial metadata. Preserve IndexedDB schemas and unrelated components unless separately authorized.
