import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { LibraryService } from './library.service';
import { PodcastService } from './podcast.service';
import { readPreference, savePreference } from './preferences.service';
import type { Episode } from './models';
export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'buffering' | 'error';
@Injectable({ providedIn: 'root' })
export class AudioPlayerService {
  readonly podcast = inject(PodcastService);
  readonly library = inject(LibraryService);
  readonly audio = new Audio();
  readonly current = signal<Episode | null>(null);
  readonly status = signal<PlayerStatus>('idle');
  readonly position = signal(0);
  readonly duration = signal(0);
  readonly speed = signal(this.preference('speed', 1, 0.5, 2));
  readonly volume = signal(this.preference('volume', 0.8, 0, 1));
  readonly error = signal('');
  readonly sleepUntil = signal<number | null>(null);
  readonly sleepMinutes = signal(0);
  readonly sleepRemaining = signal(0);
  readonly playing = computed(() => this.status() === 'playing');
  readonly busy = computed(() => this.status() === 'loading' || this.status() === 'buffering');
  readonly remaining = computed(() => Math.max(0, this.duration() - this.position()));
  private pendingPosition = 0;
  private lastTime = performance.now();
  private listenedDelta = 0;
  private elapsedSinceSave = 0;
  private history: string[] = [];
  private intent = 0;
  private restored = false;
  constructor() {
    this.audio.preload = 'metadata';
    this.audio.volume = this.volume();
    this.audio.playbackRate = this.speed();
    this.audio.addEventListener('loadedmetadata', () => {
      this.duration.set(
        Number.isFinite(this.audio.duration) ? this.audio.duration : (this.current()?.duration ?? 0),
      );
      if (this.pendingPosition > 0)
        this.audio.currentTime = Math.min(this.pendingPosition, Math.max(0, this.duration() - 1));
      this.pendingPosition = 0;
      this.updateMediaPosition();
    });
    this.audio.addEventListener('timeupdate', () => {
      this.position.set(this.audio.currentTime);
      this.updateMediaPosition();
    });
    this.audio.addEventListener('playing', () => {
      this.status.set('playing');
      this.lastTime = performance.now();
      this.setMediaState('playing');
    });
    this.audio.addEventListener('pause', () => {
      if (this.status() !== 'error') this.status.set('paused');
      this.persist();
      this.setMediaState('paused');
    });
    this.audio.addEventListener('waiting', () => {
      if (!this.audio.paused) this.status.set('buffering');
    });
    this.audio.addEventListener('seeking', () => {
      this.lastTime = performance.now();
    });
    this.audio.addEventListener('ended', () => {
      this.persist(true);
      this.next(true);
    });
    this.audio.addEventListener('error', () => {
      if (this.current()) this.fail();
    });
    const tick = window.setInterval(() => {
      const now = performance.now();
      const delta = (now - this.lastTime) / 1000;
      this.lastTime = now;
      if (this.playing() && !this.audio.paused && !this.audio.seeking && this.audio.readyState >= 2) {
        this.listenedDelta += Math.min(delta, 2);
        this.elapsedSinceSave += delta;
        if (this.elapsedSinceSave >= 5) {
          this.persist();
          this.elapsedSinceSave = 0;
        }
      }
      const until = this.sleepUntil();
      if (until !== null) {
        this.sleepRemaining.set(Math.max(0, Math.ceil((until - Date.now()) / 1000)));
        if (Date.now() >= until) {
          this.pause();
          this.setSleep(0);
        }
      }
    }, 1000);
    inject(DestroyRef).onDestroy(() => {
      window.clearInterval(tick);
      this.audio.pause();
    });
    window.addEventListener('pagehide', () => this.persist());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.persist();
    });
    effect(() => {
      const loaded = this.library.loaded();
      const episodes = this.podcast.episodes();
      if (loaded && episodes.length && !this.restored) {
        this.restored = true;
        const saved = this.podcast.find(this.library.state().currentId ?? '');
        if (saved && !this.current()) this.select(saved, false);
      }
    });
    this.setupMediaSession();
  }
  private preference(key: string, fallback: number, min: number, max: number): number {
    const raw = readPreference(key);
    const value = raw === null ? fallback : Number(raw);
    return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
  }
  play(episode: Episode): void {
    if (episode.id === this.current()?.id) {
      this.toggle();
      return;
    }
    this.select(episode, true);
  }
  private select(episode: Episode, autoplay: boolean, rememberHistory = true): void {
    this.persist();
    if (rememberHistory && this.current() && this.current()?.id !== episode.id)
      this.history.push(this.current()!.id);
    this.intent++;
    this.audio.pause();
    this.current.set(episode);
    this.error.set('');
    this.status.set(autoplay ? 'loading' : 'paused');
    const record = this.library.record(episode.id);
    this.pendingPosition = record?.completed ? 0 : (record?.position ?? 0);
    this.position.set(this.pendingPosition);
    this.duration.set(episode.duration);
    this.audio.src = episode.audioUrl; // The original enclosure URL is deliberately preserved.
    this.audio.playbackRate = this.speed();
    this.library.setCurrent(episode.id);
    if (this.library.state().queue.includes(episode.id)) this.library.removeFromQueue(episode.id);
    this.setMetadata(episode);
    if (autoplay) void this.resume();
  }
  async resume(): Promise<void> {
    if (!this.current()) return;
    const intent = ++this.intent;
    this.error.set('');
    this.status.set('loading');
    try {
      if (this.audio.error) {
        this.pendingPosition = this.position();
        this.audio.load();
      }
      await this.audio.play();
      if (intent === this.intent && !this.audio.paused) this.status.set('playing');
    } catch (error) {
      if (intent !== this.intent || (error instanceof DOMException && error.name === 'AbortError')) return;
      this.fail();
    }
  }
  toggle(): void {
    if (this.playing() || this.busy()) this.pause();
    else void this.resume();
  }
  pause(): void {
    this.intent++;
    this.audio.pause();
    if (this.current() && this.status() !== 'error') this.status.set('paused');
    this.persist();
  }
  seek(seconds: number): void {
    if (!this.current()) return;
    const position = Math.max(0, Math.min(seconds, this.duration()));
    if (this.audio.readyState > 0) {
      this.audio.currentTime = position;
      this.pendingPosition = 0;
    } else this.pendingPosition = position;
    this.position.set(position);
    this.persist();
  }
  skip(seconds: number): void {
    this.seek(this.position() + seconds);
  }
  setSpeed(speed: number): void {
    if (![0.75, 1, 1.25, 1.5, 1.75, 2].includes(speed)) return;
    this.speed.set(speed);
    this.audio.playbackRate = speed;
    savePreference('speed', String(speed));
  }
  setVolume(volume: number): void {
    const safe = Math.min(1, Math.max(0, volume));
    this.volume.set(safe);
    this.audio.volume = safe;
    savePreference('volume', String(safe));
  }
  setSleep(minutes: number): void {
    this.sleepMinutes.set(minutes);
    this.sleepUntil.set(minutes > 0 ? Date.now() + minutes * 60000 : null);
    this.sleepRemaining.set(minutes * 60);
  }
  previous(): void {
    if (this.position() > 3) {
      this.seek(0);
      return;
    }
    const id = this.history.pop();
    const episode = id
      ? this.podcast.find(id)
      : this.podcast.episodes()[this.podcast.episodes().findIndex((e) => e.id === this.current()?.id) - 1];
    if (episode) this.select(episode, true, false);
    else this.seek(0);
  }
  next(fromEnded = false): void {
    const queue = this.library.state().queue;
    const queued = queue.map((id) => this.podcast.find(id)).find((e) => e && e.id !== this.current()?.id);
    const episode =
      queued ??
      this.podcast.episodes()[this.podcast.episodes().findIndex((e) => e.id === this.current()?.id) + 1];
    if (queued) this.library.removeFromQueue(queued.id);
    if (episode) this.select(episode, true);
    else {
      this.pause();
      if (fromEnded) this.position.set(this.duration());
    }
  }
  private persist(ended = false): void {
    const episode = this.current();
    if (!episode) return;
    this.library.savePosition(episode.id, this.position(), this.duration(), this.listenedDelta, ended);
    this.listenedDelta = 0;
  }
  private fail(): void {
    this.status.set('error');
    this.error.set('common.audioCouldNotStartCheckYourConnectionAnd');
    this.setMediaState('paused');
  }
  private setMetadata(episode: Episode): void {
    if ('mediaSession' in navigator && 'MediaMetadata' in window)
      navigator.mediaSession.metadata = new MediaMetadata({
        title: episode.title,
        artist: 'Έλενα & Ειρηνέλλα',
        album: 'Dumb and Dahmer Podcast',
        artwork: [{ src: this.podcast.image(episode) }],
      });
  }
  private setMediaState(state: MediaSessionPlaybackState): void {
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = state;
  }
  private updateMediaPosition(): void {
    if ('mediaSession' in navigator && this.duration() > 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration: this.duration(),
          playbackRate: this.speed(),
          position: Math.min(this.position(), this.duration()),
        });
      } catch {
        /* Optional browser capability. */
      }
    }
  }
  private setupMediaSession(): void {
    if (!('mediaSession' in navigator)) return;
    const handlers: Partial<Record<MediaSessionAction, MediaSessionActionHandler>> = {
      play: () => {
        void this.resume();
      },
      pause: () => this.pause(),
      previoustrack: () => this.previous(),
      nexttrack: () => this.next(),
      seekbackward: (details) => this.skip(-(details.seekOffset ?? 15)),
      seekforward: (details) => this.skip(details.seekOffset ?? 30),
      seekto: (details) => {
        if (details.seekTime !== undefined) this.seek(details.seekTime);
      },
    };
    for (const [action, handler] of Object.entries(handlers)) {
      try {
        navigator.mediaSession.setActionHandler(action as MediaSessionAction, handler);
      } catch {
        /* Unsupported actions are ignored. */
      }
    }
  }
}
