import { appendFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { syncCatalog, skipOverlappingSchedule } from './catalog-sync.mjs';
const option = (key) => {
  const i = process.argv.indexOf(key);
  return i < 0 ? undefined : process.argv[i + 1];
};
try {
  let result;
  if (skipOverlappingSchedule(process.env.GITHUB_EVENT_NAME, process.env.CATALOG_SCHEDULE)) {
    result = { changed: false, shouldPublish: false, skipped: true };
    console.log('Monthly refresh overlaps Wednesday; the Wednesday run owns this publication.');
  } else
    result = await syncCatalog({
      publicDir: option('--public-dir') || fileURLToPath(new URL('../public/', import.meta.url)),
      publishedUrl: option('--published-url'),
      allArtwork: process.argv.includes('--all-artwork'),
      dryRun: process.argv.includes('--dry-run'),
    });
  console.log(JSON.stringify(result));
  if (process.env.GITHUB_OUTPUT)
    await appendFile(
      process.env.GITHUB_OUTPUT,
      `changed=${result.changed}\nshould_publish=${result.shouldPublish}\n`,
    );
} catch (error) {
  console.error(
    `RSS import failed: ${error.message}. Previous valid catalog preserved; publication blocked.`,
  );
  process.exitCode = 1;
}
