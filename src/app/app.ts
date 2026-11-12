import { TranslocoDirective } from '@jsverse/transloco';
import { Component, DestroyRef, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IconComponent } from './shared/icon';
import { TimePipe } from './shared/format';
import { AudioPlayerService } from './core/audio-player.service';
import { LibraryService } from './core/library.service';
import { PodcastService } from './core/podcast.service';
import { I18nService, MockAuthService, ThemeService } from './core/preferences.service';
@Component({
  selector: 'app-root',
  imports: [TranslocoDirective, RouterOutlet, RouterLink, RouterLinkActive, IconComponent, TimePipe],
  template: `<ng-container *transloco="let t">
    <a
      [routerLink]="[]"
      queryParamsHandling="preserve"
      fragment="main-content"
      (click)="mainContent.focus()"
      class="skip-link"
      >{{ t('shell.skipToContent') }}</a
    >
    <aside class="sidebar">
      <a routerLink="/" class="brand" [attr.aria-label]="t('shell.dumbAndDahmerHome')"
        ><span class="brand-mark">d<span>&</span>d<span class="brand-dot">.</span></span
        ><span class="brand-caption">DUMB AND DAHMER<br /><small>THE PODCAST</small></span></a
      >
      <div class="sidebar-rule"></div>
      <p class="nav-caption">{{ t('shell.yourOwnFrequency') }}</p>
      <nav [attr.aria-label]="t('shell.mainNavigation')">
        @for (item of navigation; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.path === '/' }"
            ariaCurrentWhenActive="page"
            ><dd-icon [name]="item.icon" /><span>{{ i18n.nav()[item.key] }}</span>
            @if (item.key === 'extras') {
              <span class="nav-dot"></span>
            }
          </a>
        }
      </nav>
      <a routerLink="/plus" class="sidebar-plus"
        ><span class="eyebrow">{{ t('shell.aLittleDarker') }}</span
        ><strong>Dumb & Dahmer <i>+</i></strong>
        <p>{{ t('shell.forThoseWhoWant') }}<br />{{ t('shell.aLittleMore') }}</p>
        <span class="text-button">{{ t('shell.discoverPlus') }} <dd-icon name="arrow" /></span
      ></a>
      <div class="sidebar-bottom">
        <span class="on-air-dot"></span> MADE FOR YOUR DARK SIDE.<a
          href="https://www.instagram.com/dumbanddahmer_podcast"
          target="_blank"
          rel="noopener noreferrer"
          >Instagram <dd-icon name="external"
        /></a>
      </div>
    </aside>
    <div class="app-content" [class.has-player]="player.current()">
      <header class="topbar">
        <a routerLink="/" class="mobile-brand">d&d.</a
        ><span class="topbar-note"
          ><span class="on-air-dot"></span> {{ t('shell.trueCrimeDarkHumorAndALittleTea') }}</span
        >
        <div class="flex items-center gap-4">
          <button
            class="language-toggle"
            (click)="i18n.set(i18n.language() === 'el' ? 'en' : 'el')"
            [attr.aria-label]="
              t(i18n.language() === 'el' ? 'common.switchToEnglish' : 'common.switchToGreek')
            "
          >
            {{ i18n.language() === 'el' ? 'EN' : 'EL' }}
          </button>
          <a routerLink="/episodes" class="icon-button" [attr.aria-label]="t('shell.searchEpisodes')"
            ><dd-icon name="search" /></a
          ><a routerLink="/profile" class="profile-link"
            ><span class="avatar small-avatar">{{ auth.guest() ? t('shell.g') : t('shell.n') }}</span
            ><span>{{ auth.guest() ? t('shell.guest') : 'Demo account' }}</span
            ><dd-icon name="down"
          /></a>
        </div>
      </header>
      <main #mainContent id="main-content" tabindex="-1"><router-outlet /></main>
      <footer class="site-footer">
        <a routerLink="/" class="footer-brand">dumb & dahmer.</a
        ><span
          >{{ t('shell.withElenaAndEirinella') }}
          <span class="muted">{{ t('shell.andTheCookies') }}</span></span
        ><a href="https://dumbanddahmer.buzzsprout.com/" target="_blank" rel="noopener noreferrer"
          >{{ t('shell.theOfficialPodcast') }} <dd-icon name="external"
        /></a>
      </footer>
    </div>
    @if (library.repository.error()) {
      <div class="storage-notice" role="status">{{ t(library.repository.error()) }}</div>
    }
    @if (player.current(); as episode) {
      <section class="mini-player" [attr.aria-label]="t('shell.miniPlayer')">
        <div
          class="mini-progress"
          [style.width.%]="player.duration() ? (player.position() / player.duration()) * 100 : 0"
        ></div>
        <a class="mini-episode" routerLink="/player"
          ><img [src]="podcast.image(episode)" alt="" />
          <div>
            <span class="eyebrow">{{
              player.busy()
                ? t('shell.loading')
                : player.error()
                  ? t('shell.tryAgain')
                  : t('shell.nowPlaying')
            }}</span
            ><strong>{{ episode.title }}</strong>
          </div></a
        >
        <div class="mini-center">
          <div class="mini-controls">
            <button
              class="icon-button"
              (click)="player.previous()"
              [attr.aria-label]="t('shell.previousEpisode')"
            >
              <dd-icon name="previous" /></button
            ><button
              class="icon-button skip-control"
              (click)="player.skip(-15)"
              [attr.aria-label]="t('shell.skipBack15Seconds')"
            >
              <dd-icon name="back" /><small>15</small></button
            ><button
              class="play-button"
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
          <div class="mini-seek">
            <span>{{ player.position() | time }}</span
            ><input
              type="range"
              min="0"
              [max]="player.duration() || 1"
              [value]="player.position()"
              (input)="player.seek(+$any($event.target).value)"
              [attr.aria-label]="t('shell.playbackPosition')"
            /><span>{{ player.duration() | time }}</span>
          </div>
        </div>
        <div class="mini-tools">
          <button
            class="icon-button"
            (click)="library.toggleFavorite(episode.id)"
            [attr.aria-pressed]="library.isFavorite(episode.id)"
            [class.selected]="library.isFavorite(episode.id)"
            [attr.aria-label]="t('shell.favorite')"
          >
            <dd-icon name="heart" /></button
          ><a
            routerLink="/library"
            [queryParams]="{ tab: 'queue' }"
            class="icon-button"
            [attr.aria-label]="t('shell.listeningQueue')"
            ><dd-icon name="queue" /></a
          ><a routerLink="/player" class="icon-button" [attr.aria-label]="t('shell.openFullPlayer')"
            ><dd-icon name="chevron"
          /></a>
        </div>
        <button
          class="play-button mobile-play"
          (click)="player.toggle()"
          [attr.aria-label]="player.playing() ? t('shell.pause') : t('shell.play')"
        >
          <dd-icon [name]="player.playing() || player.busy() ? 'pause' : 'play'" />
        </button>
      </section>
    }
    <nav class="bottom-nav" [attr.aria-label]="t('shell.mobileNavigation')">
      @for (item of navigation; track item.path) {
        <a
          [routerLink]="item.path"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: item.path === '/' }"
          ariaCurrentWhenActive="page"
          ><dd-icon [name]="item.icon" /><span>{{ i18n.nav()[item.key] }}</span></a
        >
      }
    </nav>
  </ng-container>`,
})
export class AppComponent {
  constructor() {
    const router = inject(Router);
    let previousPath = router.url.split(/[?#]/, 1)[0];
    let focusTimeout: number | undefined;
    inject(DestroyRef).onDestroy(() => window.clearTimeout(focusTimeout));
    router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        window.clearTimeout(focusTimeout);
        const path = event.urlAfterRedirects.split(/[?#]/, 1)[0];
        // Filters, tabs and fragments must retain the user's current keyboard focus.
        if (path === previousPath) return;
        previousPath = path;
        focusTimeout = window.setTimeout(
          () => document.getElementById('main-content')?.focus({ preventScroll: true }),
          0,
        );
      });
  }
  readonly theme = inject(ThemeService);
  readonly auth = inject(MockAuthService);
  readonly i18n = inject(I18nService);
  readonly player = inject(AudioPlayerService);
  readonly podcast = inject(PodcastService);
  readonly library = inject(LibraryService);
  readonly navigation = [
    { path: '/', key: 'home', icon: 'home' },
    { path: '/episodes', key: 'episodes', icon: 'headphones' },
    { path: '/library', key: 'library', icon: 'library' },
    { path: '/extras', key: 'extras', icon: 'spark' },
    { path: '/profile', key: 'profile', icon: 'user' },
  ] as const;
}
