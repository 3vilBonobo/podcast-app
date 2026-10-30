import { access, mkdir, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { normalizeFeed } from './rss-normalize.mjs';
const source = 'https://feeds.buzzsprout.com/2006539.rss';
const root = new URL('../public/', import.meta.url);
try {
  const response = await fetch(source, {
    signal: AbortSignal.timeout(30000),
    headers: { 'User-Agent': 'DumbAndDahmerCatalog/1.0' },
  });
  if (!response.ok) throw new Error(`Feed returned HTTP ${response.status}`);
  const catalog = normalizeFeed(await response.text());
  await mkdir(new URL('data/', root), { recursive: true });
  await mkdir(new URL('images/', root), { recursive: true });
  if (catalog.artwork) {
    try {
      const art = await fetch(catalog.artwork, { signal: AbortSignal.timeout(30000) });
      if (!art.ok || !art.headers.get('content-type')?.startsWith('image/'))
        throw new Error('Artwork unavailable');
      const extension = art.headers.get('content-type')?.includes('png') ? 'png' : 'jpg';
      const localPath = `/images/podcast.${extension}`;
      await writeFile(new URL(localPath.slice(1), root), Buffer.from(await art.arrayBuffer()));
      catalog.localArtwork = localPath;
    } catch (error) {
      console.warn(`Using official remote artwork: ${error.message}`);
    }
  }
  // Package the initial catalog page locally. Older artwork stays on the official CDN.
  // --all-artwork is optional for a release that should package every episode image.
  const candidates = process.argv.includes('--all-artwork')
    ? catalog.episodes
    : catalog.episodes.slice(0, 24);
  let cached = 0;
  const pending = [...candidates];
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (pending.length) {
        const episode = pending.shift();
        if (!episode?.artwork) continue;
        if (episode.artwork === catalog.artwork && catalog.localArtwork) {
          episode.localArtwork = catalog.localArtwork;
          continue;
        }
        const name = `images/episode-${createHash('sha256').update(episode.artwork).digest('hex').slice(0, 16)}.jpg`;
        const destination = new URL(name, root);
        try {
          try {
            await access(destination);
          } catch {
            const image = await fetch(episode.artwork, { signal: AbortSignal.timeout(20000) });
            if (!image.ok || !image.headers.get('content-type')?.startsWith('image/'))
              throw new Error('Artwork unavailable');
            await writeFile(destination, Buffer.from(await image.arrayBuffer()));
          }
          episode.localArtwork = `/${name}`;
          cached++;
        } catch {
          console.warn(`Keeping official remote artwork for ${episode.id}`);
        }
      }
    }),
  );
  await writeFile(new URL('data/catalog.json.tmp', root), JSON.stringify(catalog, null, 2));
  await rename(new URL('data/catalog.json.tmp', root), new URL('data/catalog.json', root));
  console.log(
    `Imported ${catalog.episodes.length} real public episodes. Latest: ${catalog.episodes[0].title}`,
  );
  console.log(`Artwork: ${catalog.artwork}`);
  console.log(`Packaged ${cached} episode artworks locally.`);
  console.log(`Seasons: ${[...new Set(catalog.episodes.map((e) => e.season))].join(', ')}`);
} catch (error) {
  console.error(
    `RSS import failed: ${error.message}. Existing catalog, if any, was left unchanged. No fixture was generated.`,
  );
  process.exitCode = 1;
}
