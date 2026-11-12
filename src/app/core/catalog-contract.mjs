export const PUBLIC_FEED = 'https://feeds.buzzsprout.com/2006539.rss';
const categories = new Set([
  'serial-killers',
  'cults',
  'robberies',
  'historical',
  'unsolved',
  'disappearances',
  'other',
]);
const object = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const text = (v) => typeof v === 'string';
const nonempty = (v) => text(v) && v.trim().length > 0;
const url = (v) => {
  try {
    return text(v) && ['https:', 'http:'].includes(new URL(v).protocol);
  } catch {
    return false;
  }
};
const localImage = (v) => v === undefined || (text(v) && /^\/images\/[a-zA-Z0-9._-]+$/.test(v));
const number = (v) => Number.isFinite(v) && v >= 0;
export function isCatalog(v) {
  if (
    !object(v) ||
    v.schemaVersion !== 1 ||
    v.source !== PUBLIC_FEED ||
    v.fixture !== false ||
    !nonempty(v.title) ||
    !text(v.description) ||
    !url(v.artwork) ||
    !localImage(v.localArtwork) ||
    !text(v.fetchedAt) ||
    !Number.isFinite(Date.parse(v.fetchedAt)) ||
    !Array.isArray(v.episodes) ||
    !v.episodes.length
  )
    return false;
  const ids = new Set();
  return v.episodes.every((e) => {
    if (
      !object(e) ||
      !nonempty(e.id) ||
      ids.has(e.id) ||
      !nonempty(e.title) ||
      !text(e.description) ||
      !text(e.publishedAt) ||
      !Number.isFinite(Date.parse(e.publishedAt)) ||
      !number(e.duration) ||
      !(e.season === null || number(e.season)) ||
      !(e.episodeNumber === null || number(e.episodeNumber)) ||
      !url(e.audioUrl) ||
      !nonempty(e.audioType) ||
      !url(e.artwork) ||
      !localImage(e.localArtwork) ||
      typeof e.explicit !== 'boolean' ||
      !['full', 'trailer', 'bonus'].includes(e.episodeType) ||
      !['public-episode', 'promotional-preview'].includes(e.contentKind) ||
      e.access !== 'public' ||
      e.categorySource !== 'editorial-keywords' ||
      !Array.isArray(e.categories) ||
      !e.categories.length ||
      !e.categories.every((c) => categories.has(c)) ||
      !(e.link === '' || url(e.link))
    )
      return false;
    ids.add(e.id);
    return true;
  });
}
/** Repair optional presentation metadata only. Identity, audio and categories still fail closed. */
export function normalizeCatalog(value) {
  if (!object(value) || !Array.isArray(value.episodes)) return null;
  const optionalNumber = (v) => (Number.isInteger(v) && v >= 0 ? v : null);
  const normalized = {
    ...value,
    description: text(value.description) ? value.description : '',
    localArtwork: localImage(value.localArtwork) ? value.localArtwork : undefined,
    episodes: value.episodes.map((e) =>
      !object(e)
        ? e
        : {
            ...e,
            description: text(e.description) ? e.description : '',
            duration: number(e.duration) ? e.duration : 0,
            season: optionalNumber(e.season),
            episodeNumber: optionalNumber(e.episodeNumber),
            artwork: url(e.artwork) ? e.artwork : value.artwork,
            localArtwork: localImage(e.localArtwork) ? e.localArtwork : undefined,
            audioType: nonempty(e.audioType) ? e.audioType : 'audio/mpeg',
            episodeType: ['full', 'trailer', 'bonus'].includes(e.episodeType) ? e.episodeType : 'full',
            contentKind: ['public-episode', 'promotional-preview'].includes(e.contentKind)
              ? e.contentKind
              : 'public-episode',
            link: url(e.link) ? e.link : '',
          },
    ),
  };
  return isCatalog(normalized) ? normalized : null;
}
export function assertCompleteCatalog(catalog, previous) {
  if (!isCatalog(catalog)) throw new Error('Invalid or incomplete public catalog');
  if (previous) {
    if (!isCatalog(previous)) throw new Error('Invalid comparison catalog');
    const next = new Map(catalog.episodes.map((e) => [e.id, e]));
    for (const old of previous.episodes) {
      const episode = next.get(old.id);
      if (!episode) throw new Error(`Incomplete feed: missing existing GUID ${old.id}`);
      if (old.duration > 0 && episode.duration === 0) throw new Error(`Incomplete duration for ${old.id}`);
    }
  }
}
export function meaningfulCatalog(catalog) {
  const canonical = (value) =>
    Array.isArray(value)
      ? value.map(canonical)
      : object(value)
        ? Object.fromEntries(
            Object.keys(value)
              .sort()
              .filter((key) => !['fetchedAt', 'localArtwork'].includes(key))
              .map((key) => [key, canonical(value[key])]),
          )
        : value;
  return JSON.stringify(
    canonical({ ...catalog, episodes: [...catalog.episodes].sort((a, b) => a.id.localeCompare(b.id)) }),
  );
}
