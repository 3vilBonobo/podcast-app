import { afterEach, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Component, Input, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideTransloco } from '@jsverse/transloco';
import { EpisodesComponent } from '../src/app/features/episodes/episodes';
import { PodcastService } from '../src/app/core/podcast.service';
import { BundledTranslationLoader } from '../src/app/core/transloco-loader';
import { EpisodeDetailsComponent } from '../src/app/features/episodes/details';
import { AudioPlayerService } from '../src/app/core/audio-player.service';
import { LibraryService } from '../src/app/core/library.service';
import { EmptyStateComponent } from '../src/app/shared/empty-state';
import { IconComponent } from '../src/app/shared/icon';

// Vitest's TS transform does not generate Angular's AOT signal-input metadata.
// Stub shared presentational inputs; exercise the route's bindings and focus behavior.
@Component({ selector: 'dd-empty', template: '' })
class StubEmpty {
  @Input() headingLevel = 2;
  @Input() title = '';
  @Input() description = '';
  @Input() link = '';
  @Input() icon = '';
}
@Component({ selector: 'dd-icon', template: '' })
class StubIcon {
  @Input() name = '';
}

afterEach(() => TestBed.resetTestingModule());
it('returns keyboard focus to search when clearing an empty result removes the active button', async () => {
  const refresh = vi.fn();
  const params = new BehaviorSubject(convertToParamMap({ q: 'no-match' }));
  TestBed.configureTestingModule({
    providers: [
      provideTransloco({
        config: { availableLangs: ['en', 'el'], defaultLang: 'en', prodMode: true },
        loader: BundledTranslationLoader,
      }),
      {
        provide: ActivatedRoute,
        useValue: { queryParamMap: params, snapshot: { queryParamMap: params.value } },
      },
      {
        provide: Router,
        useValue: {
          navigate: () => {
            params.next(convertToParamMap({}));
            return Promise.resolve(true);
          },
        },
      },
      {
        provide: PodcastService,
        useValue: {
          episodes: signal([]),
          seasons: signal([]),
          collections: signal([]),
          loading: signal(false),
          error: signal(''),
          catalog: signal(null),
          load: refresh,
        },
      },
    ],
  });
  TestBed.overrideComponent(EpisodesComponent, {
    remove: { imports: [EmptyStateComponent, IconComponent] },
    add: { imports: [StubEmpty, StubIcon] },
  });
  const fixture = TestBed.createComponent(EpisodesComponent);
  document.body.append(fixture.nativeElement);
  try {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const refreshButton = Array.from(fixture.nativeElement.querySelectorAll('button'))
      .find((button: any) => button.textContent.includes('Refresh Episodes')) as HTMLButtonElement;
    expect(refreshButton).toBeTruthy();
    refreshButton.click();
    expect(refresh).toHaveBeenCalledOnce();
    TestBed.inject(PodcastService).loading.set(true);
    fixture.detectChanges();
    expect(refreshButton.disabled).toBe(true);
    TestBed.inject(PodcastService).loading.set(false);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('.load-more button');
    expect(buttons).toHaveLength(1);
    buttons[0].focus();
    expect(document.activeElement).toBe(buttons[0]);
    buttons[0].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.load-more button')).toBeNull();
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('input[type=search]'));
    expect((document.activeElement as HTMLInputElement).value).toBe('');
  } finally {
    fixture.nativeElement.remove();
  }
});
it('requests a primary heading and archive recovery for unknown episode deep links', async () => {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: 'episodes/:id', component: EpisodeDetailsComponent }]),
      provideTransloco({
        config: { availableLangs: ['en', 'el'], defaultLang: 'en', prodMode: true },
        loader: BundledTranslationLoader,
      }),
      { provide: PodcastService, useValue: { find: () => undefined, loading: signal(false) } },
      { provide: AudioPlayerService, useValue: {} },
      { provide: LibraryService, useValue: {} },
    ],
  });
  TestBed.overrideComponent(EpisodeDetailsComponent, {
    remove: { imports: [EmptyStateComponent, IconComponent] },
    add: { imports: [StubEmpty, StubIcon] },
  });
  const harness = await RouterTestingHarness.create('/episodes/unknown-guid');
  await harness.fixture.whenStable();
  harness.detectChanges();
  const empty = harness.routeDebugElement!.query(By.directive(StubEmpty)).componentInstance as StubEmpty;
  expect(empty.headingLevel).toBe(1);
  expect(empty.title).toBe('episodes.theCaseFileWasNotFound');
  expect(empty.link).toBe('/episodes');
});
