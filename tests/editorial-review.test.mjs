import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  parseCsv,
  serializeCsv,
  reviewRows,
  applyReview,
  runEditorial,
} from '../scripts/editorial-review.mjs';
const catalog = JSON.parse(readFileSync('public/data/catalog.json', 'utf8'));
const config = () => ({ schemaVersion: 1, episodes: {}, collections: [], featured: [] });
describe('host review CSV', () => {
  it('preserves discovery evidence while allowing a CSV category override to be withdrawn', () => {
    const rows=reviewRows(catalog,config()).slice(0,1),guid=rows[0].guid;
    const existing={...config(),episodes:{[guid]:{reviewed:true,categories:['historical'],countries:['US'],season:2,evidence:['https://example.com/evidence']}}};
    rows[0]={...rows[0],reviewed:'yes',categories:'',tags:'specials',featured:'no'};
    const result=applyReview(catalog,existing,rows).episodes[guid];
    expect(result).toMatchObject({countries:['US'],season:2,evidence:['https://example.com/evidence'],tags:['specials']});
    expect(result.categories).toBeUndefined();
  });
  it('round-trips Greek, quoted commas and multiline notes in spreadsheet CSV', () => {
    const rows = reviewRows(catalog, config()).slice(0, 1);
    rows[0].notes = 'Ελένη, "έλεγχος"\nδεύτερη γραμμή';
    expect(parseCsv(serializeCsv(rows))).toEqual(rows);
    expect(() => parseCsv(serializeCsv(rows) + '"unclosed')).toThrow('Unclosed');
  });
  it('includes every Other GUID with its existing suggestions and no invented decisions', () => {
    const rows = reviewRows(catalog, config());
    expect(rows.map((r) => r.guid)).toEqual(
      catalog.episodes.filter((e) => e.categories.includes('other')).map((e) => e.id),
    );
    expect(
      rows.every(
        (r) =>
          r.suggested_categories === 'other' &&
          r.reviewed === 'no' &&
          !r.categories &&
          !r.tags &&
          !r.collections &&
          r.featured === 'no',
      ),
    ).toBe(true);
  });
  it('preserves host work on regeneration and updates source columns only', () => {
    const rows = reviewRows(catalog, config());
    rows[0] = {
      ...rows[0],
      reviewed: 'yes',
      categories: 'historical',
      notes: 'Host decision',
      title: 'stale source title',
    };
    const updated = reviewRows(catalog, config(), rows);
    expect(updated[0]).toEqual({
      ...rows[0],
      title: catalog.episodes.find((e) => e.id === rows[0].guid).title,
    });
    const changed = structuredClone(catalog);
    changed.episodes.find((e) => e.id === rows[0].guid).categories = ['historical'];
    expect(reviewRows(changed, config(), rows).find((r) => r.guid === rows[0].guid).notes).toBe(
      'Host decision',
    );
  });
  it('applies only explicit reviewed rows, preserving source and existing featured order', () => {
    const source = structuredClone(catalog);
    const rows = reviewRows(catalog, config()).slice(0, 2);
    rows[0] = {
      ...rows[0],
      reviewed: 'yes',
      categories: 'historical|unsolved',
      tags: 'Δοκιμή',
      collections: 'qa',
      featured: 'yes',
    };
    rows[1].categories = 'serial-killers';
    const metadata = {
      ...config(),
      collections: [{ id: 'qa', reviewed: true, title: 'QA only', episodeIds: [] }],
      featured: [rows[1].guid, rows[0].guid],
    };
    const next = applyReview(catalog, metadata, rows);
    expect(next.episodes).toEqual({
      [rows[0].guid]: { reviewed: true, categories: ['historical', 'unsolved'], tags: ['Δοκιμή'] },
    });
    expect(next.collections[0].episodeIds).toEqual([rows[0].guid]);
    expect(next.featured).toEqual(metadata.featured);
    expect(catalog).toEqual(source);
    expect(applyReview(catalog, next, rows)).toEqual(next);
  });
  it('rejects unknown GUIDs, categories, undeclared collections, boolean typos and duplicate rows', () => {
    const row = { ...reviewRows(catalog, config())[0], reviewed: 'yes' };
    for (const patch of [
      { guid: 'unknown' },
      { categories: 'invented' },
      { collections: 'undefined' },
      { reviewed: 'yse' },
    ]) {
      expect(() => applyReview(catalog, config(), [{ ...row, ...patch }])).toThrow();
    }
    expect(() => parseCsv(serializeCsv([row, row]))).toThrow('duplicate');
  });
  it('does not replace valid metadata when applying an invalid review file', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dd-editorial-'));
    try {
      await mkdir(join(root, 'public/data'), { recursive: true });
      await mkdir(join(root, 'editorial'));
      await writeFile(join(root, 'public/data/catalog.json'), JSON.stringify(catalog));
      const path = join(root, 'editorial/overrides.json');
      const original = JSON.stringify(config());
      await writeFile(path, original);
      await runEditorial('generate', root);
      const csv = join(root, 'editorial/review-other.csv');
      const rows = parseCsv(await readFile(csv, 'utf8'));
      rows[0].reviewed = 'yes';
      rows[0].categories = 'invented';
      await writeFile(csv, serializeCsv(rows));
      await expect(runEditorial('apply', root)).rejects.toThrow();
      expect(await readFile(path, 'utf8')).toBe(original);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
