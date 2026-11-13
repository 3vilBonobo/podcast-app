import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedViewsService } from '../src/app/core/saved-views.service';

beforeEach(() => localStorage.clear());
describe('device-local catalog views', () => {
  it('round-trips combined filters and names, without unrelated query parameters or identity', () => {
    const views = new SavedViewsService();
    expect(
      views.save('  Ανεξιχνίαστα  ', {
        q: 'Αθήνα',
        view: 'regular',
        season: '1',
        country: 'GR',
        sort: 'oldest',
        collection: 'long',
        category: 'unsolved,other',
        tag: 'with-guests',
        section: 'account',
        page: '5',
      }),
    ).toBe(true);
    const saved = new SavedViewsService().views()[0];
    expect(saved.name).toBe('Ανεξιχνίαστα');
    expect(saved.filters).toEqual({
      q: 'Αθήνα',
      view: 'regular',
      season: '1',
      country: 'GR',
      sort: 'oldest',
      collection: 'long',
      category: 'unsolved,other',
      tag: 'with-guests',
    });
    expect(Object.keys(localStorage)).toEqual(['dd:saved-views']);
    localStorage.setItem('dd:demo', 'true');
    expect(new SavedViewsService().views()).toEqual([saved]);
  });
  it('renames, removes and restores a view in its original position', () => {
    const views = new SavedViewsService();
    views.save('First', {});
    views.save('Second', { view: 'plus' });
    const [first, second] = views.views();
    expect(views.rename(first.id, 'Renamed')).toBe(true);
    expect(views.remove(first.id)).toBe(true);
    expect(new SavedViewsService().views()).toEqual([second]);
    expect(views.restore({ ...first, name: 'Renamed' }, 0)).toBe(true);
    expect(new SavedViewsService().views().map((v) => v.name)).toEqual(['Renamed', 'Second']);
  });
  it('preserves saved and in-memory data after storage fails', () => {
    const views = new SavedViewsService();
    views.save('Keep', { view: 'regular' });
    const previous = views.views();
    const persisted = localStorage.getItem('dd:saved-views');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(views.save('Lost', {})).toBe(false);
    expect(views.rename(previous[0].id, 'Lost')).toBe(false);
    expect(views.remove(previous[0].id)).toBe(false);
    expect(views.views()).toEqual(previous);
    expect(localStorage.getItem('dd:saved-views')).toBe(persisted);
    expect(views.error()).toBe(true);
  });
  it('reports malformed saved data and rejects empty names', () => {
    localStorage.setItem('dd:saved-views', '{broken');
    const views = new SavedViewsService();
    expect(views.views()).toEqual([]);
    expect(views.error()).toBe(true);
    expect(views.save('   ', {})).toBe(false);
    expect(localStorage.getItem('dd:saved-views')).toBe('{broken');
  });
});
