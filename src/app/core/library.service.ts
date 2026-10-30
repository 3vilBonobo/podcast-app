import { computed, inject, Injectable, signal } from '@angular/core';
import { emptyLibrary, LocalStorageRepository } from './local-storage.repository';
import type { LibrarySnapshot, ListeningRecord } from './models';
@Injectable({ providedIn: 'root' })
export class LibraryService {
  readonly repository = inject(LocalStorageRepository);
  readonly state = signal<LibrarySnapshot>(emptyLibrary());
  readonly loaded = signal(false);
  readonly ready = this.hydrate();
  readonly records = computed(() =>
    Object.values(this.state().records).sort((a, b) => b.lastPlayed - a.lastPlayed),
  );
  readonly minutes = computed(() =>
    Math.floor(this.records().reduce((sum, r) => sum + r.listenedSeconds, 0) / 60),
  );
  readonly completed = computed(() => this.records().filter((r) => r.completed));
  private writes = Promise.resolve();
  private async hydrate(): Promise<void> {
    this.state.set(await this.repository.read());
    this.loaded.set(true);
  }
  private update(change: (state: LibrarySnapshot) => LibrarySnapshot): void {
    if (!this.loaded()) {
      void this.ready.then(() => this.update(change));
      return;
    }
    this.state.update(change);
    const snapshot = this.state();
    this.writes = this.writes.then(() => this.repository.write(snapshot));
  }
  isFavorite(id: string): boolean {
    return this.state().favorites.includes(id);
  }
  toggleFavorite(id: string): void {
    this.update((s) => ({
      ...s,
      favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [...s.favorites, id],
    }));
  }
  enqueue(id: string): void {
    this.update((s) => ({ ...s, queue: s.queue.includes(id) ? s.queue : [...s.queue, id] }));
  }
  removeFromQueue(id: string): void {
    this.update((s) => ({ ...s, queue: s.queue.filter((x) => x !== id) }));
  }
  moveInQueue(id: string, direction: -1 | 1): void {
    this.update((s) => {
      const queue = [...s.queue];
      const index = queue.indexOf(id);
      const target = index + direction;
      if (index >= 0 && target >= 0 && target < queue.length)
        [queue[index], queue[target]] = [queue[target], queue[index]];
      return { ...s, queue };
    });
  }
  record(id: string): ListeningRecord | undefined {
    return this.state().records[id];
  }
  setCurrent(id: string): void {
    this.update((s) => ({ ...s, currentId: id }));
  }
  savePosition(id: string, position: number, duration: number, listenedDelta = 0, ended = false): void {
    this.update((s) => {
      const previous = s.records[id];
      return {
        ...s,
        records: {
          ...s.records,
          [id]: {
            episodeId: id,
            position,
            duration,
            lastPlayed: Date.now(),
            completed: ended || previous?.completed || false,
            listenedSeconds: (previous?.listenedSeconds ?? 0) + Math.max(0, listenedDelta),
          },
        },
      };
    });
  }
  flush(): Promise<void> {
    return this.writes;
  }
}
