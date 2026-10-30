import { describe, expect, it } from 'vitest';
import { assetUrl } from '../src/app/core/asset-url';
describe('GitHub Pages asset URLs', () => {
  const base = 'https://3vilbonobo.github.io/podcast-app/';
  it('loads the catalog and leading-slash artwork beneath the repository base', () => {
    expect(assetUrl('data/catalog.json', base)).toBe(base + 'data/catalog.json');
    expect(assetUrl('/images/podcast.jpg', base)).toBe(base + 'images/podcast.jpg');
  });
  it('preserves original official remote URLs and query strings', () => {
    const url = 'https://storage.buzzsprout.com/art?.jpg';
    expect(assetUrl(url, base)).toBe(url);
  });
  it('also supports a site served from the domain root', () => {
    expect(assetUrl('/icon.svg', 'http://localhost:4200/')).toBe('http://localhost:4200/icon.svg');
  });
});
