import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Component, Input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterLink } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideTransloco, TranslocoDirective } from '@jsverse/transloco';
import { LibraryBackupPanelComponent } from '../src/app/features/profile/library-backup-panel';
import { EpisodesComponent } from '../src/app/features/episodes/episodes';
import { ProfileComponent } from '../src/app/features/profile/profile';
import { ProfilePreferencesComponent } from '../src/app/features/profile/profile-preferences';
import { SavedViewsPanelComponent } from '../src/app/features/profile/saved-views-panel';
import { SaveViewComponent } from '../src/app/shared/save-view';
import { IconComponent } from '../src/app/shared/icon';
import { EpisodeCardComponent } from '../src/app/shared/episode-card';
import { EmptyStateComponent } from '../src/app/shared/empty-state';
import { PodcastService } from '../src/app/core/podcast.service';
import { LibraryService } from '../src/app/core/library.service';
import { AudioPlayerService } from '../src/app/core/audio-player.service';
import { SavedViewsService } from '../src/app/core/saved-views.service';
import { BundledTranslationLoader } from '../src/app/core/transloco-loader';

@Component({ selector: 'dd-icon', template: '' })
class Icon {
  @Input() name = '';
}
@Component({ selector: 'dd-episode-card', template: '' })
class Card {
  @Input() episode: unknown;
}
@Component({ selector: 'dd-empty', template: '' })
class Empty {
  @Input() title = '';
  @Input() description = '';
  @Input() icon = '';
}
beforeEach(() => {
  localStorage.clear();
  TestBed.resetTestingModule();
});
afterEach(() => TestBed.resetTestingModule());
async function setup() {
  localStorage.setItem('dd:language', 'en');
  const player = { speed: signal(1), setSpeed: vi.fn(), play: vi.fn() };
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: 'episodes', component: EpisodesComponent },
        { path: 'profile', component: ProfileComponent },
      ]),
      provideTransloco({
        config: {
          availableLangs: ['el', 'en'],
          defaultLang: 'en',
          reRenderOnLangChange: true,
          prodMode: true,
        },
        loader: BundledTranslationLoader,
      }),
      {
        provide: PodcastService,
        useValue: {
          episodes: signal([
            {
              id: 'one',
              title: 'Case',
              description: '',
              countries: ['GB'],
              tags: ['specials'],
              categories: ['other'],
              season: 1,
              publishedAt: '2026-01-01',
              duration: 3600,
              contentKind: 'public-episode',
            },
          ]),
          collections: signal([]),
          catalog: signal(null),
          loading: signal(false),
          refreshing: signal(false),
          refreshStatus: signal('idle'),
          error: signal(''),
        },
      },
      {
        provide: LibraryService,
        useValue: {
          minutes: signal(0),
          completed: signal([]),
          records: signal([]),
          state: signal({ favorites: [], queue: [], records: {}, currentId: null }),
        },
      },
      { provide: AudioPlayerService, useValue: player },
    ],
  });
  TestBed.overrideComponent(ProfileComponent, {
    set: {
      styleUrl: undefined,
      styles: [],
      imports: [
        TranslocoDirective,
        RouterLink,
        Icon,
        LibraryBackupPanelComponent,
        ProfilePreferencesComponent,
        SavedViewsPanelComponent,
      ],
    },
  });
  TestBed.overrideComponent(ProfilePreferencesComponent, {
    set: { styleUrl: undefined, styles: [], imports: [TranslocoDirective, Icon] },
  });
  TestBed.overrideComponent(SavedViewsPanelComponent, {
    set: { styleUrl: undefined, styles: [], imports: [TranslocoDirective, RouterLink, Icon] },
  });
  TestBed.overrideComponent(SaveViewComponent, {
    remove: { imports: [IconComponent] },
    add: { imports: [Icon] },
  });
  TestBed.overrideComponent(EpisodesComponent, {
    remove: { imports: [EpisodeCardComponent, IconComponent, EmptyStateComponent] },
    add: { imports: [Card, Icon, Empty] },
  });
  const harness = await RouterTestingHarness.create();
  const settle = async () => {
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
  };
  const click = async (selector: string) => {
    (harness.routeNativeElement!.querySelector(selector) as HTMLElement).click();
    await settle();
  };
  return { harness, settle, click, player };
}
it('saves the active archive view, manages its name and reopens the exact filters without playback', async () => {
  const { harness, settle, click, player } = await setup();
  await harness.navigateByUrl(
    '/episodes?view=regular&country=GB&category=other&tag=specials&sort=oldest&season=1',
    EpisodesComponent,
  );
  await click('#save-view-toggle');
  const input = harness.routeNativeElement!.querySelector('#new-view-name') as HTMLInputElement;
  input.value = 'Late night cases';
  harness
    .routeNativeElement!.querySelector('form')!
    .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await settle();
  const views = TestBed.inject(SavedViewsService);
  expect(views.views()[0].name).toBe('Late night cases');
  await harness.navigateByUrl('/profile?section=presets', ProfileComponent);
  await click('[id^="rename-view-"]');
  const rename = harness.routeNativeElement!.querySelector('.view-name-form input') as HTMLInputElement;
  rename.value = 'My cases';
  harness
    .routeNativeElement!.querySelector('form')!
    .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await settle();
  expect(new SavedViewsService().views()[0].name).toBe('My cases');
  await click('.saved-view-actions a');
  expect(TestBed.inject(Router).parseUrl(TestBed.inject(Router).url).queryParams).toEqual({
    view: 'regular',
    country: 'GB',
    category: 'other',
    tag: 'specials',
    sort: 'oldest',
    season: '1',
  });
  expect(player.play).not.toHaveBeenCalled();
});
it('exposes selected profile navigation, immediate speed preferences and keyboard-safe removal undo', async () => {
  const { harness, settle, click, player } = await setup();
  await harness.navigateByUrl('/profile?section=preferences', ProfileComponent);
  expect(harness.routeNativeElement!.querySelector('[aria-current="page"]')!.textContent).toContain(
    'Preferences',
  );
  const speed = harness.routeNativeElement!.querySelector(
    'select[aria-label="Playback speed"]',
  ) as HTMLSelectElement;
  expect(speed).not.toBeNull();
  speed.value = '1.5';
  speed.dispatchEvent(new Event('change'));
  await settle();
  expect(player.setSpeed).toHaveBeenCalledWith(1.5);
  const views = TestBed.inject(SavedViewsService);
  views.save('Keep me', {});
  await harness.navigateByUrl('/profile?section=presets', ProfileComponent);
  await click('.saved-view-actions button:last-child');
  expect(views.views()).toEqual([]);
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(document.activeElement?.id).toBe('undo-view');
  await click('#undo-view');
  expect(views.views()[0].name).toBe('Keep me');
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(document.activeElement?.id).toBe('rename-view-' + views.views()[0].id);
  await harness.navigateByUrl('/profile?section=unknown', ProfileComponent);
  expect(harness.routeNativeElement!.querySelector('.stats-grid')).not.toBeNull();
});
