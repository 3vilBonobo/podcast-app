import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Component, Input } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router, provideRouter } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { Subject } from 'rxjs';
import { AppComponent } from '../src/app/app';
import { AudioPlayerService } from '../src/app/core/audio-player.service';
import { LibraryService } from '../src/app/core/library.service';
import { PodcastService } from '../src/app/core/podcast.service';
import { I18nService, MockAuthService, ThemeService } from '../src/app/core/preferences.service';
import { BundledTranslationLoader } from '../src/app/core/transloco-loader';
import { IconComponent } from '../src/app/shared/icon';

describe('navigation focus', () => {
  let events: Subject<NavigationEnd>;
  let main: HTMLElement;
  let search: HTMLInputElement;
  let tab: HTMLButtonElement;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.resetTestingModule();
    events = new Subject<NavigationEnd>();
    main = document.createElement('main');
    main.id = 'main-content';
    main.tabIndex = -1;
    search = document.createElement('input');
    search.type = 'search';
    tab = document.createElement('button');
    document.body.append(main, search, tab);
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { url: '/episodes', events } },
        ...[
          ThemeService,
          MockAuthService,
          I18nService,
          AudioPlayerService,
          PodcastService,
          LibraryService,
        ].map((service) => ({ provide: service, useValue: {} })),
      ],
    });
    TestBed.runInInjectionContext(() => new AppComponent());
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    main.remove();
    search.remove();
    tab.remove();
    vi.useRealTimers();
  });

  it('keeps the search focused as each typed character updates the query', () => {
    search.focus();
    for (const query of ['L', 'Le', 'Lea', 'Lead']) {
      search.value = query;
      events.next(new NavigationEnd(1, '/episodes?q=' + query, '/episodes?q=' + query));
      vi.runOnlyPendingTimers();
      expect(document.activeElement).toBe(search);
    }
  });

  it('moves focus on a page change but preserves the selected library tab on query changes', () => {
    events.next(new NavigationEnd(1, '/library', '/library'));
    vi.runOnlyPendingTimers();
    expect(document.activeElement).toBe(main);
    tab.focus();
    events.next(new NavigationEnd(2, '/library?tab=continue', '/library?tab=continue'));
    vi.runOnlyPendingTimers();
    expect(document.activeElement).toBe(tab);
  });

  it('leaves in-page fragment focus alone', () => {
    search.focus();
    events.next(new NavigationEnd(1, '/episodes#results', '/episodes#results'));
    vi.runOnlyPendingTimers();
    expect(document.activeElement).toBe(search);
  });

  it('cancels stale deferred focus when the user immediately filters the newly opened page', () => {
    events.next(new NavigationEnd(1, '/library', '/library'));
    tab.focus();
    events.next(new NavigationEnd(2, '/library?tab=queue', '/library?tab=queue'));
    vi.runOnlyPendingTimers();
    expect(document.activeElement).toBe(tab);
  });
});

@Component({ template: '<input aria-label="Case search" />' })
class SearchPage {}

@Component({ selector: 'dd-icon', template: '' })
class StubIcon {
  @Input() name = '';
}

describe('shell skip link under the Pages base path', () => {
  let shell: HTMLElement | undefined;
  afterEach(() => {
    TestBed.resetTestingModule();
    shell?.remove();
  });

  it('focuses the current page content without losing its route or filters', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'episodes', component: SearchPage }]),
        { provide: APP_BASE_HREF, useValue: '/podcast-app/' },
        provideTransloco({
          config: { availableLangs: ['el', 'en'], defaultLang: 'el', prodMode: true },
          loader: BundledTranslationLoader,
        }),
        { provide: ThemeService, useValue: {} },
        { provide: MockAuthService, useValue: { guest: () => true } },
        { provide: AudioPlayerService, useValue: { current: () => null } },
        { provide: PodcastService, useValue: {} },
        { provide: LibraryService, useValue: { repository: { error: () => '' } } },
      ],
    });
    TestBed.overrideComponent(AppComponent, {
      remove: { imports: [IconComponent] },
      add: { imports: [StubIcon] },
    });
    const fixture = TestBed.createComponent(AppComponent);
    shell = fixture.nativeElement;
    document.body.append(fixture.nativeElement);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/episodes?category=cults');
    fixture.detectChanges();
    await fixture.whenStable();
    const skipLink = fixture.nativeElement.querySelector('.skip-link') as HTMLAnchorElement;
    const main = fixture.nativeElement.querySelector('main') as HTMLElement;
    expect(skipLink.getAttribute('href')).toBe('/podcast-app/episodes?category=cults#main-content');
    (fixture.nativeElement.querySelector('input') as HTMLInputElement).focus();
    skipLink.click();
    await fixture.whenStable();
    expect(router.url).toBe('/episodes?category=cults#main-content');
    expect(document.activeElement).toBe(main);
    fixture.nativeElement.remove();
  });
});
