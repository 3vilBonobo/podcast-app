import { TranslocoDirective } from '@jsverse/transloco';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AudioPlayerService } from '../../core/audio-player.service';
import { PodcastService } from '../../core/podcast.service';
import { LibraryService } from '../../core/library.service';
import { IconComponent } from '../../shared/icon';
import { TimePipe } from '../../shared/format';
import { EmptyStateComponent } from '../../shared/empty-state';
@Component({
  imports: [TranslocoDirective, RouterLink, IconComponent, TimePipe, EmptyStateComponent],
  template: `<ng-container *transloco="let t"><div class="page player-page">
    @if (player.current(); as episode) {
      <div class="full-player">
        <div class="player-topline">
          <a routerLink="/episodes" class="icon-button" [attr.aria-label]="t('player.backToEpisodes')"
            ><dd-icon name="down"
          /></a>
          <div>
            <span class="eyebrow">THE LISTENING ROOM</span>
            <p>
              {{ player.busy() ? t('player.loadingAudio') : player.playing() ? t('player.nowPlaying') : t('player.aLittlePause') }}
            </p>
          </div>
          <a
            routerLink="/library"
            [queryParams]="{ tab: 'queue' }"
            class="icon-button"
            [attr.aria-label]="t('shell.listeningQueue')"
            ><dd-icon name="queue"
          /></a>
        </div>
        <div class="player-art"><img [src]="podcast.image(episode)" [alt]="t('episodes.episodeArtwork')" /></div>
        <div class="player-title">
          <div>
            <p class="eyebrow accent">
              {{
                episode.contentKind === 'promotional-preview' ? t('episodes.plusPublicPreview') : 'PUBLIC EPISODE'
              }}
              @if (episode.season) {
                {{ t('episodes.season') }} {{ episode.season }}
              }
            </p>
            <a [routerLink]="['/episodes', episode.id]"
              ><h1>{{ episode.title }}</h1></a
            >
            <p>{{ t('player.elenaEirinellaDumbAndDahmer') }}</p>
          </div>
          <button
            class="icon-button"
            (click)="library.toggleFavorite(episode.id)"
            [class.selected]="library.isFavorite(episode.id)"
            [attr.aria-pressed]="library.isFavorite(episode.id)"
            [attr.aria-label]="t('shell.favorite')"
          >
            <dd-icon name="heart" />
          </button>
        </div>
        @if (player.error()) {
          <div class="notice" role="alert">
            {{ t(player.error()) }}<button class="text-button" (click)="player.resume()">{{ t('home.tryAgain') }}</button>
          </div>
        }
        <label class="seek-label"
          ><span class="sr-only">{{ t('shell.playbackPosition') }}</span
          ><input
            class="full-seek"
            type="range"
            min="0"
            [max]="player.duration() || 1"
            [value]="player.position()"
            (input)="player.seek(+$any($event.target).value)"
        /></label>
        <div class="player-times">
          <span>{{ player.position() | time }}</span
          ><span>−{{ player.remaining() | time }}</span>
        </div>
        <div class="full-controls">
          <button class="icon-button" (click)="player.previous()" [attr.aria-label]="t('shell.previousEpisode')">
            <dd-icon name="previous" /></button
          ><button
            class="icon-button skip-control"
            (click)="player.skip(-15)"
            [attr.aria-label]="t('shell.skipBack15Seconds')"
          >
            <dd-icon name="back" /><small>15</small></button
          ><button
            class="play-button large-play"
            [class.is-buffering]="player.busy()"
            (click)="player.toggle()"
            [attr.aria-label]="player.playing() || player.busy() ? t('shell.pause') : t('shell.play')"
          >
            <dd-icon [name]="player.playing() || player.busy() ? 'pause' : 'play'" /></button
          ><button
            class="icon-button skip-control"
            (click)="player.skip(30)"
            [attr.aria-label]="t('shell.skipForward30Seconds')"
          >
            <dd-icon name="forward" /><small>30</small></button
          ><button class="icon-button" (click)="player.next()" [attr.aria-label]="t('shell.nextEpisode')">
            <dd-icon name="next" />
          </button>
        </div>
        <div class="player-options">
          <label
            ><span><dd-icon name="headphones" /> {{ t('player.speed') }}</span
            ><select
              [attr.aria-label]="t('player.playbackSpeed')"
              [value]="player.speed()"
              (change)="player.setSpeed(+$any($event.target).value)"
            >
              @for (speed of speeds; track speed) {
                <option [value]="speed" [selected]="speed === player.speed()">{{ speed }}×</option>
              }
            </select></label
          ><label
            ><span><dd-icon name="moon" /> Sleep timer</span
            ><select
              [attr.aria-label]="t('player.sleepTimer')"
              [value]="player.sleepMinutes()"
              (change)="player.setSleep(+$any($event.target).value)"
            >
              <option value="0">{{ t('player.off') }}</option>
              <option value="15">{{ t('player.15Minutes') }}</option>
              <option value="30">{{ t('player.30Minutes') }}</option>
              <option value="45">{{ t('player.45Minutes') }}</option>
              <option value="60">{{ t('player.60Minutes') }}</option>
            </select></label
          ><label class="volume-control"
            ><span><dd-icon name="volume" /> {{ t('player.volume') }}</span
            ><input
              type="range"
              min="0"
              max="1"
              step="0.05"
              [value]="player.volume()"
              (input)="player.setVolume(+$any($event.target).value)"
              [attr.aria-label]="t('player.audioVolume')"
          /></label>
        </div>
        @if (player.sleepUntil()) {
          <p class="timer-note" role="status">
            <dd-icon name="moon" /> {{ t('player.playbackWillStopIn') }} {{ player.sleepRemaining() | time
            }}<button class="text-button" (click)="player.setSleep(0)">{{ t('player.cancel') }}</button>
          </p>
        }
        <button class="text-button add-queue" (click)="library.enqueue(episode.id)">
          <dd-icon name="queue" />
          {{
            library.state().queue.includes(episode.id)
              ? t('player.addedToQueue')
              : t('player.addToListeningQueue')
          }}
        </button>
        <p class="privacy-note player-browser-note">
          {{ t('player.audioIsDeliveredByTheOfficialBuzzsproutService') }}
        </p>
      </div>
    } @else {
      <dd-empty
        title="player.whatAreWeListeningToTonight"
        description="player.chooseAStoryFromTheArchiveToStart"
        link="/episodes"
      />
    }
  </div></ng-container>`,
})
export class PlayerComponent {
  readonly player = inject(AudioPlayerService);
  readonly podcast = inject(PodcastService);
  readonly library = inject(LibraryService);
  readonly speeds = [0.75, 1, 1.25, 1.5, 1.75, 2];
}
