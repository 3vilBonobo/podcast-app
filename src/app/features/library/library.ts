import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LibraryService } from '../../core/library.service';
import { PodcastService } from '../../core/podcast.service';
import { EpisodeCardComponent } from '../../shared/episode-card';
import { EmptyStateComponent } from '../../shared/empty-state';
import { IconComponent } from '../../shared/icon';
@Component({
  imports: [EpisodeCardComponent, EmptyStateComponent, IconComponent, RouterLink],
  template: `<div class="page">
    <div class="page-intro">
      <div>
        <p class="eyebrow accent">ΤΟ ΠΡΟΣΩΠΙΚΟ ΣΟΥ ΑΡΧΕΙΟ</p>
        <h1>Κράτα την ιστορία<span class="accent">.</span></h1>
        <p class="intro-description">Τα αγαπημένα σου, οι επόμενες υποθέσεις και οι ιστορίες στη μέση.</p>
      </div>
      <span class="local-badge"><dd-icon name="lock" /> ΜΟΝΟ ΣΕ ΑΥΤΗ ΤΗ ΣΥΣΚΕΥΗ</span>
    </div>
    <div class="tab-list" role="tablist" aria-label="Κατηγορίες βιβλιοθήκης">
      @for (item of tabs; track item.id) {
        <button
          role="tab"
          [id]="'tab-' + item.id"
          aria-controls="library-results"
          [attr.aria-selected]="tab() === item.id"
          [class.active]="tab() === item.id"
          (click)="select(item.id)"
          (keydown)="tabKey($event, item.id)"
        >
          {{ item.label }}
          @if (item.id === 'favorites') {
            <span>{{ library.state().favorites.length }}</span>
          }
          @if (item.id === 'queue') {
            <span>{{ library.state().queue.length }}</span>
          }
        </button>
      }
    </div>
    <section id="library-results" role="tabpanel" [attr.aria-labelledby]="'tab-' + tab()">
      @if (!library.loaded() || podcast.loading()) {
        <div class="skeleton hero-skeleton" role="status" aria-label="Φόρτωση βιβλιοθήκης"></div>
      } @else if (!episodes().length) {
        <dd-empty
          [icon]="tab() === 'favorites' ? 'heart' : tab() === 'queue' ? 'queue' : 'headphones'"
          [title]="emptyTitle()"
          description="Όλα ξεκινούν με ένα επεισόδιο. Χωρίς λογαριασμό, χωρίς βιασύνη."
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
                    (click)="library.moveInQueue(episode.id, -1)"
                    [disabled]="$first"
                  >
                    ↑ Πάνω</button
                  ><button
                    class="text-button"
                    (click)="library.moveInQueue(episode.id, 1)"
                    [disabled]="$last"
                  >
                    ↓ Κάτω</button
                  ><button class="text-button" (click)="library.removeFromQueue(episode.id)">
                    Αφαίρεση <dd-icon name="close" />
                  </button>
                </div>
              }
            </div>
          }
        </div>
      }
    </section>
    <p class="privacy-note">
      <dd-icon name="lock" /> Η βιβλιοθήκη αποθηκεύεται τοπικά στον browser σου. Η εκκαθάριση δεδομένων του
      browser θα τη διαγράψει. <a routerLink="/profile">Ρυθμίσεις</a>
    </p>
  </div>`,
})
export class LibraryComponent {
  readonly library = inject(LibraryService);
  readonly podcast = inject(PodcastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly tabs = [
    { id: 'favorites', label: 'Αγαπημένα' },
    { id: 'continue', label: 'Συνέχισε' },
    { id: 'recent', label: 'Πρόσφατα' },
    { id: 'completed', label: 'Ολοκληρωμένα' },
    { id: 'queue', label: 'Στην ουρά' },
  ];
  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  readonly tab = computed(() => {
    const tab = this.params().get('tab');
    return this.tabs.some((t) => t.id === tab) ? tab! : 'favorites';
  });
  readonly episodes = computed(() => {
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
                    : true,
              )
              .map((r) => r.episodeId);
    return ids.map((id) => this.podcast.find(id)).filter((e) => e !== undefined);
  });
  readonly emptyTitle = computed(
    () =>
      ({
        favorites: 'Οι αγαπημένες σου ιστορίες, εδώ.',
        continue: 'Καμία ιστορία στη μέση.',
        recent: 'Η πρώτη ακρόαση σε περιμένει.',
        completed: 'Κάθε τέλος, μια νέα υπόθεση.',
        queue: 'Τι θα ακούσουμε μετά;',
      })[this.tab()] ?? 'Το αρχείο είναι άδειο.',
  );
  select(tab: string): void {
    void this.router.navigate([], { queryParams: { tab }, replaceUrl: true });
  }
  tabKey(event: KeyboardEvent, id: string): void {
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
}
