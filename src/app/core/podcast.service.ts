import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, timeout } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Catalog, Episode } from './models';
import { assetUrl } from './asset-url';
import { normalizeCatalog } from './catalog-contract.mjs';
import { applyEditorial, validateEditorial } from './editorial.mjs';
import editorialOverrides from '../../../editorial/overrides.json';
@Injectable({ providedIn: 'root' })
export class PodcastService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private inFlight = false;
  private lastCheckedAt = 0;
  readonly rssCatalog = signal<Catalog | null>(null);
  private readonly editorial = validateEditorial(editorialOverrides);
  readonly catalog = computed(() => {
    const source = this.rssCatalog();
    return source ? applyEditorial(source, this.editorial) : null;
  });
  readonly collections = computed(() =>
    this.editorial.collections.filter((c) => c.episodeIds.some((id) => this.find(id))),
  );
  readonly featured = computed(() =>
    this.editorial.featured.map((id) => this.find(id)).filter((e): e is Episode => !!e),
  );
  readonly loading = signal(true);
  readonly error = signal('');
  readonly episodes = computed(() => this.catalog()?.episodes ?? []);
  readonly latest = computed(() => this.episodes()[0]);
  readonly seasons = computed(() =>
    [
      ...new Set(
        this.episodes()
          .map((e) => e.season)
          .filter((s): s is number => s !== null),
      ),
    ].sort((a, b) => b - a),
  );
  readonly artwork = computed(() =>
    assetUrl(this.catalog()?.localArtwork || this.catalog()?.artwork || 'icon.svg'),
  );
  constructor() {
    this.load();
    const refresh = () => {
      if (!document.hidden && Date.now() - this.lastCheckedAt >= 15 * 60_000) this.load(true);
    };
    const timer = window.setInterval(refresh, 15 * 60_000);
    document.addEventListener('visibilitychange', refresh);
    this.destroyRef.onDestroy(() => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    });
  }
  load(background = false): void {
    if (this.inFlight) return;
    this.inFlight = true;
    this.lastCheckedAt = Date.now();
    if (!background) this.loading.set(true);
    this.error.set('');
    this.http
      .get<unknown>(assetUrl('data/catalog.json'), { params: { v: String(Date.now()) } })
      .pipe(
        timeout(20_000),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.inFlight = false;
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (value) => {
          const catalog = normalizeCatalog(value);
          if (!catalog) {
            if (!this.catalog()) this.error.set('common.theEpisodeCatalogIsInvalid');
          } else {
            this.rssCatalog.set(catalog);
          }
        },
        error: () => {
          if (!this.catalog()) this.error.set('common.weCouldNotOpenTheArchivePleaseTry');
        },
      });
  }
  find(id: string): Episode | undefined {
    return this.episodes().find((e) => e.id === id);
  }
  image(episode: Episode): string {
    return assetUrl(
      episode.localArtwork ||
        (episode.artwork === this.catalog()?.artwork ? this.artwork() : episode.artwork),
    );
  }
}
