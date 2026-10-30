import { XMLParser } from 'fast-xml-parser';
import { classifyEpisode } from './crime-categories.mjs';

export function durationSeconds(value) {
  const parts = String(value ?? '0')
    .split(':')
    .map(Number);
  return parts.every(Number.isFinite) ? parts.reduce((total, part) => total * 60 + part, 0) : 0;
}
export function plainText(value) {
  return String(value ?? '')
    .replace(/<\/(p|div)>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
const numberOrNull = (value) =>
  value === undefined || value === '' || !Number.isFinite(Number(value)) ? null : Number(value);
const https = (value) => {
  try {
    const url = new URL(String(value));
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};
export function normalizeFeed(xml, fetchedAt = new Date().toISOString()) {
  const parsed = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseTagValue: false,
    trimValues: true,
  }).parse(xml);
  const channel = parsed.rss?.channel;
  if (!channel) throw new Error('Expected a public RSS channel.');
  const artwork = https(channel['itunes:image']?.['@_href'] || channel.image?.url);
  const items = Array.isArray(channel.item) ? channel.item : channel.item ? [channel.item] : [];
  const episodes = items.flatMap((item) => {
    const audioUrl = https(item.enclosure?.['@_url']);
    const guid = String(item.guid?.['#text'] ?? item.guid ?? item.link ?? audioUrl);
    const date = new Date(item.pubDate);
    if (!guid || !audioUrl || !Number.isFinite(date.getTime())) return [];
    const description = plainText(item['content:encoded'] ?? item.description);
    const duration = durationSeconds(item['itunes:duration']);
    const contentKind =
      duration > 0 && duration <= 180 && /^Νέο Dumb\s*&\s*Dahmer Plus Episode/i.test(description)
        ? 'promotional-preview'
        : 'public-episode';
    return [
      {
        id: guid,
        title: plainText(item.title),
        description,
        publishedAt: date.toISOString(),
        duration,
        episodeNumber: numberOrNull(item['itunes:episode']),
        season: numberOrNull(item['itunes:season']),
        artwork: https(item['itunes:image']?.['@_href']) || artwork,
        audioUrl,
        audioType: item.enclosure?.['@_type'] || 'audio/mpeg',
        explicit: ['yes', 'true', 'explicit'].includes(
          String(item['itunes:explicit'] ?? channel['itunes:explicit']).toLowerCase(),
        ),
        episodeType: ['full', 'trailer', 'bonus'].includes(item['itunes:episodeType'])
          ? item['itunes:episodeType']
          : 'full',
        contentKind,
        categories: classifyEpisode(plainText(item.title), description),
        categorySource: 'editorial-keywords',
        link: https(item.link),
        access: 'public',
      },
    ];
  });
  if (!episodes.length) throw new Error('No playable public episodes found; existing catalog was preserved.');
  return {
    schemaVersion: 1,
    source: 'https://feeds.buzzsprout.com/2006539.rss',
    fetchedAt,
    fixture: false,
    title: plainText(channel.title),
    description: plainText(channel.description),
    artwork,
    episodes: [...new Map(episodes.map((episode) => [episode.id, episode])).values()].sort((a, b) =>
      b.publishedAt.localeCompare(a.publishedAt),
    ),
  };
}
