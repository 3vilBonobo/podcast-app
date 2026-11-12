import type { Episode } from './models';

export function episodePermalink(id: string, base = document.baseURI): string {
  const root = new URL(base);
  root.search = '';
  root.hash = '';
  return new URL(`episodes/${encodeURIComponent(id)}`, root).href;
}

export async function copyEpisodeLink(id: string): Promise<string> {
  try {
    if (!navigator.clipboard?.writeText) return 'sharing.copyFailed';
    await navigator.clipboard.writeText(episodePermalink(id));
    return 'sharing.copied';
  } catch {
    return 'sharing.copyFailed';
  }
}

export async function shareEpisode(episode: Pick<Episode, 'id' | 'title'>): Promise<string> {
  if (typeof navigator.share !== 'function') return copyEpisodeLink(episode.id);
  try {
    await navigator.share({ title: episode.title, url: episodePermalink(episode.id) });
    return 'sharing.shared';
  } catch (error) {
    return error instanceof DOMException && error.name === 'AbortError'
      ? 'sharing.cancelled'
      : 'sharing.shareFailed';
  }
}
