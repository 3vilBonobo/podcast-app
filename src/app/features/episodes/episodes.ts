import { TranslocoDirective } from '@jsverse/transloco';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PodcastService } from '../../core/podcast.service';
import { EpisodeCardComponent } from '../../shared/episode-card';
import { EmptyStateComponent } from '../../shared/empty-state';
import { IconComponent } from '../../shared/icon';
import { CRIME_CATEGORIES } from '../../core/categories';
import type { CrimeCategory } from '../../core/models';
@Component({
  imports: [TranslocoDirective, EpisodeCardComponent, EmptyStateComponent, IconComponent],
  template: `<ng-container *transloco="let t"
    ><div class="page">
      <div class="page-intro">
        <div>
          <p class="eyebrow accent">{{ t('episodes.everyCaseHasItsPlace') }}</p>
          <h1>{{ t('episodes.theArchive') }}<span class="accent">.</span></h1>
          <p class="intro-description">
            {{ podcast.episodes().length }} {{ t('episodes.publicEpisodesWhereWillTheNextStoryFind') }}
          </p>
        </div>
        <span class="issue-note">OPEN THE CASE FILE<br /><strong>PUBLIC RSS ARCHIVE</strong></span>
      </div>
      <div class="catalog-toolbar">
        <div class="search-field">
          <dd-icon name="search" /><input
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
            @for (season of podcast.seasons(); track season) {
              <option [value]="season" [selected]="season.toString() === this.season()">
                {{ t('episodes.season105') }} {{ season }}
              </option>
            }
            <option value="none">{{ t('episodes.noSeasonListed') }}</option>
          </select></label
        ><label class="select-label"
          >{{ t('episodes.sortBy')
          }}<select [value]="sort()" (change)="setFilter('sort', $any($event.target).value)">
            <option value="newest">{{ t('episodes.newestFirst') }}</option>
            <option value="oldest">{{ t('episodes.oldestFirst') }}</option>
          </select></label
        >
      </div>
      <section class="category-section" [attr.aria-label]="t('episodes.crimeCategories')">
        <div class="category-topline">
          <p class="eyebrow">{{ t('episodes.chooseYourCase') }}</p>
          <small>{{ t('episodes.applicationTagsYouCanChooseMoreThanOne') }}</small>
        </div>
        <div class="category-chips">
          <button
            class="category-chip"
            [class.active]="!selectedCategories().length"
            [attr.aria-pressed]="!selectedCategories().length"
            (click)="setFilter('category', '')"
          >
            <dd-icon name="folder" />{{ t('episodes.allCases') }}
            <small>{{ podcast.episodes().length }}</small>
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
        </div>
      </section>
      <div class="results-line">
        <span
          >{{ filtered().length }} {{ t('episodes.episodes') }}
          @if (collection() === 'long') {
            {{ t('episodes.overAnHour') }}
          }
        </span>
        @if (search() || season() !== 'all' || collection() || selectedCategories().length) {
          <button class="text-button" (click)="clear()">
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
      } @else if (podcast.error()) {
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
  readonly categories = CRIME_CATEGORIES;
  readonly podcast = inject(PodcastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  readonly search = computed(() => this.params().get('q') ?? '');
  readonly season = computed(() => this.params().get('season') ?? 'all');
  readonly sort = computed(() => this.params().get('sort') ?? 'newest');
  readonly collection = computed(() => this.params().get('collection'));
  readonly selectedCategories = computed(() =>
    (this.params().get('category') ?? '')
      .split(',')
      .filter((id): id is CrimeCategory => CRIME_CATEGORIES.some((category) => category.id === id)),
  );
  readonly limit = signal(20);
  readonly addPage = (n: number): number => n + 20;
  readonly filtered = computed(() => {
    const q = this.search().trim().toLocaleLowerCase('el');
    return this.podcast
      .episodes()
      .filter(
        (e) =>
          (!q || `${e.title} ${e.description}`.toLocaleLowerCase('el').includes(q)) &&
          (this.season() === 'all' ||
            (this.season() === 'none' ? e.season === null : String(e.season) === this.season())) &&
          (this.collection() !== 'long' || e.duration >= 3600),
      )
      .filter(
        (e) =>
          !this.selectedCategories().length ||
          this.selectedCategories().some((category) => e.categories.includes(category)),
      )
      .sort((a, b) =>
        this.sort() === 'oldest'
          ? a.publishedAt.localeCompare(b.publishedAt)
          : b.publishedAt.localeCompare(a.publishedAt),
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
    return this.podcast.episodes().filter((episode) => episode.categories.includes(category)).length;
  }
  setFilter(key: string, value: string): void {
    this.limit.set(20);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [key]: value || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
  clear(): void {
    this.limit.set(20);
    void this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }
}
