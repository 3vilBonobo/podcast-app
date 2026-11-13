# Local library backup and restore

Open **Profile → Your data → Back up your library**. No account is needed. Files are read locally; import does not upload them. Keep the downloaded file somewhere you can find again.

## Download and restore

1. Choose **Download backup**. The app captures current playback progress and downloads a JSON file.
2. To restore, choose a JSON backup up to **2 MiB (2,097,152 bytes)**. A preview shows favorites, queue entries, listening records, completed episodes, duplicate entries and any episodes missing from the current catalog. Selecting a file does not change your library.
3. Choose **Merge** (the default) or **Replace**. Replacement requires a separate acknowledgment because entries absent from the backup will be removed. Cancel or Escape closes the preview without applying it.
4. Apply the chosen operation. Playback pauses, the sleep timer clears, and the entire snapshot is written in one IndexedDB transaction. Playback never starts automatically. A failed write or aborted transaction leaves the previous snapshot intact; a media capability error after a successful commit is reported as a successful library restore with player-reload advice.
5. Speed and volume are **not changed by either mode**. After a successful import, use the separate **Use backup speed** and **Use backup volume** buttons if wanted. Each is an independent settings action. This preserves the existing IndexedDB/localStorage boundaries rather than pretending both stores share one transaction.

If another tab has changed the persisted snapshot, import aborts and the stale tab requires **Reload saved library** before further changes. This protects the other tab's data from a failed import's follow-up writes. General cross-tab live synchronization is not implemented; avoid simultaneous ordinary edits/playback in multiple tabs.

## Deterministic merge rules

| Data | Merge behavior |
| --- | --- |
| Favorites | Keep existing order; append new backup IDs, with duplicates removed |
| Queue | Keep existing order; append unseen backup IDs in backup order |
| Position and duration | Use the record with the greater `lastPlayed` timestamp; local progress wins ties |
| Completed flag | Keep completion if either record is completed, matching existing sticky completion history |
| Listening seconds | Use the greater total, never add overlapping totals |
| Selected episode | Keep the local selection if present; otherwise use the backup's selection |
| Playback preferences | Unchanged; restore each separately only when explicitly chosen |

Duplicate records inside a file follow the same timestamp/completion/time rules; the first record wins a timestamp tie. Reimporting an unchanged backup is idempotent. There are no session IDs or per-field revisions in the stored model, so independent listening totals cannot safely be added; using the larger total conservatively avoids double counting. Device clock differences can influence `lastPlayed`; the app does not invent corrected timestamps.

Well-formed opaque GUIDs absent from the current catalog are retained rather than silently deleted. They appear as unavailable entries and remain in backups. Missing favorites/queue entries can be removed explicitly in the Library. No titles, audio URLs or official content are taken from a backup. Existing completed episodes still prepare to replay from zero when selected; the completed-history flag is retained.

## File format, version 1

The transport format is separate from the unchanged IndexedDB version-1 `library` store and its `snapshot` key. JSON contains only these fields:

```json
{
  "format": "dumb-and-dahmer-library",
  "version": 1,
  "source": "https://feeds.buzzsprout.com/2006539.rss",
  "exportedAt": "2026-11-12T12:00:00.000Z",
  "library": {
    "favorites": [],
    "queue": [],
    "currentId": null,
    "records": []
  },
  "playbackPreferences": { "speed": 1, "volume": 0.8 }
}
```

Each record requires `episodeId`, `position`, `duration`, `completed`, `lastPlayed` and `listenedSeconds`. Positions/durations/listening totals are finite nonnegative seconds (bounded at 100 × 366 days per field); positive known duration bounds the position. `lastPlayed` is a nonnegative integer in the JavaScript Date range, in milliseconds. Zero means no actual playback has yet been recorded. Speed accepts 0.5–2 and volume 0–1, matching existing stored preference bounds.

The parser rejects unsupported versions/feed identity, missing/unknown fields, unsafe or empty GUIDs, bad numbers/types, oversized files and more than 10,000 entries in any list. GUIDs are opaque strings, not a guessed Buzzsprout numbering rule; prototype-property names, control characters and malformed Unicode are rejected. The merged result is validated again before storage. The preview does not expose authentication or account data.

Exports explicitly whitelist library fields and speed/volume. They exclude passwords, tokens, demo identity, personal profile information, theme/language settings, audio URLs, subscription data and the temporary sleep timer.

## Sharing

Episode Details and the full player offer **Share episode** and **Copy link**. Links use the app's base URL, so GitHub Pages permalinks stay beneath `/podcast-app/episodes/…`, without search/filter fragments. A development preview copies its own local origin.

Share uses the device's native share API when available and falls back to clipboard when absent. Native cancellation does not copy anything. If sharing or clipboard access fails, a labeled read-only permalink is shown for manual copying. Clipboard/native sharing depend on browser capabilities and permissions; no account or backend is involved.
