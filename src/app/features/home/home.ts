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
  imports: [RouterLink, DatePipe, EpisodeCardComponent, IconComponent, MinutesPipe],
  template: ` <div class="page home-page">
    <div class="page-intro">
      <div>
        <p class="eyebrow accent">ΚΑΛΩΣ ΗΡΘΕΣ ΣΤΗ ΣΚΟΤΕΙΝΗ ΠΛΕΥΡΑ</p>
        <h1>Έλα για τσάι<span class="accent">.</span></h1>
        <p class="intro-description">Αληθινά εγκλήματα. Σκοτεινές ιστορίες. Καθόλου φίλτρο.</p>
      </div>
      <span class="issue-note">THE LISTENING ROOM<br /><strong>ΜΕ ΤΗΝ ΕΛΕΝΑ & ΤΗΝ ΕΙΡΗΝΕΛΛΑ</strong></span>
    </div>
    @if (podcast.loading()) {
      <div class="hero-skeleton skeleton" aria-label="Φόρτωση επεισοδίων" role="status"></div>
    }
    @if (podcast.error()) {
      <div class="notice" role="alert">
        <p>{{ podcast.error() }}</p>
        <button class="button secondary" (click)="podcast.load()">Δοκίμασε ξανά</button>
      </div>
    }
    @if (podcast.latest(); as latest) {
      <section class="hero">
        <div class="hero-copy">
          <div class="eyebrow">
            <span class="on-air-dot"></span> ΤΕΛΕΥΤΑΙΟ ΕΠΕΙΣΟΔΙΟ
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
              latest.contentKind === 'promotional-preview' ? 'PLUS · ΔΗΜΟΣΙΟ PREVIEW' : 'PUBLIC EPISODE'
            }}</span>
          </div>
          <div class="hero-actions">
            <button class="button primary" (click)="player.play(latest)">
              <dd-icon [name]="player.current()?.id === latest.id && player.playing() ? 'pause' : 'play'" />
              {{
                player.current()?.id === latest.id && player.playing() ? 'Παύση' : 'Βάλε να ακούσουμε'
              }}</button
            ><button
              class="circle-button"
              (click)="library.toggleFavorite(latest.id)"
              [class.selected]="library.isFavorite(latest.id)"
              [attr.aria-pressed]="library.isFavorite(latest.id)"
              aria-label="Αποθήκευση στα αγαπημένα"
            >
              <dd-icon name="heart" />
            </button>
          </div>
        </div>
        <a
          [routerLink]="['/episodes', latest.id]"
          class="hero-art"
          aria-label="Λεπτομέρειες τελευταίου επεισοδίου"
          ><span class="art-corner top-left"></span><span class="art-corner bottom-right"></span
          ><img [src]="podcast.artwork()" alt="Το επίσημο εξώφυλλο του Dumb and Dahmer Podcast" /><span
            class="art-stamp"
            >DARK STORIES.<br />GOOD COMPANY.</span
          ></a
        ><span class="hero-bottom-label">ΑΚΟΥΜΕ ΜΑΖΙ. ΚΡΙΝΟΥΜΕ ΜΑΖΙ.</span>
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
          <p class="eyebrow">ΦΡΕΣΚΑ ΑΠΟ ΤΟ ΜΙΚΡΟΦΩΝΟ</p>
          <h2>Οι τελευταίες ιστορίες</h2>
        </div>
        <a routerLink="/episodes" class="text-button">Όλα τα επεισόδια <dd-icon name="arrow" /></a>
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
            <p class="eyebrow">ΕΧΟΥΜΕ ΑΦΗΣΕΙ ΜΙΑ ΙΣΤΟΡΙΑ ΣΤΗ ΜΕΣΗ</p>
            <h2>Από εκεί που μείναμε</h2>
          </div>
          <a routerLink="/library" [queryParams]="{ tab: 'continue' }" class="text-button"
            >Η βιβλιοθήκη σου <dd-icon name="arrow"
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
          <p class="eyebrow">ΑΝΟΙΞΕ ΤΟ ΑΡΧΕΙΟ</p>
          <h2>Κάθε σεζόν, άλλη ιστορία.</h2>
        </div>
        <span class="tiny-label">{{ podcast.episodes().length }} ΔΗΜΟΣΙΑ ΕΠΕΙΣΟΔΙΑ</span>
      </div>
      <div class="season-grid">
        @for (season of podcast.seasons().slice(0, 3); track season) {
          <a routerLink="/episodes" [queryParams]="{ season: season }" class="season-card"
            ><div class="eyebrow">ΤΟ ΑΡΧΕΙΟ <dd-icon name="arrow" /></div>
            <span class="season-number">{{ season.toString().padStart(2, '0') }}</span>
            <div>
              <strong>Σεζόν {{ season }}</strong
              ><span
                >{{ seasonCount(season) }} {{ seasonCount(season) === 1 ? 'επεισόδιο' : 'επεισόδια' }}</span
              >
            </div></a
          >
        }
        <a routerLink="/episodes" [queryParams]="{ season: 'all' }" class="season-card archive-season"
          ><div class="eyebrow">ΧΩΡΙΣ ΧΡΟΝΙΚΟ ΟΡΙΟ <dd-icon name="arrow" /></div>
          <dd-icon name="folder" />
          <div><strong>Ολόκληρο το αρχείο</strong><span>Από την αρχή. Αν τολμάς.</span></div></a
        >
      </div>
    </section>
    <section class="content-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">ΔΙΑΛΕΞΕ ΔΙΑΘΕΣΗ</p>
          <h2>Μικρές συλλογές. Μεγάλες νύχτες.</h2>
        </div>
        <span class="tiny-label">ΕΠΙΛΟΓΕΣ ΤΗΣ ΕΦΑΡΜΟΓΗΣ</span>
      </div>
      <div class="collection-grid">
        <a routerLink="/episodes" [queryParams]="{ sort: 'oldest' }" class="collection-card"
          ><span class="collection-art"><span>01</span><dd-icon name="headphones" /></span>
          <div>
            <span class="eyebrow">ΑΠΟ ΤΗΝ ΑΡΧΗ</span>
            <h3>Η πρώτη σου υπόθεση</h3>
            <p>Το δημόσιο αρχείο, με χρονολογική σειρά.</p>
          </div>
          <dd-icon name="arrow" /></a
        ><a routerLink="/episodes" [queryParams]="{ collection: 'long' }" class="collection-card"
          ><span class="collection-art moon-art"><dd-icon name="moon" /></span>
          <div>
            <span class="eyebrow">ΓΙΑ ΜΕΓΑΛΕΣ ΝΥΧΤΕΣ</span>
            <h3>Μία ώρα ακόμα</h3>
            <p>Επεισόδια με διάρκεια πάνω από μία ώρα.</p>
          </div>
          <dd-icon name="arrow"
        /></a>
      </div>
    </section>
    <section class="extras-teaser">
      <div>
        <p class="eyebrow accent">ΕΚΤΟΣ ΗΧΟΓΡΑΦΗΣΗΣ</p>
        <h2>Κάτι κινείται<br />στο παρασκήνιο<span class="accent">.</span></h2>
        <p>Μικρά μυστήρια, κλειδωμένα συρτάρια και όσα ετοιμάζονται.</p>
        <a routerLink="/extras" class="text-button">Μπες στα Extras <dd-icon name="arrow" /></a>
      </div>
      <a routerLink="/extras/waking-machine" class="machine-preview"
        ><span class="eyebrow">EXPERIENCE 001 · COMING SOON</span>
        <div class="machine-orbit">
          <span class="orbit-ring"></span><span class="orbit-ring inner"></span><dd-icon name="eye" />
        </div>
        <strong>THE WAKING MACHINE</strong
        ><span>Κάποιες ιστορίες δεν κοιμούνται ποτέ. <dd-icon name="arrow" /></span
      ></a>
    </section>
    <a routerLink="/plus" class="plus-banner"
      ><div>
        <span class="eyebrow">ΓΙΑ ΤΟΥΣ ΛΙΓΟ ΠΙΟ ΜΥΗΜΕΝΟΥΣ</span>
        <h2>Η ιστορία συνεχίζεται στο <em>Plus.</em></h2>
        <p>Μάθε για τη συνδρομή στο επίσημο Buzzsprout.</p>
      </div>
      <span class="button secondary">Ανακάλυψε το Plus <dd-icon name="arrow" /></span
    ></a>
  </div>`,
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
