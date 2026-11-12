import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { applyEditorial, validateEditorial, editorialText } from '../src/app/core/editorial.mjs';
import { normalizeCatalog, isCatalog } from '../src/app/core/catalog-contract.mjs';

const catalog = JSON.parse(readFileSync('public/data/catalog.json', 'utf8'));
const empty = () => ({ schemaVersion: 1, episodes: {}, collections: [], featured: [] });
const id = catalog.episodes[0].id;
describe('reviewed editorial metadata', () => {
  it('validates checked-in host metadata and leaves RSS untouched with empty overrides', () => {
    const config = JSON.parse(readFileSync('editorial/overrides.json', 'utf8'));
    expect(() => validateEditorial(config, catalog)).not.toThrow();
    expect(applyEditorial(catalog, empty())).toEqual(catalog);
  });
  it('layers reviewed categories and tags by GUID without mutating RSS information', () => {
    const before = structuredClone(catalog);
    const config = {
      ...empty(),
      episodes: { [id]: { reviewed: true, categories: ['historical'], tags: ['Δοκιμή'] } },
      collections: [{ id: 'qa', reviewed: true, title: { el: 'Δοκιμή', en: 'Test' }, episodeIds: [id] }],
      featured: [id],
    };
    validateEditorial(config, catalog);
    const result = applyEditorial(catalog, config);
    expect(result.episodes[0]).toEqual({
      ...catalog.episodes[0],
      categories: ['historical'],
      suggestedCategories: catalog.episodes[0].categories,
      categorySource: 'reviewed',
      tags: ['Δοκιμή'],
    });
    expect(catalog).toEqual(before);
    expect(result.episodes[1]).toBe(catalog.episodes[1]);
  });
  it.each([
    { episodes: { [id]: { reviewed: false, tags: ['test'] } } },
    { episodes: { [id]: { reviewed: true, audioUrl: 'https://example.com/audio.mp3' } } },
    { episodes: { [id]: { reviewed: true, categories: [] } } },
    { episodes: { [id]: { reviewed: true, categories: ['invented'] } } },
    { featured: ['unknown-guid'] },
    { featured: [id, id] },
    { collections: [{ id: 'long', reviewed: true, title: 'Test', episodeIds: [id] }] },
    { collections: [{ id: 'qa', reviewed: true, title: '', episodeIds: [id] }] },
  ])('rejects invalid authoring rather than altering official content (%j)', (patch) => {
    expect(() => validateEditorial({ ...empty(), ...patch }, catalog)).toThrow('Invalid editorial');
  });
  it('can render older cached catalogs when reviewed GUIDs are not yet present', () => {
    const config = {
      ...empty(),
      episodes: { future: { reviewed: true, tags: ['Test'] } },
      featured: ['future'],
    };
    expect(applyEditorial(catalog, config)).toEqual(catalog);
  });
  it('accepts editorial fields only from the reviewed sidecar, including malformed raw tags', () => {
    const raw = structuredClone(catalog);
    raw.episodes[0].tags = { malformed: true };
    raw.episodes[0].suggestedCategories = ['invented'];
    const derived = applyEditorial(raw, empty());
    expect(derived.episodes[0].tags).toBeUndefined();
    expect(derived.episodes[0].suggestedCategories).toBeUndefined();
    expect(raw.episodes[0].tags).toEqual({ malformed: true });
    const reviewed = applyEditorial(raw, {
      ...empty(),
      episodes: { [id]: { reviewed: true, tags: ['Reviewed'] } },
    });
    expect(reviewed.episodes[0].tags).toEqual(['Reviewed']);
  });
  it('uses supplied translations with an explicit source-language fallback', () => {
    expect(editorialText({ el: 'Ελληνικά', en: 'English' }, 'en')).toBe('English');
    expect(editorialText({ el: 'Ελληνικά' }, 'en')).toBe('Ελληνικά');
    expect(editorialText('Host title', 'el')).toBe('Host title');
  });
});

describe('runtime catalog optional metadata', () => {
  it('accepts the current catalog unchanged', () => {
    expect(normalizeCatalog(catalog)).toEqual(catalog);
  });
  it('repairs malformed optional values without changing GUID, audio or verified preview status', () => {
    const value = structuredClone(catalog);
    const episode = value.episodes.find((e) => e.contentKind === 'promotional-preview');
    const original = structuredClone(episode);
    Object.assign(episode, {
      description: null,
      season: -1,
      episodeNumber: 1.5,
      duration: 'bad',
      artwork: 'javascript:bad',
      localArtwork: '/other/unsafe.png',
      audioType: null,
      episodeType: 'missing',
      link: 'javascript:bad',
    });
    const result = normalizeCatalog(value);
    expect(result).not.toBeNull();
    const repaired = result.episodes.find((e) => e.id === original.id);
    expect(repaired).toMatchObject({
      id: original.id,
      audioUrl: original.audioUrl,
      contentKind: 'promotional-preview',
      description: '',
      season: null,
      episodeNumber: null,
      duration: 0,
      artwork: value.artwork,
      audioType: 'audio/mpeg',
      episodeType: 'full',
      link: '',
    });
    expect(repaired.localArtwork).toBeUndefined();
    expect(episode.description).toBeNull();
    expect(isCatalog(value)).toBe(false); // Publisher remains strict; this is a presentation fallback.
  });
  it.each(['audioUrl', 'id', 'publishedAt', 'categories'])('does not repair invalid core %s', (key) => {
    const value = structuredClone(catalog);
    value.episodes[0][key] = null;
    expect(normalizeCatalog(value)).toBeNull();
  });
});
