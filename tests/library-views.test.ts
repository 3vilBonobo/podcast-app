import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { IDBFactory } from 'fake-indexeddb';
import { LibraryComponent } from '../src/app/features/library/library';
import { LibraryService } from '../src/app/core/library.service';
import { PodcastService } from '../src/app/core/podcast.service';
import { listeningProgress } from '../src/app/core/listening-progress';
let library: LibraryService, view: LibraryComponent;
const params = new BehaviorSubject(convertToParamMap({}));
const navigate = vi.fn();
beforeEach(async () => {
  TestBed.resetTestingModule();
  params.next(convertToParamMap({}));
  navigate.mockClear();
  Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: new IDBFactory() });
  TestBed.configureTestingModule({
    providers: [
      {
        provide: ActivatedRoute,
        useValue: { queryParamMap: params, snapshot: { queryParamMap: params.value } },
      },
      { provide: Router, useValue: { navigate } },
      {
        provide: PodcastService,
        useValue: { find: (id: string) => (['a', 'b', 'c'].includes(id) ? { id } : undefined) },
      },
    ],
  });
  library = TestBed.inject(LibraryService);
  await library.ready;
  view = TestBed.runInInjectionContext(() => new LibraryComponent());
});
afterEach(() => TestBed.resetTestingModule());
describe('local library views', () => {
  it('keeps favorites and queue order consistent and retains unavailable IDs', () => {
    library.toggleFavorite('b');
    library.toggleFavorite('missing');
    expect(view.episodes().map((e) => e.id)).toEqual(['b']);
    expect(view.missing()).toEqual(['missing']);
    library.enqueue('b');
    library.enqueue('a');
    library.enqueue('b');
    params.next(convertToParamMap({ tab: 'queue' }));
    expect(view.ids()).toEqual(['b', 'a']);
    library.moveInQueue('a', -1);
    expect(view.ids()).toEqual(['a', 'b']);
  });
  it('distinguishes unplayed saved positions, recent playback, continue and sticky completed history', () => {
    library.savePosition('a', 20, 100);
    library.savePosition('b', 40, 100, 2, false, true);
    library.savePosition('c', 100, 100, 3, true);
    library.savePosition('c', 0, 100);
    params.next(convertToParamMap({ tab: 'recent' }));
    expect(view.ids()).not.toContain('a');
    expect(view.ids()).toContain('b');
    params.next(convertToParamMap({ tab: 'continue' }));
    expect(new Set(view.ids())).toEqual(new Set(['a', 'b']));
    params.next(convertToParamMap({ tab: 'completed' }));
    expect(view.ids()).toEqual(['c']);
    expect(library.records().reduce((sum, r) => sum + r.listenedSeconds, 0)).toBe(5);
    expect(library.minutes()).toBe(0);
  });
  it('leaves modified browser navigation keys alone and uses arrow-key tab navigation', () => {
    view.tabKey(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true }), 'favorites');
    expect(navigate).not.toHaveBeenCalled();
    view.tabKey(new KeyboardEvent('keydown', { key: 'End' }), 'favorites');
    expect(navigate).toHaveBeenCalledWith([], expect.objectContaining({ queryParams: { tab: 'queue' } }));
  });
});
it('clamps progress and does not invent progress when duration is unknown', () => {
  expect(listeningProgress(50, 100)).toBe(50);
  expect(listeningProgress(200, 100)).toBe(100);
  expect(listeningProgress(-10, 100)).toBe(0);
  expect(listeningProgress(50, 0)).toBe(0);
  expect(listeningProgress(Infinity, 100)).toBe(0);
});
