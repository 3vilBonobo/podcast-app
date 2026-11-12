import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { mkdtemp, mkdir, readFile, writeFile, stat, rm } from 'node:fs/promises';
import { resolve, join, sep } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { normalizeFeed } from '../scripts/rss-normalize.mjs';
import { syncCatalog } from '../scripts/catalog-sync.mjs';
import { skipOverlappingSchedule } from '../scripts/catalog-schedule.mjs';
import { PUBLIC_FEED, isCatalog, meaningfulCatalog } from '../src/app/core/catalog-contract.mjs';

const item = (id, title = id, description = 'Public episode') =>
  `<item><guid>${id}</guid><title>${title}</title><description><![CDATA[${description}]]></description><pubDate>Wed, 21 Oct 2026 03:00:00 GMT</pubDate><itunes:duration>60</itunes:duration><enclosure url="https://www.buzzsprout.com/2006539/${id}.mp3?token=original&amp;x=1" type="audio/mpeg"/><itunes:image href="https://example.com/${id}.jpg"/></item>`;
const feed = (items) =>
  `<rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"><channel><title>Dumb &amp; Dahmer</title><description>Greek podcast</description><itunes:image href="https://example.com/podcast.jpg"/>${items}</channel></rss>`;
let root, before, fetcher;
const tempParent = resolve('tmp/catalog-sync-tests');
beforeEach(async () => {
  await mkdir(tempParent, { recursive: true });
  root = await mkdtemp(join(tempParent, 'run-'));
  await mkdir(join(root, 'data'));
  await mkdir(join(root, 'images'));
  const catalog = normalizeFeed(feed(item('a')), '2026-10-30T00:00:00Z');
  catalog.localArtwork = '/images/podcast.jpg';
  catalog.episodes[0].localArtwork = '/images/a.jpg';
  await writeFile(join(root, 'images/podcast.jpg'), 'original-podcast-bytes');
  await writeFile(join(root, 'images/a.jpg'), 'original-episode-bytes');
  before = JSON.stringify(catalog, null, 2);
  await writeFile(join(root, 'data/catalog.json'), before);
  fetcher = vi.fn(async (url) =>
    url === PUBLIC_FEED
      ? new Response(feed(item('a')), { status: 200 })
      : new Response('image-bytes', { headers: { 'content-type': 'image/jpeg' } }),
  );
});
afterEach(async () => {
  if (!resolve(root).startsWith(tempParent + sep)) throw new Error('Unsafe test cleanup path');
  await rm(root, { recursive: true, force: true });
});

describe('catalog publication decisions and failure preservation', () => {
  it('does not write files or download artwork for an unchanged feed', async () => {
    const stamp = (await stat(join(root, 'data/catalog.json'))).mtimeMs;
    expect(await syncCatalog({ publicDir: root, fetcher })).toMatchObject({
      changed: false,
      shouldPublish: false,
    });
    expect(await readFile(join(root, 'data/catalog.json'), 'utf8')).toBe(before);
    expect((await stat(join(root, 'data/catalog.json'))).mtimeMs).toBe(stamp);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('imports new public previews while preserving GUIDs, official audio queries and old artwork', async () => {
    fetcher.mockImplementation(async (url) =>
      url === PUBLIC_FEED
        ? new Response(feed(item('new', 'New Plus', 'Νέο Dumb & Dahmer Plus Episode!!') + item('a')))
        : new Response('image-bytes', { headers: { 'content-type': 'image/jpeg' } }),
    );
    expect(await syncCatalog({ publicDir: root, fetcher })).toMatchObject({
      changed: true,
      shouldPublish: true,
      count: 2,
    });
    const catalog = JSON.parse(await readFile(join(root, 'data/catalog.json'), 'utf8'));
    expect(catalog.episodes.find((e) => e.id === 'new').contentKind).toBe('promotional-preview');
    expect(catalog.episodes.find((e) => e.id === 'a')).toMatchObject({
      audioUrl: 'https://www.buzzsprout.com/2006539/a.mp3?token=original&x=1',
      localArtwork: '/images/a.jpg',
    });
    expect(catalog.localArtwork).toBe('/images/podcast.jpg');
    expect(await readFile(join(root, 'images/a.jpg'), 'utf8')).toBe('original-episode-bytes');
    expect(isCatalog(catalog)).toBe(true);
  });
  it('detects meaningful metadata changes and ignores generated timestamps and packaged paths', async () => {
    const previous = JSON.parse(before);
    expect(
      meaningfulCatalog({ ...previous, fetchedAt: '2026-11-12', localArtwork: '/images/other.jpg' }),
    ).toBe(meaningfulCatalog(previous));
    fetcher.mockResolvedValue(new Response(feed(item('a', 'Updated title'))));
    expect(await syncCatalog({ publicDir: root, fetcher })).toMatchObject({
      changed: true,
      shouldPublish: true,
    });
  });
  it.each([
    ['unavailable', () => new Response('unavailable', { status: 503 })],
    ['malformed', () => new Response('<rss><channel>')],
    [
      'missing duration',
      () => new Response(feed(item('a').replace('<itunes:duration>60</itunes:duration>', ''))),
    ],
    ['partial XML item', () => new Response(feed(item('a') + '<item><guid>b</guid></item>'))],
    ['missing old GUID', () => new Response(feed(item('replacement')))],
    ['duplicate GUID', () => new Response(feed(item('a') + item('a')))],
    ['empty catalog', () => new Response(feed(''))],
  ])('preserves the complete previous catalog and artwork for %s', async (_, response) => {
    fetcher.mockImplementation(async () => response());
    await expect(syncCatalog({ publicDir: root, fetcher })).rejects.toThrow();
    expect(await readFile(join(root, 'data/catalog.json'), 'utf8')).toBe(before);
    expect(await readFile(join(root, 'images/podcast.jpg'), 'utf8')).toBe('original-podcast-bytes');
    await expect(stat(join(root, 'data/catalog.json.tmp'))).rejects.toThrow();
  });
  it('retains packaged artwork when an old episode moves beyond the initial artwork window', async () => {
    const ids = Array.from({ length: 25 }, (_, i) => `old-${i}`);
    const old = normalizeFeed(feed(ids.map((id) => item(id)).join('')));
    old.localArtwork = '/images/podcast.jpg';
    for (const episode of old.episodes) {
      episode.localArtwork = `/images/${episode.id}.jpg`;
      await writeFile(join(root, episode.localArtwork.slice(1)), 'retained-image');
    }
    await writeFile(join(root, 'data/catalog.json'), JSON.stringify(old));
    fetcher.mockImplementation(async (url) =>
      url === PUBLIC_FEED
        ? new Response(feed(item('new') + ids.map((id) => item(id)).join('')))
        : new Response('new-image', { headers: { 'content-type': 'image/jpeg' } }),
    );
    await syncCatalog({ publicDir: root, fetcher });
    const updated = JSON.parse(await readFile(join(root, 'data/catalog.json'), 'utf8'));
    expect(updated.episodes.find((e) => e.id === 'old-24').localArtwork).toBe('/images/old-24.jpg');
  });
  it('retries publication without timestamp-only source writes when a previous deployment failed', async () => {
    const published = JSON.parse(before);
    published.episodes[0].title = 'Older published title';
    fetcher.mockImplementation(async (url) =>
      url === PUBLIC_FEED ? new Response(feed(item('a'))) : Response.json(published),
    );
    expect(
      await syncCatalog({ publicDir: root, fetcher, publishedUrl: 'https://example.com/podcast-app/' }),
    ).toMatchObject({ changed: false, shouldPublish: true });
    expect(await readFile(join(root, 'data/catalog.json'), 'utf8')).toBe(before);
  });
  it('compares with the actual published catalog and blocks an unavailable/invalid baseline', async () => {
    fetcher.mockImplementation(async (url) =>
      url === PUBLIC_FEED ? new Response(feed(item('a'))) : Response.json(JSON.parse(before)),
    );
    expect(
      await syncCatalog({ publicDir: root, fetcher, publishedUrl: 'https://example.com/podcast-app/' }),
    ).toMatchObject({ changed: false, shouldPublish: false });
    fetcher.mockResolvedValue(new Response('unavailable', { status: 503 }));
    await expect(
      syncCatalog({ publicDir: root, fetcher, publishedUrl: 'https://example.com/podcast-app/' }),
    ).rejects.toThrow('503');
    fetcher.mockResolvedValue(Response.json(null));
    await expect(
      syncCatalog({ publicDir: root, fetcher, publishedUrl: 'https://example.com/podcast-app/' }),
    ).rejects.toThrow('Invalid');
  });
  it('treats a missing first publication as publishable but still validates the feed', async () => {
    fetcher.mockImplementation(async (url) =>
      url === PUBLIC_FEED ? new Response(feed(item('a'))) : new Response('', { status: 404 }),
    );
    expect(
      await syncCatalog({ publicDir: root, fetcher, publishedUrl: 'https://example.com/podcast-app/' }),
    ).toMatchObject({ changed: false, shouldPublish: true });
  });
  it('runs the real CLI and emits publication outputs only after a successful import', async () => {
    const mock = join(root, 'mock-fetch.mjs');
    const xml = feed(item('a', 'CLI metadata update'));
    await writeFile(mock, `globalThis.fetch=async()=>new Response(${JSON.stringify(xml)});`);
    const output = join(root, 'outputs');
    const run = promisify(execFile);
    const args = ['--import', pathToFileURL(mock).href, 'scripts/import-rss.mjs', '--public-dir', root];
    await run(process.execPath, args, {
      env: { ...process.env, GITHUB_OUTPUT: output, GITHUB_EVENT_NAME: 'workflow_dispatch' },
    });
    expect(await readFile(output, 'utf8')).toContain('should_publish=true');
    await writeFile(output, '');
    await run(process.execPath, args, {
      env: { ...process.env, GITHUB_OUTPUT: output, GITHUB_EVENT_NAME: 'workflow_dispatch' },
    });
    expect(await readFile(output, 'utf8')).toContain('should_publish=false');
    await writeFile(output, '');
    await writeFile(mock, "globalThis.fetch=async()=>new Response('fail',{status:503});");
    await expect(
      run(process.execPath, args, { env: { ...process.env, GITHUB_OUTPUT: output } }),
    ).rejects.toThrow();
    expect(await readFile(output, 'utf8')).toBe('');
  });
});
describe('Athens schedules', () => {
  it.each(['2026-05-13T04:05:00Z', '2027-01-13T05:05:00Z'])(
    'deduplicates the overlapping monthly run in summer/winter: %s',
    (date) => {
      const now = new Date(date);
      expect(skipOverlappingSchedule('schedule', '5 7 13 * *', now)).toBe(true);
      expect(skipOverlappingSchedule('schedule', '5 7 * * 3', now)).toBe(false);
      expect(skipOverlappingSchedule('workflow_dispatch', '5 7 13 * *', now)).toBe(false);
      expect(
        new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/Athens',
          hour: '2-digit',
          minute: '2-digit',
          hourCycle: 'h23',
        }).format(now),
      ).toBe('07:05');
    },
  );
  it('keeps a non-Wednesday monthly refresh', () => {
    expect(skipOverlappingSchedule('schedule', '5 7 13 * *', new Date('2026-11-13T05:05:00Z'))).toBe(false);
  });
});
