import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { EpisodesComponent } from '../src/app/features/episodes/episodes';
import { PodcastService } from '../src/app/core/podcast.service';
import { TranslocoService } from '@jsverse/transloco';
import type { Episode } from '../src/app/core/models';

describe('catalog filters', () => {
  const params = new BehaviorSubject(convertToParamMap({}));
  const navigate = vi.fn();
  const sample: Episode[] = [
    {
      id: 'a',
      title: 'A cult case',
      description: '',
      season: 1,
      categories: ['cults'],
      duration: 4000,
      publishedAt: '2026-01-01',
    },
    {
      id: 'b',
      title: 'A robbery',
      description: '',
      season: 2,
      categories: ['robberies'],
      duration: 2000,
      publishedAt: '2026-02-01',
    },
    {
      id: 'c',
      title: 'Another cult case',
      description: '',
      season: 2,
      categories: ['cults'],
      duration: 5000,
      publishedAt: '2026-03-01',
    },
  ] as Episode[];
  beforeEach(() => {
    TestBed.resetTestingModule();
    params.next(convertToParamMap({}));
    navigate.mockClear();
    TestBed.configureTestingModule({
      providers: [
        { provide: TranslocoService, useValue: { getActiveLang: () => 'el' } },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: params, snapshot: { queryParamMap: params.value } },
        },
        { provide: Router, useValue: { navigate } },
        { provide: PodcastService, useValue: { episodes: signal(sample), collections: signal([]) } },
      ],
    });
  });
  afterEach(() => TestBed.resetTestingModule());
  const component = () => TestBed.runInInjectionContext(() => new EpisodesComponent());
  it('separates verified previews and combines OR categories with AND format/country filters', () => {
    const episodes = TestBed.inject(PodcastService).episodes as ReturnType<typeof signal<Episode[]>>;
    episodes.set([
      {...sample[0], countries:['GR'], tags:['double-slashers','with-guests']},
      {...sample[1], countries:['US'], tags:['with-guests']},
      {...sample[2], countries:['GR'], tags:['double-slashers'], contentKind:'promotional-preview'},
    ]);
    const view=component();
    expect(view.collectionEpisodes().map(e=>e.id)).toEqual(['a','b','c']);
    params.next(convertToParamMap({view:'regular'}));
    expect(view.collectionEpisodes().map(e=>e.id)).toEqual(['a','b']);
    params.next(convertToParamMap({category:'cults,robberies',tag:'double-slashers,with-guests',country:'GR'}));
    expect(view.filtered().map(e=>e.id)).toEqual(['a']);
    params.next(convertToParamMap({view:'plus',tag:'double-slashers',country:'GR'}));
    expect(view.filtered().map(e=>e.id)).toEqual(['c']);
    expect(view.categoryCount('cults')).toBe(1);
    expect(view.availableSeasons()).toEqual([2]);
  });
  it('combines any selected crime category with season and search', () => {
    const view = component();
    params.next(convertToParamMap({ category: 'cults,robberies', season: '2', q: 'cult' }));
    expect(view.filtered().map((e) => e.id)).toEqual(['c']);
  });
  it('uses OR within categories and preserves publication sorting', () => {
    const view = component();
    params.next(convertToParamMap({ category: 'cults,robberies', sort: 'oldest' }));
    expect(view.filtered().map((e) => e.id)).toEqual(['a', 'b', 'c']);
  });
  it('ignores unknown category URLs and applies long-episode collections', () => {
    const view = component();
    params.next(convertToParamMap({ category: 'invalid', collection: 'long' }));
    expect(view.filtered().map((e) => e.id)).toEqual(['c', 'a']);
  });
  it('resets pagination and preserves other URL filters when changing a category', () => {
    const view = component();
    view.limit.set(60);
    view.toggleCategory('cults');
    expect(view.limit()).toBe(20);
    expect(navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { category: 'cults' },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      }),
    );
  });
  it('matches Greek case, accents, decomposed accents and final sigma across title and description', () => {
    const catalog = TestBed.inject(PodcastService).episodes as ReturnType<typeof signal<Episode[]>>;
    catalog.set([
      { ...sample[0], title: 'Ο Δολοφόνος', description: 'Στην ΑΘΗΝΑ, ένας μάρτυρας.' },
      { ...sample[1], title: 'Άλλη υπόθεση', description: 'Χωρίς αντιστοιχία' },
    ]);
    const view = component();
    for (const q of ['δολοφονοσ αθηνα', 'ΑΘΉΝΑ δολοφόνος', '  δολοφονος   ΜΑΡΤΥΡΑΣ ']) {
      params.next(convertToParamMap({ q }));
      expect(view.filtered().map((e) => e.id)).toEqual(['a']);
    }
  });
  it('combines reviewed tags with categories, season, collection and sorting', () => {
    const catalog = TestBed.inject(PodcastService).episodes as ReturnType<typeof signal<Episode[]>>;
    catalog.set([
      { ...sample[0], tags: ['Μαρτυρίες'] },
      { ...sample[2], tags: ['Μαρτυρίες'] },
    ]);
    const view = component();
    params.next(
      convertToParamMap({
        q: 'cult μαρτυριες',
        category: 'cults,robberies',
        season: '2',
        collection: 'long',
        sort: 'oldest',
      }),
    );
    expect(view.filtered().map((e) => e.id)).toEqual(['c']);
    params.next(convertToParamMap({ q: 'missing' }));
    expect(view.filtered()).toEqual([]);
  });
  it('resets expanded pagination when URL filters change externally', () => {
    const view = component();
    view.limit.set(60);
    params.next(convertToParamMap({ season: '2' }));
    expect(view.limit()).toBe(20);
  });
  it('falls back safely for unknown season and sort values and exposes sort-only clearing', () => {
    const view = component();
    params.next(convertToParamMap({ season: 'missing', sort: 'invalid' }));
    expect(view.season()).toBe('all');
    expect(view.sort()).toBe('newest');
    expect(view.filtered().map((e) => e.id)).toEqual(['c', 'b', 'a']);
    params.next(convertToParamMap({ sort: 'oldest' }));
    expect(view.hasFilters()).toBe(true);
  });
  it('distinguishes the explicit no-season option from malformed null URL strings', () => {
    const catalog = TestBed.inject(PodcastService).episodes as ReturnType<typeof signal<Episode[]>>;
    catalog.set([{ ...sample[0], season: null }, sample[1]]);
    const view = component();
    params.next(convertToParamMap({ season: 'null' }));
    expect(view.season()).toBe('all');
    params.next(convertToParamMap({ season: 'none' }));
    expect(view.filtered().map((e) => e.id)).toEqual(['a']);
  });
  it('applies a reviewed collection together with tags, multi-category selection and season', () => {
    const service = TestBed.inject(PodcastService);
    (service.episodes as ReturnType<typeof signal<Episode[]>>).set(
      sample.map((e) => ({ ...e, tags: ['Μαρτυρίες'] })),
    );
    (service.collections as ReturnType<typeof signal<any[]>>).set([
      { id: 'qa', title: 'QA fixture', reviewed: true, episodeIds: ['b', 'c'] },
    ]);
    const view = component();
    params.next(
      convertToParamMap({
        collection: 'qa',
        category: 'cults,robberies',
        q: 'μαρτυριες',
        season: '2',
        sort: 'oldest',
      }),
    );
    expect(view.filtered().map((e) => e.id)).toEqual(['b', 'c']);
    params.next(convertToParamMap({ collection: 'unknown' }));
    expect(view.collection()).toBeNull();
    expect(view.filtered()).toHaveLength(3);
  });
  it('sorts valid timestamp offsets chronologically with stable GUID ordering for ties', () => {
    const catalog = TestBed.inject(PodcastService).episodes as ReturnType<typeof signal<Episode[]>>;
    catalog.set([
      { ...sample[0], publishedAt: '2026-01-01T01:00:00+03:00' },
      { ...sample[2], publishedAt: '2025-12-31T22:30:00Z' },
      { ...sample[1], publishedAt: '2025-12-31T22:30:00Z' },
    ]);
    const view = component();
    params.next(convertToParamMap({ sort: 'oldest' }));
    expect(view.filtered().map((e) => e.id)).toEqual(['a', 'b', 'c']);
  });
});
