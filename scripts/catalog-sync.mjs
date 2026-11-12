import { readFile, mkdir, writeFile, rename, access, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { normalizeFeed } from './rss-normalize.mjs';
import { PUBLIC_FEED, assertCompleteCatalog, meaningfulCatalog } from '../src/app/core/catalog-contract.mjs';

export { skipOverlappingSchedule } from './catalog-schedule.mjs';
const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};
async function request(fetcher, url) {
  const response = await fetcher(url, {
    signal: AbortSignal.timeout(30000),
    headers: { 'User-Agent': 'DumbAndDahmerCatalog/1.0', 'Cache-Control': 'no-cache' },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} fetching ${url}`);
  return response;
}
async function readCatalog(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}
/** Complete validation/network work before atomically replacing the catalog. */
export async function syncCatalog({
  publicDir,
  fetcher = fetch,
  publishedUrl,
  now = new Date(),
  allArtwork = false,
  dryRun = false,
}) {
  const root = resolve(publicDir);
  const destination = join(root, 'data/catalog.json');
  const current = await readCatalog(destination);
  if (current) assertCompleteCatalog(current);
  let published = current;
  let publishedMissing = false;
  if (publishedUrl) {
    const address = new URL('data/catalog.json', publishedUrl.replace(/\/+$/, '') + '/');
    address.searchParams.set('catalog-sync', String(now.getTime()));
    const response = await fetcher(address.href, {
      signal: AbortSignal.timeout(30000),
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (response.status === 404) {
      publishedMissing = true;
      published = null;
    } else {
      if (!response.ok) throw new Error(`Published catalog returned HTTP ${response.status}`);
      published = await response.json();
      assertCompleteCatalog(published);
    }
  }
  const xml = await (await request(fetcher, PUBLIC_FEED)).text();
  const next = normalizeFeed(xml, now.toISOString(), { strict: true });
  if (!/Dumb.*Dahmer/i.test(next.title)) throw new Error('Unexpected podcast identity');
  assertCompleteCatalog(next, published || current || undefined);
  if (current) assertCompleteCatalog(next, current);
  const sameCurrent = current && meaningfulCatalog(next) === meaningfulCatalog(current);
  const shouldPublish =
    publishedMissing || !published || meaningfulCatalog(next) !== meaningfulCatalog(published);
  if (sameCurrent && !allArtwork) return { changed: false, shouldPublish, count: next.episodes.length };
  if (dryRun) return { changed: !sameCurrent, shouldPublish, count: next.episodes.length };
  if (sameCurrent) next.fetchedAt = current.fetchedAt;
  const previousById = new Map((current?.episodes || []).map((e) => [e.id, e]));
  const staged = new Map();
  async function image(remote, old, label, required = false) {
    if (old?.artwork === remote && old.localArtwork && (await exists(join(root, old.localArtwork.slice(1)))))
      return old.localArtwork;
    try {
      const response = await request(fetcher, remote);
      const type = response.headers.get('content-type') || '';
      if (!type.startsWith('image/')) throw new Error('Invalid artwork content type');
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!bytes.length) throw new Error('Empty artwork');
      const name = `/images/${label}-${createHash('sha256').update(remote).digest('hex').slice(0, 16)}.${type.includes('png') ? 'png' : 'jpg'}`;
      staged.set(name, bytes);
      return name;
    } catch (error) {
      if (required) throw error;
      return undefined;
    }
  }
  next.localArtwork = await image(next.artwork, current, 'podcast');
  for (const [index, episode] of next.episodes.entries()) {
    const old = previousById.get(episode.id);
    if (episode.artwork === next.artwork && next.localArtwork) episode.localArtwork = next.localArtwork;
    else if (
      old?.artwork === episode.artwork &&
      old.localArtwork &&
      (await exists(join(root, old.localArtwork.slice(1))))
    )
      episode.localArtwork = old.localArtwork;
    else if (allArtwork || index < 24 || old?.localArtwork)
      episode.localArtwork = await image(episode.artwork, old, 'episode', !!old?.localArtwork);
  }
  assertCompleteCatalog(next, current || undefined);
  const serialized = JSON.stringify(next, null, 2) + '\n';
  if ((await exists(destination)) && serialized === (await readFile(destination, 'utf8')))
    return { changed: false, shouldPublish, count: next.episodes.length };
  await mkdir(join(root, 'data'), { recursive: true });
  await mkdir(join(root, 'images'), { recursive: true });
  const temp = destination + '.tmp';
  try {
    for (const [name, bytes] of staged) {
      const path = join(root, name.slice(1));
      if (!(await exists(path))) await writeFile(path, bytes, { flag: 'wx' });
    }
    await writeFile(temp, serialized);
    await rename(temp, destination);
  } finally {
    await rm(temp, { force: true });
  }
  return { changed: true, shouldPublish, count: next.episodes.length };
}
