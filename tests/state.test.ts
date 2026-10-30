import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { IDBFactory } from 'fake-indexeddb';
import { LocalStorageRepository, emptyLibrary } from '../src/app/core/local-storage.repository';
import { LibraryService } from '../src/app/core/library.service';
import { ThemeService, MockAuthService } from '../src/app/core/preferences.service';
import { PodcastService } from '../src/app/core/podcast.service';
import { AudioPlayerService } from '../src/app/core/audio-player.service';
import type { Episode } from '../src/app/core/models';

beforeEach(() => {
  localStorage.clear();
  TestBed.resetTestingModule();
  Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: new IDBFactory() });
});
afterEach(() => {
  TestBed.resetTestingModule();
  vi.useRealTimers();
});
describe('appearance and mock identity', () => {
  it('persists every theme and follows system when cleared', () => {
    const theme = new ThemeService();
    theme.set('archive');
    expect(document.documentElement.dataset['theme']).toBe('archive');
    expect(new ThemeService().theme()).toBe('archive');
    theme.set('after-hours');
    expect(new ThemeService().theme()).toBe('after-hours');
    theme.set('noir');
    expect(new ThemeService().theme()).toBe('noir');
    theme.set('system');
    expect(localStorage.getItem('dd:theme')).toBeNull();
    expect(theme.theme()).toBe('noir');
  });
  it('starts as a guest, restores demo state, and logs out without credentials', () => {
    const auth = new MockAuthService();
    expect(auth.guest()).toBe(true);
    auth.demoLogin();
    expect(new MockAuthService().user()?.demo).toBe(true);
    expect(Object.keys(localStorage)).toEqual(['dd:demo']);
    auth.logout();
    expect(new MockAuthService().guest()).toBe(true);
  });
});
describe('IndexedDB library boundary', () => {
  it('round-trips listening positions, favorites and queue through a new repository instance', async () => {
    const repository = new LocalStorageRepository();
    const snapshot = {
      ...emptyLibrary(),
      favorites: ['a'],
      queue: ['b'],
      currentId: 'a',
      records: {
        a: {
          episodeId: 'a',
          position: 123,
          duration: 700,
          completed: false,
          lastPlayed: 10,
          listenedSeconds: 22,
        },
      },
    };
    await repository.write(snapshot);
    expect(await new LocalStorageRepository().read()).toEqual(snapshot);
  });
  it('merges pre-hydration actions and never counts seeking as listening time', async () => {
    const library = TestBed.inject(LibraryService);
    library.toggleFavorite('a');
    await library.ready;
    library.enqueue('a');
    library.enqueue('a');
    library.savePosition('a', 500, 600, 3);
    library.savePosition('a', 100, 600, 0);
    await library.flush();
    expect(library.state().favorites).toEqual(['a']);
    expect(library.state().queue).toEqual(['a']);
    expect(library.record('a')?.listenedSeconds).toBe(3);
    expect((await new LocalStorageRepository().read()).records['a'].position).toBe(100);
  });
  it('reorders and removes queued episodes and preserves completed state', async () => {
    const library = TestBed.inject(LibraryService);
    await library.ready;
    library.enqueue('a');
    library.enqueue('b');
    library.moveInQueue('b', -1);
    expect(library.state().queue).toEqual(['b', 'a']);
    library.removeFromQueue('b');
    library.savePosition('a', 600, 600, 1, true);
    library.savePosition('a', 0, 600);
    expect(library.completed()).toHaveLength(1);
  });
  it('reports persistence failures and keeps an in-memory library usable', async () => {
    const repository = new LocalStorageRepository();
    vi.spyOn(indexedDB, 'open').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(await repository.read()).toEqual(emptyLibrary());
    expect(repository.error()).toBe('common.localStorageIsUnavailableChangesWillOnlyLast');
  });
});
class FakeAudio extends EventTarget {
  src = '';
  preload = '';
  volume = 1;
  playbackRate = 1;
  paused = true;
  currentTime = 0;
  duration = 600;
  readyState = 4;
  seeking = false;
  play = vi.fn(async () => {
    this.paused = false;
    this.dispatchEvent(new Event('playing'));
  });
  pause = vi.fn(() => {
    if (!this.paused) {
      this.paused = true;
      this.dispatchEvent(new Event('pause'));
    }
  });
}
const episode = (id: string): Episode => ({
  id,
  title: id,
  description: '',
  publishedAt: '2026-10-21',
  duration: 600,
  episodeNumber: 1,
  season: 1,
  artwork: '/icon.svg',
  audioUrl: 'https://www.buzzsprout.com/2006539/' + id + '.mp3',
  audioType: 'audio/mpeg',
  explicit: false,
  episodeType: 'full',
  contentKind: 'public-episode',
  categories: ['other'],
  categorySource: 'editorial-keywords',
  link: '',
  access: 'public',
});
describe('audio controls', () => {
  async function setup() {
    vi.stubGlobal('Audio', FakeAudio);
    const episodes = signal([episode('a'), episode('b'), episode('c')]);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: PodcastService,
          useValue: {
            episodes,
            find: (id: string) => episodes().find((e) => e.id === id),
            image: () => '/icon.svg',
          },
        },
      ],
    });
    const library = TestBed.inject(LibraryService);
    await library.ready;
    const player = TestBed.inject(AudioPlayerService);
    return { player, library, audio: player.audio as unknown as FakeAudio };
  }
  afterEach(() => vi.unstubAllGlobals());
  it('plays the unchanged public URL, seeks, changes rate/volume and pauses', async () => {
    const { player, audio } = await setup();
    player.play(episode('a'));
    await Promise.resolve();
    expect(audio.src).toBe(episode('a').audioUrl);
    expect(player.playing()).toBe(true);
    player.skip(30);
    expect(player.position()).toBe(30);
    player.skip(-15);
    expect(player.position()).toBe(15);
    player.setSpeed(1.5);
    expect(audio.playbackRate).toBe(1.5);
    player.setVolume(0.3);
    expect(audio.volume).toBe(0.3);
    player.pause();
    expect(player.status()).toBe('paused');
    expect(audio.paused).toBe(true);
  });
  it('restores saved position when metadata arrives and consumes the queue', async () => {
    const { player, audio, library } = await setup();
    library.savePosition('a', 123, 600);
    library.enqueue('c');
    player.play(episode('a'));
    audio.dispatchEvent(new Event('loadedmetadata'));
    expect(audio.currentTime).toBe(123);
    player.next();
    expect(player.current()?.id).toBe('c');
    expect(library.state().queue).toEqual([]);
  });
  it('handles ended tracks and visible errors', async () => {
    const { player, audio, library } = await setup();
    player.play(episode('a'));
    await Promise.resolve();
    audio.dispatchEvent(new Event('ended'));
    expect(library.record('a')?.completed).toBe(true);
    expect(player.current()?.id).toBe('b');
    audio.dispatchEvent(new Event('error'));
    expect(player.status()).toBe('error');
    expect(player.error()).not.toBe('');
  });
  it('walks backward through playback history without bouncing between the last two episodes', async () => {
    const { player } = await setup();
    player.play(episode('a'));
    player.play(episode('b'));
    player.play(episode('c'));
    player.previous();
    expect(player.current()?.id).toBe('b');
    player.previous();
    expect(player.current()?.id).toBe('a');
  });
  it('pauses when sleep timer expires', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date', 'performance'] });
    const { player } = await setup();
    player.play(episode('a'));
    await Promise.resolve();
    player.setSleep(0.01);
    await vi.advanceTimersByTimeAsync(1001);
    expect(player.sleepUntil()).toBeNull();
    expect(player.status()).toBe('paused');
  });
});
