const categoryIds = new Set([
  'serial-killers',
  'cults',
  'robberies',
  'historical',
  'unsolved',
  'disappearances',
  'other',
]);
const object = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const text = (v) => typeof v === 'string' && v.trim().length > 0;
const uniqueStrings = (v) => Array.isArray(v) && v.every(text) && new Set(v).size === v.length;
const localized = (v) =>
  text(v) ||
  (object(v) &&
    Object.keys(v).length > 0 &&
    Object.entries(v).every(([k, s]) => ['el', 'en'].includes(k) && text(s)));
const keys = (v, allowed) => Object.keys(v).every((key) => allowed.includes(key));

/** Authoring fails early; RSS fields cannot be changed through this contract. */
export function validateEditorial(config, catalog) {
  const fail = (message) => {
    throw new Error(`Invalid editorial metadata: ${message}`);
  };
  if (
    !object(config) ||
    config.schemaVersion !== 1 ||
    !keys(config, ['schemaVersion', 'episodes', 'collections', 'featured']) ||
    !object(config.episodes) ||
    !Array.isArray(config.collections) ||
    !uniqueStrings(config.featured)
  )
    fail('expected schemaVersion 1, episodes, collections and unique featured GUIDs');
  const known = catalog && new Set(catalog.episodes.map((e) => e.id));
  const checkId = (id) => {
    if (!text(id) || (known && !known.has(id))) fail(`unknown episode GUID ${id}`);
  };
  for (const [id, override] of Object.entries(config.episodes)) {
    checkId(id);
    if (
      !object(override) ||
      override.reviewed !== true ||
      !keys(override, ['reviewed', 'categories', 'tags'])
    )
      fail(`episode ${id} must be reviewed and may only override categories/tags`);
    if (
      override.categories !== undefined &&
      (!uniqueStrings(override.categories) ||
        !override.categories.length ||
        !override.categories.every((c) => categoryIds.has(c)))
    )
      fail(`categories for ${id}`);
    if (override.tags !== undefined && !uniqueStrings(override.tags)) fail(`tags for ${id}`);
  }
  const collectionIds = new Set();
  for (const collection of config.collections) {
    if (
      !object(collection) ||
      !keys(collection, ['id', 'reviewed', 'title', 'description', 'episodeIds']) ||
      collection.reviewed !== true ||
      !text(collection.id) ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(collection.id) ||
      collection.id === 'long' ||
      collectionIds.has(collection.id) ||
      !localized(collection.title) ||
      (collection.description !== undefined && !localized(collection.description)) ||
      !uniqueStrings(collection.episodeIds)
    )
      fail('collection needs a unique slug (other than long), reviewed title and unique episodeIds');
    collectionIds.add(collection.id);
    collection.episodeIds.forEach(checkId);
  }
  config.featured.forEach(checkId);
  return config;
}

/** Returns a derived view; the original catalog, audio, artwork and GUIDs remain intact. */
export function applyEditorial(catalog, config) {
  validateEditorial(config);
  return {
    ...catalog,
    episodes: catalog.episodes.map((episode) => {
      // These fields belong exclusively to the reviewed sidecar, never raw catalog input.
      const { tags, suggestedCategories, ...source } = episode;
      const override = Object.hasOwn(config.episodes, episode.id) ? config.episodes[episode.id] : undefined;
      if (!override) return tags === undefined && suggestedCategories === undefined ? episode : source;
      return {
        ...source,
        ...(override.categories
          ? {
              categories: [...override.categories],
              suggestedCategories: [...episode.categories],
              categorySource: 'reviewed',
            }
          : {}),
        ...(override.tags ? { tags: [...override.tags] } : {}),
      };
    }),
  };
}

export function editorialText(value, language) {
  return typeof value === 'string' ? value : value?.[language] || value?.el || value?.en || '';
}
