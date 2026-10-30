import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { EpisodesComponent } from '../src/app/features/episodes/episodes';
import { PodcastService } from '../src/app/core/podcast.service';
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
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: params, snapshot: { queryParamMap: params.value } },
        },
        { provide: Router, useValue: { navigate } },
        { provide: PodcastService, useValue: { episodes: signal(sample) } },
      ],
    });
  });
  afterEach(() => TestBed.resetTestingModule());
  const component = () => TestBed.runInInjectionContext(() => new EpisodesComponent());
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
});
