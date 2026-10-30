import { describe, it, expect } from 'vitest';
import { durationSeconds, normalizeFeed } from '../scripts/rss-normalize.mjs';
const feed = (item) =>
  `<rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"><channel><title>Dumb &amp; Dahmer</title><description>Greek podcast</description><itunes:image href="https://example.com/art.jpg"/>${item}</channel></rss>`;
const item = `<item><guid isPermaLink="false">stable-guid</guid><title>Μια ιστορία</title><description><![CDATA[<p>Πρώτη παράγραφος.</p><p>Δεύτερη &amp; τελευταία.</p>]]></description><pubDate>Wed, 21 Oct 2026 03:00:00 GMT</pubDate><itunes:duration>1:02:03</itunes:duration><itunes:season>5</itunes:season><itunes:episode>1</itunes:episode><itunes:explicit>true</itunes:explicit><enclosure url="https://www.buzzsprout.com/2006539/episode.mp3?x=1&amp;y=2" type="audio/mpeg"/></item>`;
describe('public RSS normalization', () => {
  it('retains stable GUID, original enclosure query, Greek text and typed metadata', () => {
    const result = normalizeFeed(feed(item), '2026-10-30T00:00:00Z');
    expect(result.fixture).toBe(false);
    expect(result.episodes[0]).toMatchObject({
      id: 'stable-guid',
      title: 'Μια ιστορία',
      duration: 3723,
      season: 5,
      episodeNumber: 1,
      explicit: true,
      audioUrl: 'https://www.buzzsprout.com/2006539/episode.mp3?x=1&y=2',
      contentKind: 'public-episode',
    });
    expect(result.episodes[0].description).toContain('Δεύτερη & τελευταία.');
  });
  it('handles absent seasons and removes invalid audio items', () => {
    const missing = item.replace('<itunes:season>5</itunes:season>', '');
    const invalid = item.replace(
      'https://www.buzzsprout.com/2006539/episode.mp3?x=1&amp;y=2',
      'javascript:alert(1)',
    );
    expect(normalizeFeed(feed(missing + invalid)).episodes).toHaveLength(1);
    expect(normalizeFeed(feed(missing)).episodes[0].season).toBeNull();
  });
  it('deduplicates GUIDs', () => {
    expect(normalizeFeed(feed(item + item)).episodes).toHaveLength(1);
  });
  it('only labels promotional previews with explicit description evidence and short public audio', () => {
    const preview = item
      .replace('1:02:03', '60')
      .replace(
        '<p>Πρώτη παράγραφος.</p><p>Δεύτερη &amp; τελευταία.</p>',
        'Νέο Dumb &amp; Dahmer Plus Episode!! - Ακούστε το κάνοντας εγγραφή.',
      );
    expect(normalizeFeed(feed(preview)).episodes[0].contentKind).toBe('promotional-preview');
    expect(normalizeFeed(feed(item.replace('1:02:03', '60'))).episodes[0].contentKind).toBe('public-episode');
  });
  it('parses seconds and colon duration formats', () => {
    expect(durationSeconds('90')).toBe(90);
    expect(durationSeconds('02:30')).toBe(150);
    expect(durationSeconds('oops')).toBe(0);
  });
  it('rejects unusable feeds instead of replacing a real catalog with invented data', () => {
    expect(() => normalizeFeed('<html/>')).toThrow();
    expect(() => normalizeFeed(feed(''))).toThrow();
  });
});
