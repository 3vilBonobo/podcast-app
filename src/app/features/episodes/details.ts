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
  imports: [RouterLink, DatePipe, IconComponent, MinutesPipe, EmptyStateComponent],
  template: `<div class="page">
    <a routerLink="/episodes" class="back-link">← Πίσω στο αρχείο</a>
    @if (episode(); as episode) {
      <section class="episode-detail">
        <img class="detail-art" [src]="podcast.image(episode)" alt="Εξώφυλλο επεισοδίου" />
        <div>
          <p class="eyebrow accent">
            {{ episode.contentKind === 'promotional-preview' ? 'PLUS · ΔΗΜΟΣΙΟ PREVIEW' : 'PUBLIC EPISODE' }}
            @if (episode.season) {
              · ΣΕΖΟΝ {{ episode.season }}
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
              <dd-icon [name]="player.current()?.id === episode.id && player.playing() ? 'pause' : 'play'" />
              {{
                player.current()?.id === episode.id && player.playing() ? 'Παύση' : 'Άκουσε το επεισόδιο'
              }}</button
            ><button
              class="circle-button"
              (click)="library.toggleFavorite(episode.id)"
              [class.selected]="library.isFavorite(episode.id)"
              [attr.aria-pressed]="library.isFavorite(episode.id)"
              aria-label="Αγαπημένο"
            >
              <dd-icon name="heart" /></button
            ><button
              class="circle-button"
              (click)="library.enqueue(episode.id)"
              [class.selected]="library.state().queue.includes(episode.id)"
              aria-label="Προσθήκη στην ουρά"
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
              Αυτό είναι δημόσιο προωθητικό απόσπασμα Plus. Η διάρκεια του player αφορά το δημόσιο clip, όχι
              το πλήρες συνδρομητικό επεισόδιο.
            </p>
            <a routerLink="/plus" class="text-button">Πληροφορίες Plus <dd-icon name="arrow" /></a>
          </div>
        }
        <p class="eyebrow">ΣΗΜΕΙΩΣΕΙΣ ΕΠΕΙΣΟΔΙΟΥ</p>
        <h2>Ο φάκελος της υπόθεσης</h2>
        <p class="preserve-lines">{{ episode.description }}</p>
        @if (episode.link) {
          <a [href]="episode.link" target="_blank" rel="noopener noreferrer" class="text-button"
            >Το επεισόδιο στο Buzzsprout <dd-icon name="external"
          /></a>
        }
      </section>
    } @else if (!podcast.loading()) {
      <dd-empty
        title="Ο φάκελος δεν βρέθηκε."
        description="Το επεισόδιο μπορεί να έχει αφαιρεθεί από το δημόσιο RSS."
        link="/episodes"
      />
    }
  </div>`,
})
export class EpisodeDetailsComponent {
  readonly podcast = inject(PodcastService);
  readonly player = inject(AudioPlayerService);
  readonly library = inject(LibraryService);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  readonly episode = computed(() => this.podcast.find(this.params().get('id') ?? ''));
}
