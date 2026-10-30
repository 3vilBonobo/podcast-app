import { TranslocoDirective } from '@jsverse/transloco';
import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PodcastService } from '../../core/podcast.service';
import { AudioPlayerService } from '../../core/audio-player.service';
import { LibraryService } from '../../core/library.service';
import { EpisodeCardComponent } from '../../shared/episode-card';
import { IconComponent } from '../../shared/icon';
import { MinutesPipe } from '../../shared/format';
@Component({
  imports: [TranslocoDirective, RouterLink, DatePipe, EpisodeCardComponent, IconComponent, MinutesPipe],
  template: `<ng-container *transloco="let t"> <div class="page home-page">
    <div class="page-intro">
      <div>
        <p class="eyebrow accent">{{ t('home.welcomeToTheDarkSide') }}</p>
        <h1>{{ t('home.comeForTea') }}<span class="accent">.</span></h1>
        <p class="intro-description">{{ t('home.trueCrimeDarkStoriesAbsolutelyNoFilter') }}</p>
      </div>
      <span class="issue-note">THE LISTENING ROOM<br /><strong>{{ t('home.withElenaEirinella') }}</strong></span>
    </div>
    @if (podcast.loading()) {
      <div class="hero-skeleton skeleton" [attr.aria-label]="t('home.loadingEpisodes')" role="status"></div>
    }
    @if (podcast.error()) {
      <div class="notice" role="alert">
        <p>{{ t(podcast.error()) }}</p>
        <button class="button secondary" (click)="podcast.load()">{{ t('home.tryAgain') }}</button>
      </div>
    }
    @if (podcast.latest(); as latest) {
      <section class="hero">
        <div class="hero-copy">
          <div class="eyebrow">
            <span class="on-air-dot"></span> {{ t('home.latestEpisode') }}
            <span class="hero-index">{{
              latest.episodeNumber ? 'NO. ' + latest.episodeNumber : latest.episodeType.toUpperCase()
            }}</span>
          </div>
          <h2>
            <a [routerLink]="['/episodes', latest.id]">{{ latest.title }}</a>
          </h2>
          <p class="hero-description">{{ latest.description }}</p>
          <div class="hero-meta">
            {{ latest.publishedAt | date: 'dd.MM.yyyy' }} <span>—</span> {{ latest.duration | minutes }}
            <span>—</span>
            <span>{{
              latest.contentKind === 'promotional-preview' ? t('episodes.plusPublicPreview') : 'PUBLIC EPISODE'
            }}</span>
          </div>
          <div class="hero-actions">
            <button class="button primary" (click)="player.play(latest)">
              <dd-icon [name]="player.current()?.id === latest.id && player.playing() ? 'pause' : 'play'" />
              {{
                player.current()?.id === latest.id && player.playing() ? t('shell.pause') : t('home.letSListen')
              }}</button
            ><button
              class="circle-button"
              (click)="library.toggleFavorite(latest.id)"
              [class.selected]="library.isFavorite(latest.id)"
              [attr.aria-pressed]="library.isFavorite(latest.id)"
              [attr.aria-label]="t('home.saveToFavorites')"
            >
              <dd-icon name="heart" />
            </button>
          </div>
        </div>
        <a
          [routerLink]="['/episodes', latest.id]"
          class="hero-art"
          [attr.aria-label]="t('home.latestEpisodeDetails')"
          ><span class="art-corner top-left"></span><span class="art-corner bottom-right"></span
          ><img [src]="podcast.artwork()" [alt]="t('home.theOfficialDumbAndDahmerPodcastArtwork')" /><span
            class="art-stamp"
            >DARK STORIES.<br />GOOD COMPANY.</span
          ></a
        ><span class="hero-bottom-label">{{ t('home.weListenTogetherWeJudgeTogether') }}</span>
      </section>
    }
    <div class="editorial-strip">
      <span>TRUE CRIME</span><span class="strip-star">✳</span><span>DARK HUMOR</span
      ><span class="strip-star">✳</span><span>GREEK PODCAST</span><span class="strip-star">✳</span
      ><span>BAD IDEAS, GOOD TEA</span><span class="strip-star">✳</span><span>ELENA & EIRINELLA</span>
    </div>
    <section class="content-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">{{ t('home.freshFromTheMicrophone') }}</p>
          <h2>{{ t('home.theLatestStories') }}</h2>
        </div>
        <a routerLink="/episodes" class="text-button">{{ t('home.allEpisodes') }} <dd-icon name="arrow" /></a>
      </div>
      <div class="episode-grid">
        @for (episode of podcast.episodes().slice(0, 4); track episode.id) {
          <dd-episode-card [episode]="episode" />
        }
      </div>
    </section>
    @if (continueListening().length) {
      <section class="content-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">{{ t('home.weLeftAStoryUnfinished') }}</p>
            <h2>{{ t('home.whereWeLeftOff') }}</h2>
          </div>
          <a routerLink="/library" [queryParams]="{ tab: 'continue' }" class="text-button"
            >{{ t('home.yourLibrary') }} <dd-icon name="arrow"
          /></a>
        </div>
        <div class="episode-grid two-cols">
          @for (episode of continueListening().slice(0, 2); track episode.id) {
            <dd-episode-card [episode]="episode" layout="row" />
          }
        </div>
      </section>
    }
    <section class="content-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">{{ t('home.openTheArchive') }}</p>
          <h2>{{ t('home.everySeasonAnotherStory') }}</h2>
        </div>
        <span class="tiny-label">{{ podcast.episodes().length }} {{ t('home.publicEpisodes') }}</span>
      </div>
      <div class="season-grid">
        @for (season of podcast.seasons().slice(0, 3); track season) {
          <a routerLink="/episodes" [queryParams]="{ season: season }" class="season-card"
            ><div class="eyebrow">{{ t('home.theArchive') }} <dd-icon name="arrow" /></div>
            <span class="season-number">{{ season.toString().padStart(2, '0') }}</span>
            <div>
              <strong>{{ t('episodes.season105') }} {{ season }}</strong
              ><span
                >{{ seasonCount(season) }} {{ seasonCount(season) === 1 ? t('home.episode') : t('home.episodes') }}</span
              >
            </div></a
          >
        }
        <a routerLink="/episodes" [queryParams]="{ season: 'all' }" class="season-card archive-season"
          ><div class="eyebrow">{{ t('home.noTimeLimit') }} <dd-icon name="arrow" /></div>
          <dd-icon name="folder" />
          <div><strong>{{ t('home.theEntireArchive') }}</strong><span>{{ t('home.fromTheBeginningIfYouDare') }}</span></div></a
        >
      </div>
    </section>
    <section class="content-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">{{ t('home.chooseYourMood') }}</p>
          <h2>{{ t('home.smallCollectionsLongNights') }}</h2>
        </div>
        <span class="tiny-label">{{ t('home.applicationCollections') }}</span>
      </div>
      <div class="collection-grid">
        <a routerLink="/episodes" [queryParams]="{ sort: 'oldest' }" class="collection-card"
          ><span class="collection-art"><span>01</span><dd-icon name="headphones" /></span>
          <div>
            <span class="eyebrow">{{ t('home.fromTheBeginning') }}</span>
            <h3>{{ t('home.yourFirstCase') }}</h3>
            <p>{{ t('home.thePublicArchiveInChronologicalOrder') }}</p>
          </div>
          <dd-icon name="arrow" /></a
        ><a routerLink="/episodes" [queryParams]="{ collection: 'long' }" class="collection-card"
          ><span class="collection-art moon-art"><dd-icon name="moon" /></span>
          <div>
            <span class="eyebrow">{{ t('home.forTheLongNights') }}</span>
            <h3>{{ t('home.oneMoreHour') }}</h3>
            <p>{{ t('home.episodesWithAPublicDurationOfOverAn') }}</p>
          </div>
          <dd-icon name="arrow"
        /></a>
      </div>
    </section>
    <section class="extras-teaser">
      <div>
        <p class="eyebrow accent">{{ t('extras.offTheRecord') }}</p>
        <h2>{{ t('home.somethingIsStirring') }}<br />{{ t('home.behindTheScenes') }}<span class="accent">.</span></h2>
        <p>{{ t('home.littleMysteriesLockedDrawersAndThingsInThe') }}</p>
        <a routerLink="/extras" class="text-button">{{ t('home.enterExtras') }} <dd-icon name="arrow" /></a>
      </div>
      <a routerLink="/extras/waking-machine" class="machine-preview"
        ><span class="eyebrow">EXPERIENCE 001 · COMING SOON</span>
        <div class="machine-orbit">
          <span class="orbit-ring"></span><span class="orbit-ring inner"></span><dd-icon name="eye" />
        </div>
        <strong>THE WAKING MACHINE</strong
        ><span>{{ t('home.someStoriesNeverSleep') }} <dd-icon name="arrow" /></span
      ></a>
    </section>
    <a routerLink="/plus" class="plus-banner"
      ><div>
        <span class="eyebrow">{{ t('home.forTheMoreInitiated') }}</span>
        <h2>{{ t('home.theStoryContinuesOn') }} <em>Plus.</em></h2>
        <p>{{ t('home.learnAboutSubscribingOnTheOfficialBuzzsproutPage') }}</p>
      </div>
      <span class="button secondary">{{ t('shell.discoverPlus') }} <dd-icon name="arrow" /></span
    ></a>
  </div></ng-container>`,
})
export class HomeComponent {
  readonly podcast = inject(PodcastService);
  readonly player = inject(AudioPlayerService);
  readonly library = inject(LibraryService);
  readonly continueListening = computed(() =>
    this.library
      .records()
      .filter((r) => r.position > 0 && !r.completed)
      .map((r) => this.podcast.find(r.episodeId))
      .filter((e) => e !== undefined),
  );
  seasonCount(season: number): number {
    return this.podcast.episodes().filter((e) => e.season === season).length;
  }
}
