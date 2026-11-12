# Host editorial review

Buzzsprout remains the source of truth. This folder only adds reviewed discovery metadata by the **exact RSS GUID**. It never replaces titles, descriptions, dates, audio, artwork or Plus preview identification. No classifications or selections have been supplied on the hosts' behalf.

## Review in a spreadsheet

1. Run `npm run editorial:review` to generate/update `review-other.csv`. Open it as **UTF-8 CSV**, with comma separators. The UTF-8 BOM helps Excel display Greek correctly. Preserve the header and GUID column. The initial file contains the 98 episodes currently suggested as `other`.
2. Read each episode before making a decision. `title` and `suggested_categories` show the original importer suggestions, **not verified classifications**. Do not edit those source columns. `notes` is for the hosts and is not published.
3. Put category IDs in `categories`, separating multiple values with `|`. Allowed IDs: `serial-killers`, `cults`, `robberies`, `historical`, `unsolved`, `disappearances`, `other`. A blank cell retains the original suggestions. Put optional additional tags in `tags`, also separated by `|`. Blank tags clear a previous tag override for a reviewed row.
4. Set `reviewed` to `yes` only when the decision is ready. `no` leaves existing overrides unchanged. Set `featured` to `yes` to select an episode for the home page, otherwise `no`. Put collection IDs in `collections` only after defining their titles in the JSON file below. Blank collections/`featured=no` remove those selections for a reviewed row.
5. Save CSV, then run `npm run editorial:apply`. Only reviewed rows are applied. Invalid GUIDs, categories or collection IDs abort without replacing the JSON file. Run `npm run editorial:check`, `npm test` and `npm run build` to validate the result. Review the diff before requesting publication.

Regeneration preserves all existing review decisions and notes by GUID, including rows no longer suggested as Other. New Other episodes are added. `apply` does not change the CSV or the RSS snapshot. To withdraw an entire override, remove that GUID's entry from `overrides.json`; leaving `reviewed=no` in the CSV does not withdraw already published decisions.

## JSON format

`overrides.json` starts with empty `episodes`, `collections` and `featured` values. A reviewed episode entry has this structure (placeholder only; use a real GUID and reviewed values):

```json
"EXACT-RSS-GUID": { "reviewed": true, "categories": ["other"], "tags": [] }
```

You may omit `categories` to retain the importer suggestion. Tags are optional. No other episode fields may be overridden.

A collection has `id` (a lowercase slug, excluding reserved `long`), `reviewed: true`, `title`, optional `description`, and an `episodeIds` array of exact GUIDs. Titles/descriptions accept either a string or an object with `el` and/or `en`. A missing translation displays the supplied language; it is not automatically translated. Hosts must supply all names, descriptions and memberships. Define an empty collection first, then use the CSV to add reviewed memberships. Collections appear in discovery once at least one member is in the catalog. The built-in hour-long filter remains available.

`featured` is an ordered array of exact GUIDs, shown as a separate home-page section. The latest-episode hero remains chronological. CSV application preserves existing featured order and appends newly selected GUIDs; edit the array to reorder.

Overrides for episodes outside Other can be authored directly in JSON with the same validation. The CSV is a review aid, not a limit on what the hosts may curate.

## Publication and caching

Editorial metadata is bundled into the application through the existing Pages build. A reviewed metadata publication requires the normal build/deploy process and an application update for existing clients. Automatic RSS refresh remains independent: new catalog entries reach open clients using Milestone 3's network-first catalog cache/refresh, without an application feature release. RSS refresh does not invent new host metadata or alter this file. An older offline catalog safely ignores editorial GUIDs it has not received yet.

These tools only write local files. They do not stage, commit, push, deploy or enable schedules.
