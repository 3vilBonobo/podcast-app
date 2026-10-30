import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PodcastService } from '../../core/podcast.service';
import { EpisodeCardComponent } from '../../shared/episode-card';
import { EmptyStateComponent } from '../../shared/empty-state';
import { IconComponent } from '../../shared/icon';
@Component({
  imports: [EpisodeCardComponent, EmptyStateComponent, IconComponent],
  template: `<div class="page">
    <div class="page-intro">
      <div>
        <p class="eyebrow accent">ΚΑΘΕ ΥΠΟΘΕΣΗ ΕΧΕΙ ΤΗ ΘΕΣΗ ΤΗΣ</p>
        <h1>Το αρχείο<span class="accent">.</span></h1>
        <p class="intro-description">
          {{ podcast.episodes().length }} δημόσια επεισόδια. Πού θα σε βρει η επόμενη ιστορία;
        </p>
      </div>
      <span class="issue-note">OPEN THE CASE FILE<br /><strong>PUBLIC RSS ARCHIVE</strong></span>
    </div>
    <div class="catalog-toolbar">
      <div class="search-field">
        <dd-icon name="search" /><input
          type="search"
          placeholder="Τίτλος, όνομα ή μια σκοτεινή λέξη…"
          aria-label="Αναζήτηση επεισοδίων"
          [value]="search()"
          (input)="setFilter('q', $any($event.target).value)"
        />
      </div>
      <label class="select-label"
        >Σεζόν<select [value]="season()" (change)="setFilter('season', $any($event.target).value)">
          <option value="all">Όλες οι σεζόν</option>
          @for (season of podcast.seasons(); track season) {
            <option [value]="season" [selected]="season.toString() === this.season()">
              Σεζόν {{ season }}
            </option>
          }
          <option value="none">Χωρίς σεζόν</option>
        </select></label
      ><label class="select-label"
        >Ταξινόμηση<select [value]="sort()" (change)="setFilter('sort', $any($event.target).value)">
          <option value="newest">Νεότερα πρώτα</option>
          <option value="oldest">Παλαιότερα πρώτα</option>
        </select></label
      >
    </div>
    <div class="results-line">
      <span
        >{{ filtered().length }} ΕΠΕΙΣΟΔΙΑ
        @if (collection() === 'long') {
          · ΠΑΝΩ ΑΠΟ ΜΙΑ ΩΡΑ
        }
      </span>
      @if (search() || season() !== 'all' || collection()) {
        <button class="text-button" (click)="clear()">Καθαρισμός φίλτρων <dd-icon name="close" /></button>
      }
    </div>
    @if (podcast.loading()) {
      <div class="skeleton hero-skeleton" role="status" aria-label="Φόρτωση αρχείου"></div>
    } @else if (podcast.error()) {
      <div class="notice" role="alert">
        {{ podcast.error() }} <button class="button secondary" (click)="podcast.load()">Ξανά</button>
      </div>
    } @else if (!filtered().length) {
      <dd-empty
        icon="search"
        title="Αυτή η υπόθεση δεν βρέθηκε."
        description="Δοκίμασε άλλη λέξη ή αφαίρεσε κάποιο φίλτρο."
      />
    } @else {
      <div class="episode-grid catalog-grid">
        @for (episode of visible(); track episode.id) {
          <dd-episode-card [episode]="episode" />
        }
      </div>
      @if (visible().length < filtered().length) {
        <div class="load-more">
          <button class="button secondary" (click)="limit.update(addPage)">
            Περισσότερες ιστορίες <dd-icon name="down" />
          </button>
          <p>{{ visible().length }} από {{ filtered().length }}</p>
        </div>
      }
    }
    <div class="catalog-source">
      <span class="on-air-dot"></span> Επίσημος δημόσιος κατάλογος Buzzsprout
      @if (podcast.catalog(); as catalog) {
        <span>· Ενημέρωση {{ catalog.fetchedAt.slice(0, 10) }}</span>
        @if (catalog.fixture) {
          <strong>LOCAL FIXTURE — ΔΟΚΙΜΑΣΤΙΚΑ ΔΕΔΟΜΕΝΑ</strong>
        }
      }
    </div>
  </div>`,
})
export class EpisodesComponent {
  readonly podcast = inject(PodcastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  readonly search = computed(() => this.params().get('q') ?? '');
  readonly season = computed(() => this.params().get('season') ?? 'all');
  readonly sort = computed(() => this.params().get('sort') ?? 'newest');
  readonly collection = computed(() => this.params().get('collection'));
  readonly limit = signal(20);
  readonly addPage = (n: number): number => n + 20;
  readonly filtered = computed(() => {
    const q = this.search().trim().toLocaleLowerCase('el');
    return this.podcast
      .episodes()
      .filter(
        (e) =>
          (!q || `${e.title} ${e.description}`.toLocaleLowerCase('el').includes(q)) &&
          (this.season() === 'all' ||
            (this.season() === 'none' ? e.season === null : String(e.season) === this.season())) &&
          (this.collection() !== 'long' || e.duration >= 3600),
      )
      .sort((a, b) =>
        this.sort() === 'oldest'
          ? a.publishedAt.localeCompare(b.publishedAt)
          : b.publishedAt.localeCompare(a.publishedAt),
      );
  });
  readonly visible = computed(() => this.filtered().slice(0, this.limit()));
  setFilter(key: string, value: string): void {
    this.limit.set(20);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [key]: value || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
  clear(): void {
    this.limit.set(20);
    void this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }
}
