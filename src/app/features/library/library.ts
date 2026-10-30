import { TranslocoDirective } from '@jsverse/transloco';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LibraryService } from '../../core/library.service';
import { PodcastService } from '../../core/podcast.service';
import { EpisodeCardComponent } from '../../shared/episode-card';
import { EmptyStateComponent } from '../../shared/empty-state';
import { IconComponent } from '../../shared/icon';
@Component({
  imports: [TranslocoDirective, EpisodeCardComponent, EmptyStateComponent, IconComponent, RouterLink],
  template: `<ng-container *transloco="let t"><div class="page">
    <div class="page-intro">
      <div>
        <p class="eyebrow accent">{{ t('library.yourPersonalArchive') }}</p>
        <h1>{{ t('library.keepTheStory') }}<span class="accent">.</span></h1>
        <p class="intro-description">{{ t('library.yourFavoritesUpcomingCasesAndUnfinishedStories') }}</p>
      </div>
      <span class="local-badge"><dd-icon name="lock" /> {{ t('library.onlyOnThisDevice') }}</span>
    </div>
    <div class="tab-list" role="tablist" [attr.aria-label]="t('library.libraryCategories')">
      @for (item of tabs; track item.id) {
        <button
          role="tab"
          [id]="'tab-' + item.id"
          aria-controls="library-results"
          [attr.aria-selected]="tab() === item.id"
          [class.active]="tab() === item.id"
          (click)="select(item.id)"
          (keydown)="tabKey($event, item.id)"
        >
          {{ t(item.label) }}
          @if (item.id === 'favorites') {
            <span>{{ library.state().favorites.length }}</span>
          }
          @if (item.id === 'queue') {
            <span>{{ library.state().queue.length }}</span>
          }
        </button>
      }
    </div>
    <section id="library-results" role="tabpanel" [attr.aria-labelledby]="'tab-' + tab()">
      @if (!library.loaded() || podcast.loading()) {
        <div class="skeleton hero-skeleton" role="status" [attr.aria-label]="t('library.loadingYourLibrary')"></div>
      } @else if (!episodes().length) {
        <dd-empty
          [icon]="tab() === 'favorites' ? 'heart' : tab() === 'queue' ? 'queue' : 'headphones'"
          [title]="emptyTitle()"
          description="library.itAllStartsWithOneEpisodeNoAccount"
          link="/episodes"
        />
      } @else {
        <div class="library-list">
          @for (episode of episodes(); track episode.id) {
            <div>
              <dd-episode-card [episode]="episode" layout="row" />
              @if (tab() === 'queue') {
                <div class="queue-actions">
                  <button
                    class="text-button"
                    (click)="library.moveInQueue(episode.id, -1)"
                    [disabled]="$first"
                  >
                    {{ t('library.moveUp') }}</button
                  ><button
                    class="text-button"
                    (click)="library.moveInQueue(episode.id, 1)"
                    [disabled]="$last"
                  >
                    {{ t('library.moveDown') }}</button
                  ><button class="text-button" (click)="library.removeFromQueue(episode.id)">
                    {{ t('library.remove') }} <dd-icon name="close" />
                  </button>
                </div>
              }
            </div>
          }
        </div>
      }
    </section>
    <p class="privacy-note">
      <dd-icon name="lock" /> {{ t('library.yourLibraryIsSavedLocallyInThisBrowser') }} <a routerLink="/profile">{{ t('library.settings') }}</a>
    </p>
  </div></ng-container>`,
})
export class LibraryComponent {
  readonly library = inject(LibraryService);
  readonly podcast = inject(PodcastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly tabs = [
    { id: 'favorites', label: "library.favorites" },
    { id: 'continue', label: "library.continueListening" },
    { id: 'recent', label: "library.recentlyPlayed" },
    { id: 'completed', label: "library.completed" },
    { id: 'queue', label: "library.inTheQueue" },
  ];
  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  readonly tab = computed(() => {
    const tab = this.params().get('tab');
    return this.tabs.some((t) => t.id === tab) ? tab! : 'favorites';
  });
  readonly episodes = computed(() => {
    const state = this.library.state();
    const tab = this.tab();
    const ids =
      tab === 'favorites'
        ? state.favorites
        : tab === 'queue'
          ? state.queue
          : this.library
              .records()
              .filter((r) =>
                tab === 'completed'
                  ? r.completed
                  : tab === 'continue'
                    ? r.position > 0 && !r.completed
                    : true,
              )
              .map((r) => r.episodeId);
    return ids.map((id) => this.podcast.find(id)).filter((e) => e !== undefined);
  });
  readonly emptyTitle = computed(
    () =>
      ({
        favorites: "library.yourFavoriteStoriesBelongHere",
        continue: "library.noStoriesLeftUnfinished",
        recent: "library.yourFirstListenIsWaiting",
        completed: "library.everyEndingANewCase",
        queue: "library.whatShallWeListenToNext",
      })[this.tab()] ?? "library.theArchiveIsEmpty",
  );
  select(tab: string): void {
    void this.router.navigate([], { queryParams: { tab }, replaceUrl: true });
  }
  tabKey(event: KeyboardEvent, id: string): void {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = this.tabs.findIndex((t) => t.id === id);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? this.tabs.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + this.tabs.length) % this.tabs.length;
    this.select(this.tabs[next].id);
    document.getElementById('tab-' + this.tabs[next].id)?.focus();
  }
}
