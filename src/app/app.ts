import { Component, inject } from '@angular/core';
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
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, TimePipe],
  template: `
    <a href="#main-content" class="skip-link">Μετάβαση στο περιεχόμενο</a>
    <aside class="sidebar">
      <a routerLink="/" class="brand" aria-label="Dumb and Dahmer αρχική"
        ><span class="brand-mark">d<span>&</span>d<span class="brand-dot">.</span></span
        ><span class="brand-caption">DUMB AND DAHMER<br /><small>THE PODCAST</small></span></a
      >
      <div class="sidebar-rule"></div>
      <p class="nav-caption">Η ΔΙΚΗ ΣΟΥ ΣΥΧΝΟΤΗΤΑ</p>
      <nav aria-label="Κύρια πλοήγηση">
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
        ><span class="eyebrow">ΛΙΓΟ ΠΙΟ ΣΚΟΤΕΙΝΑ</span><strong>Dumb & Dahmer <i>+</i></strong>
        <p>Για όσους θέλουν<br />λίγο παραπάνω.</p>
        <span class="text-button">Ανακάλυψε το Plus <dd-icon name="arrow" /></span
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
          ><span class="on-air-dot"></span> TRUE CRIME. DARK HUMOR. ΚΑΙ ΛΙΓΟ ΤΣΑΪ.</span
        >
        <div class="flex items-center gap-4">
          <a routerLink="/episodes" class="icon-button" aria-label="Αναζήτηση επεισοδίων"
            ><dd-icon name="search" /></a
          ><a routerLink="/profile" class="profile-link"
            ><span class="avatar small-avatar">{{ auth.guest() ? 'Ε' : 'Ν' }}</span
            ><span>{{ auth.guest() ? 'Επισκέπτης' : 'Demo account' }}</span
            ><dd-icon name="down"
          /></a>
        </div>
      </header>
      <main id="main-content" tabindex="-1"><router-outlet /></main>
      <footer class="site-footer">
        <a routerLink="/" class="footer-brand">dumb & dahmer.</a
        ><span>Με την Έλενα και την Ειρηνέλλα. <span class="muted">Και τα κουλουράκια.</span></span
        ><a href="https://dumbanddahmer.buzzsprout.com/" target="_blank" rel="noopener noreferrer"
          >Το επίσημο podcast <dd-icon name="external"
        /></a>
      </footer>
    </div>
    @if (library.repository.error()) {
      <div class="storage-notice" role="status">{{ library.repository.error() }}</div>
    }
    @if (player.current(); as episode) {
      <section class="mini-player" aria-label="Μικρός player">
        <div
          class="mini-progress"
          [style.width.%]="player.duration() ? (player.position() / player.duration()) * 100 : 0"
        ></div>
        <a class="mini-episode" routerLink="/player"
          ><img [src]="podcast.image(episode)" alt="" />
          <div>
            <span class="eyebrow">{{
              player.busy() ? 'ΦΟΡΤΩΣΗ…' : player.error() ? 'ΔΟΚΙΜΑΣΕ ΞΑΝΑ' : 'ΤΩΡΑ ΑΚΟΥΣ'
            }}</span
            ><strong>{{ episode.title }}</strong>
          </div></a
        >
        <div class="mini-center">
          <div class="mini-controls">
            <button class="icon-button" (click)="player.previous()" aria-label="Προηγούμενο επεισόδιο">
              <dd-icon name="previous" /></button
            ><button
              class="icon-button skip-control"
              (click)="player.skip(-15)"
              aria-label="Πίσω 15 δευτερόλεπτα"
            >
              <dd-icon name="back" /><small>15</small></button
            ><button
              class="play-button"
              (click)="player.toggle()"
              [attr.aria-label]="player.playing() || player.busy() ? 'Παύση' : 'Αναπαραγωγή'"
            >
              <dd-icon [name]="player.playing() || player.busy() ? 'pause' : 'play'" /></button
            ><button
              class="icon-button skip-control"
              (click)="player.skip(30)"
              aria-label="Μπροστά 30 δευτερόλεπτα"
            >
              <dd-icon name="forward" /><small>30</small></button
            ><button class="icon-button" (click)="player.next()" aria-label="Επόμενο επεισόδιο">
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
              aria-label="Θέση αναπαραγωγής"
            /><span>{{ player.duration() | time }}</span>
          </div>
        </div>
        <div class="mini-tools">
          <button
            class="icon-button"
            (click)="library.toggleFavorite(episode.id)"
            [attr.aria-pressed]="library.isFavorite(episode.id)"
            [class.selected]="library.isFavorite(episode.id)"
            aria-label="Αγαπημένο"
          >
            <dd-icon name="heart" /></button
          ><a
            routerLink="/library"
            [queryParams]="{ tab: 'queue' }"
            class="icon-button"
            aria-label="Ουρά ακρόασης"
            ><dd-icon name="queue" /></a
          ><a routerLink="/player" class="icon-button" aria-label="Άνοιγμα πλήρους player"
            ><dd-icon name="chevron"
          /></a>
        </div>
        <button
          class="play-button mobile-play"
          (click)="player.toggle()"
          [attr.aria-label]="player.playing() ? 'Παύση' : 'Αναπαραγωγή'"
        >
          <dd-icon [name]="player.playing() || player.busy() ? 'pause' : 'play'" />
        </button>
      </section>
    }
    <nav class="bottom-nav" aria-label="Πλοήγηση κινητού">
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
  `,
})
export class AppComponent {
  constructor() {
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        window.setTimeout(() => document.getElementById('main-content')?.focus({ preventScroll: true }), 0);
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
