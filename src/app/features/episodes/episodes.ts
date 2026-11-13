import { TranslocoDirective } from '@jsverse/transloco';
import { Component, computed, effect, inject, linkedSignal, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PodcastService } from '../../core/podcast.service';
import { EpisodeCardComponent } from '../../shared/episode-card';
import { EmptyStateComponent } from '../../shared/empty-state';
import { IconComponent } from '../../shared/icon';
import { CRIME_CATEGORIES } from '../../core/categories';
import type { CrimeCategory } from '../../core/models';
import { matchesSearch } from '../../core/discovery';
import { editorialText } from '../../core/editorial.mjs';
import { TranslocoService } from '@jsverse/transloco';
@Component({
  imports: [TranslocoDirective, EpisodeCardComponent, EmptyStateComponent, IconComponent],
  template: `<ng-container *transloco="let t"
    ><div class="page catalog-page">
      <div class="page-intro">
        <div>
          <p class="eyebrow accent">{{ t('episodes.everyCaseHasItsPlace') }}</p>
          <h1>{{ t('episodes.theArchive') }}<span class="accent">.</span></h1>
          <p class="intro-description">
            {{ collectionEpisodes().length }} {{ t(contentType() === 'plus' ? 'discovery.previewDescription' : contentType() === 'regular' ? 'episodes.publicEpisodesWhereWillTheNextStoryFind' : 'discovery.allDescription') }}
          </p>
        </div>
        <button type="button" class="text-button refresh-control" [disabled]="podcast.refreshing()" (click)="refresh()">
          <dd-icon name="refresh" /> {{ t(podcast.refreshing() ? 'discovery.checking' : 'episodes.refreshEpisodes') }}
        </button>
      </div>
      @if (manualRefresh() && podcast.refreshStatus() !== 'idle') {
        <p class="refresh-feedback" role="status" aria-live="polite">{{ t(refreshMessage()) }}</p>
      }
      <div class="discovery-panel">
      <div class="collection-switch" role="group" [attr.aria-label]="t('discovery.listenTo')">
        @for (type of contentTypes; track type) {
          <button type="button" [class.active]="contentType() === type" [attr.aria-pressed]="contentType() === type" (click)="setFilter('view', type === 'all' ? '' : type)">{{ t(contentLabel(type)) }}</button>
        }
      </div>
      <div class="catalog-toolbar">
        <div class="search-field">
          <dd-icon name="search" /><input
            #searchField
            type="search"
            [placeholder]="t('episodes.aTitleANameOrADarkLittle')"
            [attr.aria-label]="t('shell.searchEpisodes')"
            [value]="search()"
            (input)="setFilter('q', $any($event.target).value)"
          />
        </div>
        <label class="select-label"
          >{{ t('episodes.season105')
          }}<select [value]="season()" (change)="setFilter('season', $any($event.target).value)">
            <option value="all">{{ t('episodes.allSeasons') }}</option>
            @for (season of availableSeasons(); track season) {
              <option [value]="season" [selected]="season.toString() === this.season()">
                {{ t('episodes.season105') }} {{ season }}
              </option>
            }
            @if (hasUnseasoned()) { <option value="none" [selected]="season() === 'none'">{{ t('episodes.noSeasonListed') }}</option> }
          </select></label
        >
        <label class="select-label country-filter">{{ t('discovery.country') }}
          <span class="country-select">
            <dd-icon name="case-country" />
            <select [value]="country()" [attr.aria-label]="t('discovery.country')" [attr.title]="t('discovery.countryHelp')" (change)="setFilter('country', $any($event.target).value)">
              <option value="">{{ t('discovery.allCountries') }}</option>
              @for (code of countries(); track code) { <option [value]="code" [selected]="code === country()">{{ countryName(code) }}</option> }
            </select>
          </span>
        </label>
        <label class="select-label"
          >{{ t('episodes.sortBy')
          }}<select [value]="sort()" (change)="setFilter('sort', $any($event.target).value)">
            <option value="newest">{{ t('episodes.newestFirst') }}</option>
            <option value="oldest">{{ t('episodes.oldestFirst') }}</option>
          </select></label
        >
      </div>
      @if (podcast.collections().length) {
        <label class="select-label curated-select"
          >{{ t('discovery.collection') }}
          <select [value]="collection() || ''" (change)="setFilter('collection', $any($event.target).value)">
            <option value="">{{ t('discovery.allCollections') }}</option>
            <option value="long">{{ t('home.oneMoreHour') }}</option>
            @for (item of podcast.collections(); track item.id) {
              <option [value]="item.id">{{ collectionTitle(item.title) }}</option>
            }
          </select>
        </label>
      }
      <section class="category-section" [attr.aria-label]="t('episodes.chooseYourCase')" [attr.aria-description]="t('discovery.selectionHelp')">
        <div class="category-topline">
          <p class="eyebrow">{{ t('episodes.chooseYourCase') }}</p>
        </div>
        <div class="category-chips">
          <button
            class="category-chip"
            [class.active]="!selectedCategories().length"
            [attr.aria-pressed]="!selectedCategories().length"
            (click)="setFilter('category', '')"
          >
            <dd-icon name="folder" />{{ t('episodes.allCases') }}
            <small>{{ collectionEpisodes().length }}</small>
          </button>
          @for (category of categories; track category.id) {
            <button
              class="category-chip"
              [class.active]="selectedCategories().includes(category.id)"
              [attr.aria-pressed]="selectedCategories().includes(category.id)"
              (click)="toggleCategory(category.id)"
            >
              <dd-icon [name]="category.icon" />{{ t(category.label) }}
              <small>{{ categoryCount(category.id) }}</small>
            </button>
          }
          @for (tag of discoveryTags; track tag) {
            <button type="button" class="category-chip format-chip" [class.active]="selectedTags().includes(tag)" [attr.aria-pressed]="selectedTags().includes(tag)" (click)="toggleTag(tag)"><dd-icon [name]="tag" />{{ t(tagLabel(tag)) }}</button>
          }
        </div>
      </section>
      </div>
      <div class="results-line">
        <span role="status" aria-live="polite" aria-atomic="true"
          >{{ filtered().length }} {{ t('episodes.episodes') }}
          @if (collection() === 'long') {
            {{ t('episodes.overAnHour') }}
          }
        </span>
        @if (hasFilters()) {
          <button class="text-button" (click)="clear(searchField)">
            {{ t('episodes.clearFilters') }} <dd-icon name="close" />
          </button>
        }
      </div>
      @if (podcast.loading()) {
        <div
          class="skeleton hero-skeleton"
          role="status"
          [attr.aria-label]="t('episodes.loadingTheArchive')"
        ></div>
      } @else if (podcast.error() && !podcast.catalog()) {
        <div class="notice" role="alert">
          {{ t(podcast.error()) }}
          <button class="button secondary" (click)="podcast.load()">{{ t('episodes.tryAgain') }}</button>
        </div>
      } @else if (!filtered().length) {
        <dd-empty
          icon="search"
          title="episodes.thisCaseWasNotFound"
          description="episodes.tryAnotherWordOrRemoveAFilter"
        />
        @if (hasFilters()) {
          <div class="load-more">
            <button class="button secondary" (click)="clear(searchField)">
              {{ t('episodes.clearFilters') }}
            </button>
          </div>
        }
      } @else {
        <div class="episode-grid catalog-grid">
          @for (episode of visible(); track episode.id) {
            <dd-episode-card [episode]="episode" />
          }
        </div>
        @if (visible().length < filtered().length) {
          <div class="load-more">
            <button class="button secondary" (click)="limit.update(addPage)">
              {{ t('episodes.moreStories') }} <dd-icon name="down" />
            </button>
            <p>{{ visible().length }} {{ t('episodes.of') }} {{ filtered().length }}</p>
          </div>
        }
      }
      <div class="catalog-source">
        <span class="on-air-dot"></span> {{ t('episodes.officialPublicBuzzsproutCatalog') }}
        @if (podcast.catalog(); as catalog) {
          <span>{{ t('episodes.updated') }} {{ catalog.fetchedAt.slice(0, 10) }}</span>
          @if (catalog.fixture) {
            <strong>{{ t('episodes.localFixtureTestData') }}</strong>
          }
        }
      </div>
    </div></ng-container
  >`,
})
export class EpisodesComponent {
  readonly manualRefresh = signal(false);
  readonly refreshMessage = computed(() => 'discovery.refresh.' + this.podcast.refreshStatus());
  tagLabel(tag: string): string { return 'discovery.tags.' + tag; }
  refresh(): void { this.manualRefresh.set(true); this.podcast.load(); }
  readonly discoveryTags = ['double-slashers', 'greek-cases', 'with-guests', 'bloopers', 'specials'];
  readonly categories = CRIME_CATEGORIES;
  readonly podcast = inject(PodcastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);
  readonly collectionTitle = (title: Parameters<typeof editorialText>[0]) =>
    editorialText(title, this.transloco.getActiveLang());
  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  readonly search = computed(() => this.params().get('q') ?? '');
  readonly contentTypes = ['all', 'regular', 'plus'] as const;
  contentLabel(type: string): string { return 'discovery.contentTypes.' + type; }
  readonly contentType = computed(() => {
    const view = this.params().get('view');
    return view === 'plus' || view === 'regular' ? view : 'all';
  });
  private episodesFor(type: string) {
    return this.podcast.episodes().filter(e => type === 'all' || (e.contentKind === 'promotional-preview') === (type === 'plus'));
  }
  readonly collectionEpisodes = computed(() => this.episodesFor(this.contentType()));
  readonly hasUnseasoned = computed(() => this.collectionEpisodes().some(e => e.season === null));
  readonly availableSeasons = computed(() => [...new Set(this.collectionEpisodes().map(e => e.season).filter((s): s is number => s !== null))].sort((a,b) => b-a));
  // Keep geography choices stable when changing content type; a valid country may have no matches.
  readonly countries = computed(() => [...new Set(this.podcast.episodes().flatMap(e => e.countries ?? []))].sort());
  readonly country = computed(() => this.params().get('country') ?? '');
  readonly selectedTags = computed(() => (this.params().get('tag') ?? '').split(',').filter(t => this.discoveryTags.includes(t)));
  countryName(code: string): string { return new Intl.DisplayNames([this.transloco.getActiveLang()], {type: 'region'}).of(code) ?? code; }
  toggleTag(tag: string): void { this.setFilter('tag', (this.selectedTags().includes(tag) ? this.selectedTags().filter(t => t !== tag) : [...this.selectedTags(), tag]).join(',')); }
  readonly season = computed(() => {
    const value = this.params().get('season') ?? 'all';
    return this.validSeason(value, this.collectionEpisodes())
      ? value
      : 'all';
  });
  readonly sort = computed(() => (this.params().get('sort') === 'oldest' ? 'oldest' : 'newest'));
  readonly collection = computed(() => {
    const id = this.params().get('collection');
    return id === 'long' || this.podcast.collections().some((c) => c.id === id) ? id : null;
  });
  readonly selectedCategories = computed(() =>
    (this.params().get('category') ?? '')
      .split(',')
      .filter((id): id is CrimeCategory => CRIME_CATEGORIES.some((category) => category.id === id)),
  );
  readonly limit = linkedSignal({ source: this.params, computation: () => 20 });
  readonly hasFilters = computed(
    () =>
      !!(
        this.search() ||
        this.season() !== 'all' ||
        this.collection() ||
        this.selectedCategories().length ||
        this.selectedTags().length || this.country() || this.contentType() !== 'all' ||
        this.sort() !== 'newest'
      ),
  );
  readonly addPage = (n: number): number => n + 20;
  readonly filtered = computed(() => {
    const curated = this.podcast.collections().find((c) => c.id === this.collection());
    return this.collectionEpisodes()
      .filter(
        (e) =>
          matchesSearch(this.search(), e.title, e.description, ...(e.tags ?? [])) &&
          this.selectedTags().every(tag => e.tags?.includes(tag)) &&
          (!this.country() || e.countries?.includes(this.country())) &&
          (this.season() === 'all' ||
            (this.season() === 'none' ? e.season === null : String(e.season) === this.season())) &&
          (this.collection() !== 'long' || e.duration >= 3600) &&
          (!curated || curated.episodeIds.includes(e.id)),
      )
      .filter(
        (e) =>
          !this.selectedCategories().length ||
          this.selectedCategories().some((category) => e.categories.includes(category)),
      )
      .sort(
        (a, b) =>
          (this.sort() === 'oldest' ? 1 : -1) * (Date.parse(a.publishedAt) - Date.parse(b.publishedAt)) ||
          a.id.localeCompare(b.id),
      );
  });
  readonly visible = computed(() => this.filtered().slice(0, this.limit()));
  toggleCategory(category: CrimeCategory): void {
    const selected = this.selectedCategories();
    this.setFilter(
      'category',
      (selected.includes(category) ? selected.filter((id) => id !== category) : [...selected, category]).join(
        ',',
      ),
    );
  }
  categoryCount(category: CrimeCategory): number {
    return this.collectionEpisodes().filter((episode) => episode.categories.includes(category)).length;
  }
  setFilter(key: string, value: string): void {
    this.limit.set(20);
    const changes: Record<string, string | null> = { [key]: value || null };
    if (key === 'view' && this.podcast.episodes().length) {
      const destination = this.episodesFor(value || 'all');
      if (!this.validSeason(this.params().get('season') ?? 'all', destination)) changes['season'] = null;
    }
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: changes,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
  private validSeason(value: string, episodes: ReturnType<PodcastService['episodes']>): boolean {
    return value === 'all' || episodes.some(e => value === 'none' ? e.season === null : e.season !== null && String(e.season) === value);
  }
  constructor() {
    effect(() => {
      // Do not discard deep-link selections while the first catalog is still loading.
      if (!this.podcast.episodes().length) return;
      const requested = this.params().get('season');
      if (requested && !this.validSeason(requested, this.collectionEpisodes())) {
        void this.router.navigate([], {relativeTo: this.route, queryParams: {season: null}, queryParamsHandling: 'merge', replaceUrl: true});
      }
    });
  }
  clear(searchField?: HTMLInputElement): void {
    this.limit.set(20);
    void this.router.navigate([], { relativeTo: this.route, queryParams: {} });
    searchField?.focus();
  }
}
