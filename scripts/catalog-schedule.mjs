import { appendFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
export function skipOverlappingSchedule(event, cron, now = new Date()) {
  if (event !== 'schedule' || cron !== '5 7 13 * *') return false;
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Athens',
    weekday: 'short',
    day: 'numeric',
  }).formatToParts(now);
  return (
    parts.some((p) => p.type === 'day' && p.value === '13') &&
    parts.some((p) => p.type === 'weekday' && p.value === 'Wed')
  );
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const refresh = !skipOverlappingSchedule(process.env.GITHUB_EVENT_NAME, process.env.CATALOG_SCHEDULE);
  console.log(refresh ? 'Refresh requested.' : 'Wednesday run owns the overlapping monthly refresh.');
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `should_refresh=${refresh}\n`);
}
