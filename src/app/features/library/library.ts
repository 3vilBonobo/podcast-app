import { TranslocoDirective } from '@jsverse/transloco';
import { Component, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LibraryService } from '../../core/library.service';
import { PodcastService } from '../../core/podcast.service';
import { EpisodeCardComponent } from '../../shared/episode-card';
import { EmptyStateComponent } from '../../shared/empty-state';
import { IconComponent } from '../../shared/icon';
@Component({
  imports: [TranslocoDirective, EpisodeCardComponent, EmptyStateComponent, IconComponent, RouterLink],
  template: `<ng-container *transloco="let t"
    ><div class="page">
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
            [attr.tabindex]="tab() === item.id ? 0 : -1"
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
      <p class="action-feedback" role="status" aria-live="polite">{{ feedback() ? t(feedback()) : '' }}</p>
      @if (podcast.error()) {
        <p class="notice" role="alert">
          {{ t(podcast.error()) }}
          <button type="button" class="text-button" (click)="podcast.load()">
            {{ t('libraryFeedback.retryCatalog') }}
          </button>
        </p>
      }
      <section id="library-results" role="tabpanel" [attr.aria-labelledby]="'tab-' + tab()" tabindex="0">
        @if (!library.loaded() || podcast.loading()) {
          <div
            class="skeleton hero-skeleton"
            role="status"
            [attr.aria-label]="t('library.loadingYourLibrary')"
          ></div>
        } @else if (!ids().length) {
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
                      (click)="moveQueue(episode.id, -1, $event)"
                      [attr.aria-label]="t('library.moveUp') + ': ' + episode.title"
                      [disabled]="library.state().queue[0] === episode.id"
                    >
                      {{ t('library.moveUp') }}</button
                    ><button
                      class="text-button"
                      (click)="moveQueue(episode.id, 1, $event)"
                      [attr.aria-label]="t('library.moveDown') + ': ' + episode.title"
                      [disabled]="library.state().queue.at(-1) === episode.id"
                    >
                      {{ t('library.moveDown') }}</button
                    ><button
                      class="text-button"
                      [id]="'queue-remove-' + episode.id"
                      [attr.aria-label]="t('library.remove') + ': ' + episode.title"
                      (click)="removeEntry(episode.id)"
                    >
                      {{ t('library.remove') }} <dd-icon name="close" />
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }
        @if (missing().length && library.loaded() && !podcast.loading()) {
          <div class="missing-library">
            <h2>{{ t('libraryFeedback.unavailable') }}</h2>
            <p>{{ t('libraryFeedback.retained') }}</p>
            <ul>
              @for (id of missing(); track id) {
                <li>
                  <code>{{ id }}</code>
                  @if (tab() === 'queue' || tab() === 'favorites') {
                    <button
                      type="button"
                      class="text-button"
                      [id]="'queue-remove-' + id"
                      (click)="removeEntry(id)"
                    >
                      {{ t(tab() === 'queue' ? 'library.remove' : 'libraryFeedback.removeFavorite') }}
                    </button>
                  }
                </li>
              }
            </ul>
          </div>
        }
      </section>
      <p class="privacy-note">
        <dd-icon name="lock" /> {{ t('library.yourLibraryIsSavedLocallyInThisBrowser') }}
        <a routerLink="/profile">{{ t('library.settings') }}</a>
      </p>
    </div></ng-container
  >`,
})
export class LibraryComponent {
  readonly library = inject(LibraryService);
  readonly podcast = inject(PodcastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  readonly feedback = signal('');
  readonly tabs = [
    { id: 'favorites', label: 'library.favorites' },
    { id: 'continue', label: 'library.continueListening' },
    { id: 'recent', label: 'library.recentlyPlayed' },
    { id: 'completed', label: 'library.completed' },
    { id: 'queue', label: 'library.inTheQueue' },
  ];
  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  readonly tab = computed(() => {
    const tab = this.params().get('tab');
    return this.tabs.some((t) => t.id === tab) ? tab! : 'favorites';
  });
  readonly ids = computed(() => {
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
                    : r.lastPlayed > 0,
              )
              .map((r) => r.episodeId);
    return ids;
  });
  readonly episodes = computed(() =>
    this.ids()
      .map((id) => this.podcast.find(id))
      .filter((e) => e !== undefined),
  );
  readonly missing = computed(() => this.ids().filter((id) => !this.podcast.find(id)));
  readonly emptyTitle = computed(
    () =>
      ({
        favorites: 'library.yourFavoriteStoriesBelongHere',
        continue: 'library.noStoriesLeftUnfinished',
        recent: 'library.yourFirstListenIsWaiting',
        completed: 'library.everyEndingANewCase',
        queue: 'library.whatShallWeListenToNext',
      })[this.tab()] ?? 'library.theArchiveIsEmpty',
  );
  select(tab: string): void {
    this.feedback.set('');
    void this.router.navigate([], { queryParams: { tab }, replaceUrl: true });
  }
  tabKey(event: KeyboardEvent, id: string): void {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
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
  removeEntry(id: string): void {
    const ids = this.ids(),
      index = ids.indexOf(id);
    const next = ids[index + 1] ?? ids[index - 1];
    const tab = this.tab();
    if (tab === 'queue') this.library.removeFromQueue(id);
    else if (tab === 'favorites') this.library.toggleFavorite(id);
    else return;
    this.feedback.set(tab === 'queue' ? 'libraryFeedback.removed' : 'libraryFeedback.favoriteRemoved');
    afterNextRender(
      () =>
        (document.getElementById('queue-remove-' + next) ?? document.getElementById('tab-' + tab))?.focus(),
      { injector: this.injector },
    );
  }
  moveQueue(id: string, direction: -1 | 1, event: Event): void {
    const button = event.currentTarget as HTMLButtonElement;
    this.library.moveInQueue(id, direction);
    this.feedback.set('libraryFeedback.moved');
    afterNextRender(
      () => {
        if (button.isConnected && !button.disabled) button.focus();
        else document.getElementById('queue-remove-' + id)?.focus();
      },
      { injector: this.injector },
    );
  }
}
