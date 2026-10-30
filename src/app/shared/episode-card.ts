import { TranslocoDirective } from '@jsverse/transloco';
import { Component, computed, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PodcastService } from '../core/podcast.service';
import { LibraryService } from '../core/library.service';
import { AudioPlayerService } from '../core/audio-player.service';
import { IconComponent } from './icon';
import { MinutesPipe } from './format';
import type { Episode } from '../core/models';
@Component({
  selector: 'dd-episode-card',
  imports: [TranslocoDirective, DatePipe, RouterLink, IconComponent, MinutesPipe],
  template: `<ng-container *transloco="let t"> <article class="episode-card" [class.row-card]="layout() === 'row'">
    <a class="episode-art" [routerLink]="['/episodes', episode().id]" [attr.aria-label]="episode().title">
      <img [src]="podcast.image(episode())" alt="" loading="lazy" /><span class="art-number">{{
        episode().episodeNumber
          ? '#' + episode().episodeNumber
          : episode().episodeType === 'bonus'
            ? 'BONUS'
            : 'D&D'
      }}</span>
      @if (episode().contentKind === 'promotional-preview') {
        <span class="preview-badge">{{ t('episodes.plusPublicPreview') }}</span>
      }
      @if (record()?.completed) {
        <span class="completed-badge"><dd-icon name="check" /> {{ t('common.listened') }}</span>
      }
    </a>
    <div class="episode-copy">
      <div class="eyebrow">
        {{ episode().publishedAt | date: 'dd.MM.yyyy' }} <span>·</span> {{ episode().duration | minutes }}
        @if (episode().episodeType === 'trailer') {
          <span>· TRAILER</span>
        }
      </div>
      <a class="episode-title" [routerLink]="['/episodes', episode().id]">{{ episode().title }}</a>
      <p class="episode-excerpt">{{ episode().description }}</p>
      <div class="episode-actions">
        <button
          class="text-button play-link"
          (click)="player.play(episode())"
          [attr.aria-label]="(isPlaying() ? t('common.pause') : t('common.play')) + episode().title"
        >
          <dd-icon [name]="isPlaying() ? 'pause' : 'play'" />
          {{ isPlaying() ? t('common.playingNow') : record() && !record()?.completed ? t('common.continue') : t('common.listen') }}
        </button>
        <div class="flex items-center gap-2">
          <button
            class="icon-button small"
            (click)="library.enqueue(episode().id)"
            [attr.aria-label]="t('common.queue') + episode().title"
            [class.selected]="library.state().queue.includes(episode().id)"
          >
            <dd-icon name="queue" /></button
          ><button
            class="icon-button small"
            (click)="library.toggleFavorite(episode().id)"
            [attr.aria-pressed]="library.isFavorite(episode().id)"
            [attr.aria-label]="t('common.favorite') + episode().title"
            [class.selected]="library.isFavorite(episode().id)"
          >
            <dd-icon name="heart" />
          </button>
        </div>
      </div>
      @if (record() && !record()?.completed) {
        <div class="listening-progress" [attr.aria-label]="t('common.listeningProgress') + progress() + '%'" role="img">
          <span [style.width.%]="progress()"></span>
        </div>
      }
    </div>
  </article></ng-container>`,
})
export class EpisodeCardComponent {
  readonly episode = input.required<Episode>();
  readonly layout = input<'card' | 'row'>('card');
  readonly podcast = inject(PodcastService);
  readonly library = inject(LibraryService);
  readonly player = inject(AudioPlayerService);
  readonly record = computed(() => this.library.record(this.episode().id));
  readonly progress = computed(() =>
    Math.min(
      100,
      Math.round(
        ((this.record()?.position ?? 0) / (this.record()?.duration || this.episode().duration || 1)) * 100,
      ),
    ),
  );
  readonly isPlaying = computed(
    () => this.player.current()?.id === this.episode().id && this.player.playing(),
  );
}
