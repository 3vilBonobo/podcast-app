import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyEpisodeLink, episodePermalink, shareEpisode } from '../src/app/core/episode-sharing';
const shareDescriptor = Object.getOwnPropertyDescriptor(navigator, 'share');
const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
afterEach(() => {
  if (shareDescriptor) Object.defineProperty(navigator, 'share', shareDescriptor);
  else delete (navigator as any).share;
  if (clipboardDescriptor) Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
  else delete (navigator as any).clipboard;
});
const set = (key: string, value: unknown) =>
  Object.defineProperty(navigator, key, { configurable: true, value });
describe('stable episode sharing', () => {
  it('uses the Pages base path and safely encodes opaque GUIDs without filters/fragments', () => {
    expect(episodePermalink('Buzzsprout-123', 'https://3vilbonobo.github.io/podcast-app/')).toBe(
      'https://3vilbonobo.github.io/podcast-app/episodes/Buzzsprout-123',
    );
    expect(episodePermalink('case/a ?β', 'https://example.com/?q=x#player')).toBe(
      'https://example.com/episodes/case%2Fa%20%3F%CE%B2',
    );
  });
  it('uses native sharing and preserves the official title', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    set('share', share);
    expect(await shareEpisode({ id: 'Buzzsprout-123', title: 'Επίσημος τίτλος' })).toBe('sharing.shared');
    expect(share).toHaveBeenCalledWith({ title: 'Επίσημος τίτλος', url: episodePermalink('Buzzsprout-123') });
  });
  it('falls back to clipboard when native sharing is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    set('share', undefined);
    set('clipboard', { writeText });
    expect(await shareEpisode({ id: 'Buzzsprout-123', title: 'Test' })).toBe('sharing.copied');
    expect(writeText).toHaveBeenCalledWith(episodePermalink('Buzzsprout-123'));
  });
  it('treats native cancellation as cancellation without overwriting the clipboard', async () => {
    const writeText = vi.fn();
    set('clipboard', { writeText });
    set('share', vi.fn().mockRejectedValue(new DOMException('Cancelled', 'AbortError')));
    expect(await shareEpisode({ id: 'a', title: 'Test' })).toBe('sharing.cancelled');
    expect(writeText).not.toHaveBeenCalled();
  });
  it('reports native errors and missing/denied clipboard access without unhandled rejection', async () => {
    set('share', vi.fn().mockRejectedValue(new Error('Denied')));
    expect(await shareEpisode({ id: 'a', title: 'Test' })).toBe('sharing.shareFailed');
    set('clipboard', undefined);
    expect(await copyEpisodeLink('a')).toBe('sharing.copyFailed');
    set('clipboard', { writeText: vi.fn().mockRejectedValue(new DOMException('Denied', 'NotAllowedError')) });
    expect(await copyEpisodeLink('a')).toBe('sharing.copyFailed');
  });
});
