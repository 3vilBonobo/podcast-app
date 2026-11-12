import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PodcastService } from '../src/app/core/podcast.service';
import { isCatalog } from '../src/app/core/catalog-contract.mjs';
import catalog from '../public/data/catalog.json';

describe('independent public catalog refresh', () => {
  let http: HttpTestingController;
  let podcast: PodcastService;
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    podcast = TestBed.inject(PodcastService);
  });
  afterEach(() => {
    http.verify({ ignoreCancelled: true });
    TestBed.resetTestingModule();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
  const request = (http: HttpTestingController) =>
    http.expectOne((r) => r.url.endsWith('/data/catalog.json'));
  it('uses repository-relative cache-busted requests and accepts the current real catalog', () => {
    const req = request(http);
    expect(req.request.params.has('v')).toBe(true);
    req.flush(catalog);
    expect(isCatalog(catalog)).toBe(true);
    expect(podcast.episodes()).toHaveLength(catalog.episodes.length);
    expect(podcast.loading()).toBe(false);
  });
  it('rechecks while visible without replacing a valid catalog on invalid responses or failure', () => {
    request(http).flush(catalog);
    vi.advanceTimersByTime(15 * 60_000);
    request(http).flush(null);
    expect(podcast.rssCatalog()).toEqual(catalog);
    expect(podcast.error()).toBe('');
    podcast.load(true);
    request(http).flush('unavailable', { status: 503, statusText: 'Unavailable' });
    expect(podcast.rssCatalog()).toEqual(catalog);
    const updated = structuredClone(catalog);
    updated.episodes[0].title = 'Updated episode metadata';
    podcast.load(true);
    request(http).flush(updated);
    expect(podcast.latest()?.title).toBe('Updated episode metadata');
  });
  it('retains old data for missing consumed fields, duplicates and unsafe URLs', () => {
    request(http).flush(catalog);
    for (const mutation of [
      (c: any) => delete c.episodes[0].categories,
      (c: any) => c.episodes.push(c.episodes[0]),
      (c: any) => (c.episodes[0].audioUrl = 'javascript:alert(1)'),
    ]) {
      const broken = structuredClone(catalog);
      mutation(broken);
      podcast.load(true);
      request(http).flush(broken);
      expect(podcast.rssCatalog()).toEqual(catalog);
    }
  });
  it('prevents overlapping requests and gives a bounded initial failure with retry', () => {
    podcast.load();
    const pending = request(http);
    vi.advanceTimersByTime(20_001);
    expect(pending.cancelled).toBe(true);
    expect(podcast.loading()).toBe(false);
    expect(podcast.error()).toBe('common.weCouldNotOpenTheArchivePleaseTry');
    podcast.load();
    request(http).flush(catalog);
    expect(podcast.error()).toBe('');
  });
  it('avoids hidden polling and refreshes after returning to the app', () => {
    request(http).flush(catalog);
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    vi.advanceTimersByTime(15 * 60_000);
    http.expectNone((r) => r.url.endsWith('/data/catalog.json'));
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    document.dispatchEvent(new Event('visibilitychange'));
    request(http).flush(catalog);
  });
  it('ignores import timestamps and reports current, updated and failed refreshes without clearing content', () => {
    request(http).flush(catalog);
    const original=podcast.rssCatalog();
    podcast.load();
    expect(podcast.loading()).toBe(false);
    expect(podcast.refreshing()).toBe(true);
    request(http).flush({...catalog,fetchedAt:'2030-01-01T00:00:00.000Z'});
    expect(podcast.rssCatalog()).toBe(original);
    expect(podcast.refreshStatus()).toBe('current');
    const changed=structuredClone(catalog);changed.episodes[0].title+=' updated';
    podcast.load();request(http).flush(changed);
    expect(podcast.refreshStatus()).toBe('updated');
    const valid=podcast.rssCatalog();
    podcast.load();request(http).flush(null,{status:503,statusText:'Unavailable'});
    expect(podcast.refreshStatus()).toBe('error');
    expect(podcast.rssCatalog()).toBe(valid);
    expect(podcast.refreshing()).toBe(false);
  });
});
