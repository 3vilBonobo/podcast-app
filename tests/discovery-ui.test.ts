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
import { EpisodeCardComponent } from '../src/app/shared/episode-card';

@Component({ selector: 'dd-episode-card', template: '' })
class StubCard { @Input() episode: unknown; }

it.each(['', 'regular', 'plus'])('restores URL country after asynchronous catalog initialization in collection %s', async (view) => {
  const episodes = signal<any[]>([]);
  const params = new BehaviorSubject(convertToParamMap({country:'GB',tag:'double-slashers',season:'1',sort:'oldest',view}));
  TestBed.configureTestingModule({providers:[
    provideTransloco({config:{availableLangs:['en','el'],defaultLang:'en',prodMode:true},loader:BundledTranslationLoader}),
    {provide:ActivatedRoute,useValue:{queryParamMap:params,snapshot:{queryParamMap:params.value}}},
    {provide:Router,useValue:{navigate:vi.fn()}},
    {provide:PodcastService,useValue:{episodes,collections:signal([]),loading:signal(false),refreshing:signal(false),refreshStatus:signal('idle'),error:signal(''),catalog:signal(null)}}
  ]});
  TestBed.overrideComponent(EpisodesComponent,{remove:{imports:[EpisodeCardComponent,IconComponent]},add:{imports:[StubCard,StubIcon]}});
  const fixture=TestBed.createComponent(EpisodesComponent);
  fixture.detectChanges(); await fixture.whenStable();
  const select=fixture.nativeElement.querySelector('.country-filter select') as HTMLSelectElement;
  expect(select.options).toHaveLength(1);
  expect(fixture.componentInstance.country()).toBe('GB');
  await Promise.resolve();
  episodes.set([ {id:'qa',title:'Case',description:'',countries:['GB'],tags:['double-slashers'],categories:['other'],season:1,publishedAt:'2020-01-01',duration:3600,contentKind:view==='plus'?'promotional-preview':'public-episode'} ]);
  fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
  expect(select.value).toBe('GB');
  expect(select.selectedOptions[0].textContent).toContain('United Kingdom');
  expect(fixture.componentInstance.filtered().map(e=>e.id)).toEqual(['qa']);
  expect(fixture.componentInstance.sort()).toBe('oldest');
  params.next(convertToParamMap({country:'GB',tag:'double-slashers',season:'1',sort:'newest',view}));
  fixture.detectChanges();
  expect(select.value).toBe('GB');
  fixture.destroy();
});

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
          refreshing: signal(false), refreshStatus: signal('idle'),
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
    expect(fixture.nativeElement.querySelectorAll('.category-section .format-chip')).toHaveLength(5);
    expect(fixture.nativeElement.querySelectorAll('.format-chip dd-icon')).toHaveLength(5);
    expect(fixture.nativeElement.querySelector('.discovery-formats')).toBeNull();
    expect(fixture.nativeElement.querySelector('.advanced-filters')).toBeNull();
    expect(Array.from(fixture.nativeElement.querySelectorAll('.catalog-toolbar select')).map((select: any) => select.labels[0].firstChild.textContent.trim()))
      .toEqual(['Season', 'Case location', 'Sort by']);
    const refreshButton = Array.from(fixture.nativeElement.querySelectorAll('button'))
      .find((button: any) => button.textContent.includes('Refresh Episodes')) as HTMLButtonElement;
    expect(refreshButton).toBeTruthy();
    refreshButton.click();
    expect(refresh).toHaveBeenCalledOnce();
    TestBed.inject(PodcastService).refreshing.set(true);
    fixture.detectChanges();
    expect(refreshButton.disabled).toBe(true);
    TestBed.inject(PodcastService).refreshing.set(false);
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
