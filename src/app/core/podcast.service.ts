import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Catalog, Episode } from './models';
@Injectable({ providedIn: 'root' })
export class PodcastService {
  private readonly http = inject(HttpClient);
  readonly catalog = signal<Catalog | null>(null);
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
  readonly artwork = computed(() => this.catalog()?.localArtwork || this.catalog()?.artwork || '/icon.svg');
  constructor() {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.http.get<Catalog>('/data/catalog.json').subscribe({
      next: (catalog) => {
        if (catalog.schemaVersion !== 1 || !Array.isArray(catalog.episodes)) {
          this.error.set("common.theEpisodeCatalogIsInvalid");
        } else {
          this.catalog.set(catalog);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set("common.weCouldNotOpenTheArchivePleaseTry");
        this.loading.set(false);
      },
    });
  }
  find(id: string): Episode | undefined {
    return this.episodes().find((e) => e.id === id);
  }
  image(episode: Episode): string {
    return (
      episode.localArtwork || (episode.artwork === this.catalog()?.artwork ? this.artwork() : episode.artwork)
    );
  }
}
