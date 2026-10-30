import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AudioPlayerService } from '../../core/audio-player.service';
import { PodcastService } from '../../core/podcast.service';
import { LibraryService } from '../../core/library.service';
import { IconComponent } from '../../shared/icon';
import { TimePipe } from '../../shared/format';
import { EmptyStateComponent } from '../../shared/empty-state';
@Component({
  imports: [RouterLink, IconComponent, TimePipe, EmptyStateComponent],
  template: `<div class="page player-page">
    @if (player.current(); as episode) {
      <div class="full-player">
        <div class="player-topline">
          <a routerLink="/episodes" class="icon-button" aria-label="Πίσω στα επεισόδια"
            ><dd-icon name="down"
          /></a>
          <div>
            <span class="eyebrow">THE LISTENING ROOM</span>
            <p>
              {{ player.busy() ? 'Ο ήχος φορτώνει…' : player.playing() ? 'Τώρα ακούς' : 'Μια μικρή παύση' }}
            </p>
          </div>
          <a
            routerLink="/library"
            [queryParams]="{ tab: 'queue' }"
            class="icon-button"
            aria-label="Ουρά ακρόασης"
            ><dd-icon name="queue"
          /></a>
        </div>
        <div class="player-art"><img [src]="podcast.image(episode)" alt="Εξώφυλλο επεισοδίου" /></div>
        <div class="player-title">
          <div>
            <p class="eyebrow accent">
              {{
                episode.contentKind === 'promotional-preview' ? 'PLUS · ΔΗΜΟΣΙΟ PREVIEW' : 'PUBLIC EPISODE'
              }}
              @if (episode.season) {
                · ΣΕΖΟΝ {{ episode.season }}
              }
            </p>
            <a [routerLink]="['/episodes', episode.id]"
              ><h1>{{ episode.title }}</h1></a
            >
            <p>Έλενα & Ειρηνέλλα · Dumb and Dahmer</p>
          </div>
          <button
            class="icon-button"
            (click)="library.toggleFavorite(episode.id)"
            [class.selected]="library.isFavorite(episode.id)"
            [attr.aria-pressed]="library.isFavorite(episode.id)"
            aria-label="Αγαπημένο"
          >
            <dd-icon name="heart" />
          </button>
        </div>
        @if (player.error()) {
          <div class="notice" role="alert">
            {{ player.error() }}<button class="text-button" (click)="player.resume()">Δοκίμασε ξανά</button>
          </div>
        }
        <label class="seek-label"
          ><span class="sr-only">Θέση αναπαραγωγής</span
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
          <button class="icon-button" (click)="player.previous()" aria-label="Προηγούμενο επεισόδιο">
            <dd-icon name="previous" /></button
          ><button
            class="icon-button skip-control"
            (click)="player.skip(-15)"
            aria-label="Πίσω 15 δευτερόλεπτα"
          >
            <dd-icon name="back" /><small>15</small></button
          ><button
            class="play-button large-play"
            [class.is-buffering]="player.busy()"
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
        <div class="player-options">
          <label
            ><span><dd-icon name="headphones" /> Ταχύτητα</span
            ><select
              aria-label="Ταχύτητα αναπαραγωγής"
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
              aria-label="Χρονοδιακόπτης ύπνου"
              [value]="player.sleepMinutes()"
              (change)="player.setSleep(+$any($event.target).value)"
            >
              <option value="0">Κλειστός</option>
              <option value="15">15 λεπτά</option>
              <option value="30">30 λεπτά</option>
              <option value="45">45 λεπτά</option>
              <option value="60">60 λεπτά</option>
            </select></label
          ><label class="volume-control"
            ><span><dd-icon name="volume" /> Ένταση</span
            ><input
              type="range"
              min="0"
              max="1"
              step="0.05"
              [value]="player.volume()"
              (input)="player.setVolume(+$any($event.target).value)"
              aria-label="Ένταση ήχου"
          /></label>
        </div>
        @if (player.sleepUntil()) {
          <p class="timer-note" role="status">
            <dd-icon name="moon" /> Η αναπαραγωγή θα σταματήσει σε {{ player.sleepRemaining() | time
            }}<button class="text-button" (click)="player.setSleep(0)">Ακύρωση</button>
          </p>
        }
        <button class="text-button add-queue" (click)="library.enqueue(episode.id)">
          <dd-icon name="queue" />
          {{
            library.state().queue.includes(episode.id)
              ? 'Προστέθηκε στην ουρά'
              : 'Προσθήκη στην ουρά ακρόασης'
          }}
        </button>
        <p class="privacy-note player-browser-note">
          Ο ήχος παραδίδεται από το επίσημο Buzzsprout. Η αναπαραγωγή στο παρασκήνιο και η ένταση εξαρτώνται
          από τον browser και τη συσκευή.
        </p>
      </div>
    } @else {
      <dd-empty
        title="Τι θα ακούσουμε απόψε;"
        description="Διάλεξε μια ιστορία από το αρχείο για να ξεκινήσεις."
        link="/episodes"
      />
    }
  </div>`,
})
export class PlayerComponent {
  readonly player = inject(AudioPlayerService);
  readonly podcast = inject(PodcastService);
  readonly library = inject(LibraryService);
  readonly speeds = [0.75, 1, 1.25, 1.5, 1.75, 2];
}
