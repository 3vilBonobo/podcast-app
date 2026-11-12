import { readFile, writeFile, rename } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateEditorial } from '../src/app/core/editorial.mjs';
import { assertCompleteCatalog } from '../src/app/core/catalog-contract.mjs';

export const HEADERS = [
  'guid',
  'title',
  'suggested_categories',
  'reviewed',
  'categories',
  'tags',
  'collections',
  'featured',
  'notes',
];
const list = (value = '') =>
  value
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
const yes = (value = '') => ['yes', 'true', 'ναι'].includes(value.trim().toLocaleLowerCase('el'));
const booleanCell = (value = '') =>
  ['', 'yes', 'no', 'true', 'false', 'ναι', 'όχι'].includes(value.trim().toLocaleLowerCase('el'));

export function parseCsv(text) {
  const rows = [];
  let row = [],
    cell = '',
    quoted = false,
    closed = false;
  const source = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (quoted) {
      if (c === '"' && source[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
        closed = true;
      } else cell += c;
    } else if (c === '"' && !cell && !closed) quoted = true;
    else if (c === ',' || c === '\n' || c === '\r') {
      row.push(cell);
      cell = '';
      closed = false;
      if (c !== ',') {
        if (c === '\r' && source[i + 1] === '\n') i++;
        if (row.some((v) => v !== '')) rows.push(row);
        row = [];
      }
    } else {
      if (closed || c === '"') throw new Error('Malformed CSV quoting');
      cell += c;
    }
  }
  if (quoted) throw new Error('Unclosed CSV quote');
  if (cell || row.length || closed) {
    row.push(cell);
    rows.push(row);
  }
  const headers = rows.shift();
  if (!headers || headers.join(',') !== HEADERS.join(','))
    throw new Error(`Expected CSV columns: ${HEADERS.join(',')}`);
  const ids = new Set();
  return rows.map((values) => {
    if (values.length !== HEADERS.length) throw new Error('Wrong CSV column count');
    const entry = Object.fromEntries(HEADERS.map((key, i) => [key, values[i]]));
    if (!entry.guid || ids.has(entry.guid)) throw new Error(`Missing or duplicate CSV GUID: ${entry.guid}`);
    ids.add(entry.guid);
    return entry;
  });
}
export function serializeCsv(rows) {
  const quote = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  return (
    '\uFEFF' +
    [HEADERS, ...rows.map((row) => HEADERS.map((key) => row[key]))]
      .map((row) => row.map(quote).join(','))
      .join('\r\n') +
    '\r\n'
  );
}
export function reviewRows(catalog, config, previous = []) {
  validateEditorial(config, catalog);
  const existing = new Map(previous.map((row) => [row.guid, row]));
  const rows = catalog.episodes
    .filter((e) => e.categories.includes('other') || existing.has(e.id))
    .map((episode) => {
      const override = config.episodes[episode.id];
      return {
        guid: episode.id,
        reviewed: override ? 'yes' : 'no',
        categories: override?.categories?.join('|') ?? '',
        tags: override?.tags?.join('|') ?? '',
        collections: config.collections
          .filter((c) => c.episodeIds.includes(episode.id))
          .map((c) => c.id)
          .join('|'),
        featured: config.featured.includes(episode.id) ? 'yes' : 'no',
        notes: '',
        ...existing.get(episode.id),
        // Read-only source columns are always current; review decisions stay intact.
        title: episode.title,
        suggested_categories: episode.categories.join('|'),
      };
    });
  // Never silently drop a host's work if the source catalog changes unexpectedly.
  const known = new Set(catalog.episodes.map((e) => e.id));
  return [...rows, ...previous.filter((row) => !known.has(row.guid))];
}
export function applyReview(catalog, config, rows) {
  validateEditorial(config, catalog);
  const next = structuredClone(config);
  const known = new Set(catalog.episodes.map((e) => e.id));
  const ids = new Set();
  for (const row of rows) {
    if (!known.has(row.guid) || ids.has(row.guid))
      throw new Error(`Unknown or duplicate reviewed GUID ${row.guid}`);
    ids.add(row.guid);
    if (!booleanCell(row.reviewed) || !booleanCell(row.featured))
      throw new Error(`Use yes/no in reviewed and featured for ${row.guid}`);
    if (!yes(row.reviewed)) continue;
    const categories = list(row.categories),
      tags = list(row.tags),
      collections = list(row.collections);
    if (collections.some((id) => !next.collections.some((c) => c.id === id)))
      throw new Error(`Define collection titles before assigning ${row.guid}`);
    next.episodes = {
      ...next.episodes,
      [row.guid]: { reviewed: true, ...(categories.length ? { categories } : {}), tags },
    };
    for (const collection of next.collections) {
      collection.episodeIds = collection.episodeIds.filter((id) => id !== row.guid);
      if (collections.includes(collection.id)) collection.episodeIds.push(row.guid);
    }
    if (!yes(row.featured)) next.featured = next.featured.filter((id) => id !== row.guid);
    else if (!next.featured.includes(row.guid)) next.featured.push(row.guid);
  }
  return validateEditorial(next, catalog);
}
export async function runEditorial(command, root = process.cwd()) {
  const readJson = async (path) => JSON.parse(await readFile(resolve(root, path), 'utf8'));
  const catalog = await readJson('public/data/catalog.json');
  assertCompleteCatalog(catalog);
  const config = await readJson('editorial/overrides.json');
  validateEditorial(config, catalog);
  const csvPath = resolve(root, 'editorial/review-other.csv');
  const atomic = async (path, text) => {
    await writeFile(`${path}.tmp`, text, 'utf8');
    await rename(`${path}.tmp`, path);
  };
  if (command === 'check')
    return {
      reviewed: Object.keys(config.episodes).length,
      collections: config.collections.length,
      featured: config.featured.length,
    };
  if (command === 'generate') {
    let previous = [];
    try {
      previous = parseCsv(await readFile(csvPath, 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    const rows = reviewRows(catalog, config, previous);
    await atomic(csvPath, serializeCsv(rows));
    return { reviewRows: rows.length };
  }
  if (command === 'apply') {
    const next = applyReview(catalog, config, parseCsv(await readFile(csvPath, 'utf8')));
    await atomic(resolve(root, 'editorial/overrides.json'), JSON.stringify(next, null, 2) + '\n');
    return { reviewed: Object.keys(next.episodes).length };
  }
  throw new Error('Usage: node scripts/editorial-review.mjs generate|apply|check');
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runEditorial(process.argv[2])
    .then((result) => console.log(JSON.stringify(result)))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
