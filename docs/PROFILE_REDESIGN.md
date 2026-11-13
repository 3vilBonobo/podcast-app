# Profile organization and saved archive views

Approved scope: reorganize the existing profile, introduce named saved catalog views, retain the spooky visual language, and make Noir the default. Listening/timer setups, automatic catalog defaults, backend identity and Android changes remain outside this implementation.

## Behavior

- Profile uses link-based section navigation: Overview, Preferences, Saved views, Your data, Account. `?section=` supports direct navigation and browser history; unknown sections show Overview.
- The compact identity strip explains device-local storage. Overview contains listening statistics, library/view shortcuts and up to three saved-view shortcuts; it does not claim usage-based recency.
- Preferences retain all three themes, explicit system-following, interface language and immediate/persisted playback speed. Appearance/language and listening controls are grouped separately. Existing player speed/volume and timer behavior are unchanged.
- Noir is selected when `dd:theme` is absent or invalid, even on a light OS. Explicit Archive, After Hours and Noir choices remain. System-following now persists the string `system`. Earlier versions stored no key for system-following, so that indistinguishable state receives the requested Noir default.
- Episodes → Save this view stores the active search, All/Regular/Plus choice, season, country, sort, collection, categories and tags, omitting default/empty values and unrelated URL parameters. Names are trimmed and limited to 80 characters. Saving does not apply a view or start audio.
- Profile → Saved views supports opening, renaming, removal and undo of the latest removal while the panel remains open. Opening uses the existing catalog route with the saved query parameters, replacing the previous view. Current catalog validation and filtering still apply; no editorial metadata is changed.
- Saved views use a separate version-1 `dd:saved-views` localStorage document. A failed write leaves existing in-memory and persisted views unchanged and displays an error. Invalid/unreadable stored data is reported without being rewritten just by reading it. No multi-tab synchronization is claimed.
- Profile → Your data contains the unchanged library backup panel. IndexedDB, snapshot schema and library-backup version 1 remain unchanged. Saved views, themes and language are not included in those backups. Account retains guest login/demo entry, demo logout and the existing Plus information link.
- English and Greek copy cover the new UI. Navigation exposes the current section, forms have names, changes use status feedback, and removal/undo and form dismissal return focus to available controls. Responsive styles stack sections, theme choices and setting rows on narrow screens; these layouts have not been visually verified.

## Verification — 13 November 2026

- Initial targeted run: 46/48 passed. The previous theme-storage assertion needed updating for explicit system-following, and the literal translation checker required explicit navigation label keys. Both were corrected.
- Subsequent targeted attempts exposed new test-harness problems (external component styles and a system-media listener mock), then an inconsistent language setup. These were corrected in the tests; they are not evidence of browser layout failures.
- Complete suite: **188/189 passed across 24 files**, with one new profile test failing because its language setup disagreed with the application language. The other 23 files passed, covering unchanged backup/player/library/catalog and adjacent behavior, including saved-view persistence and failure handling.
- After fixing that setup, both affected profile integration tests passed. A final targeted run after formatting/focus assertions and a refreshed production build are recorded below.
- Production build passed initially, including strict Angular template compilation. No dependencies were installed and no configuration, backend, deployment or Git publication operations were performed.
- Final targeted run after formatting and explicit focus assertions: **55/55 PASS across six files** (`profile-views`, `saved-views`, `state`, `localization`, `discovery-ui`, `unified-catalog`). The unchanged successful evidence for the other 18 files from the complete run is reused; the complete suite was not rerun. No failed assertion remains unresolved.
- Refreshed final production build: **PASS**, `main-7VWR3R4G.js`, profile chunk `chunk-KLS5J4IL.js`; initial bundle 570.53 kB. `git diff --check` passed. The temporary local production server was stopped after the failed browser connection attempt.
- Browser regression: **UNVERIFIED**. The in-app browser could not open `http://127.0.0.1:4300/` (`net::ERR_CONNECTION_TIMED_OUT`). The user explicitly chose to leave visual QA unverified. Current desktop/mobile appearance, real keyboard navigation, screen-reader behavior, console/runtime logs, hosted delivery and physical-device behavior have not been verified. Existing screenshots are not evidence of the new layout.

This is implementation verification, not release-readiness certification or publication approval.
