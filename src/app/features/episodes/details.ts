import { TranslocoDirective } from '@jsverse/transloco';
import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PodcastService } from '../../core/podcast.service';
import { AudioPlayerService } from '../../core/audio-player.service';
import { LibraryService } from '../../core/library.service';
import { IconComponent } from '../../shared/icon';
import { MinutesPipe } from '../../shared/format';
import { EmptyStateComponent } from '../../shared/empty-state';
@Component({
  imports: [TranslocoDirective, RouterLink, DatePipe, IconComponent, MinutesPipe, EmptyStateComponent],
  template: `<ng-container *transloco="let t"
    ><div class="page">
      <a routerLink="/episodes" class="back-link">{{ t('episodes.backToTheArchive') }}</a>
      @if (episode(); as episode) {
        <section class="episode-detail">
          <img class="detail-art" [src]="podcast.image(episode)" [alt]="t('episodes.episodeArtwork')" />
          <div>
            <p class="eyebrow accent">
              {{
                episode.contentKind === 'promotional-preview'
                  ? t('episodes.plusPublicPreview')
                  : 'PUBLIC EPISODE'
              }}
              @if (episode.season) {
                {{ t('episodes.season') }} {{ episode.season }}
              }
              @if (episode.episodeNumber) {
                · #{{ episode.episodeNumber }}
              }
            </p>
            <h1>{{ episode.title }}</h1>
            <p class="detail-meta">
              {{ episode.publishedAt | date: 'dd.MM.yyyy' }} <span>·</span> {{ episode.duration | minutes }}
              @if (episode.explicit) {
                <span class="tag">EXPLICIT</span>
              }
              @if (episode.episodeType !== 'full') {
                <span class="tag">{{ episode.episodeType.toUpperCase() }}</span>
              }
            </p>
            <div class="flex flex-wrap gap-3">
              <button class="button primary" (click)="player.play(episode)">
                <dd-icon
                  [name]="player.current()?.id === episode.id && player.playing() ? 'pause' : 'play'"
                />
                {{
                  player.current()?.id === episode.id && player.playing()
                    ? t('shell.pause')
                    : t('episodes.listenToTheEpisode')
                }}</button
              ><button
                class="circle-button"
                (click)="library.toggleFavorite(episode.id)"
                [class.selected]="library.isFavorite(episode.id)"
                [attr.aria-pressed]="library.isFavorite(episode.id)"
                [attr.aria-label]="t('shell.favorite')"
              >
                <dd-icon name="heart" /></button
              ><button
                class="circle-button"
                (click)="library.enqueue(episode.id)"
                [class.selected]="library.state().queue.includes(episode.id)"
                [attr.aria-label]="t('episodes.addToQueue')"
              >
                <dd-icon name="queue" />
              </button>
            </div>
          </div>
        </section>
        <section class="detail-description">
          @if (episode.contentKind === 'promotional-preview') {
            <div class="notice preview-info">
              <dd-icon name="lock" />
              <p>
                {{ t('episodes.thisIsAPublicPlusPromotionalClipThe') }}
              </p>
              <a routerLink="/plus" class="text-button"
                >{{ t('episodes.aboutPlus') }} <dd-icon name="arrow"
              /></a>
            </div>
          }
          <p class="eyebrow">{{ t('episodes.episodeNotes') }}</p>
          <h2>{{ t('episodes.theCaseFile') }}</h2>
          <p class="preserve-lines">{{ episode.description }}</p>
          @if (episode.link) {
            <a [href]="episode.link" target="_blank" rel="noopener noreferrer" class="text-button"
              >{{ t('episodes.thisEpisodeOnBuzzsprout') }} <dd-icon name="external"
            /></a>
          }
        </section>
      } @else if (!podcast.loading()) {
        <dd-empty
          title="episodes.theCaseFileWasNotFound"
          description="episodes.thisEpisodeMayHaveBeenRemovedFromThe"
          link="/episodes"
        />
      }</div
  ></ng-container>`,
})
export class EpisodeDetailsComponent {
  readonly podcast = inject(PodcastService);
  readonly player = inject(AudioPlayerService);
  readonly library = inject(LibraryService);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  readonly episode = computed(() => this.podcast.find(this.params().get('id') ?? ''));
}
