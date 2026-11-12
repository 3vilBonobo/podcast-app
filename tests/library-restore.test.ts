import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { IDBFactory } from 'fake-indexeddb';
import { LibraryService } from '../src/app/core/library.service';
import {
  LocalStorageRepository,
  emptyLibrary,
  LibraryConflictError,
} from '../src/app/core/local-storage.repository';
beforeEach(() => {
  TestBed.resetTestingModule();
  Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: new IDBFactory() });
});
afterEach(() => TestBed.resetTestingModule());
describe('atomic snapshot restoration in the existing IndexedDB store', () => {
  it('persists one complete replacement through a new repository without changing DB stores/version', async () => {
    const library = TestBed.inject(LibraryService);
    await library.ready;
    library.toggleFavorite('old');
    await library.flush();
    const next = { ...emptyLibrary(), favorites: ['new'], queue: ['new'] };
    await library.restore(() => next);
    expect(library.state()).toEqual(next);
    expect(await new LocalStorageRepository().read()).toEqual(next);
    const request = indexedDB.open('dumb-and-dahmer', 1);
    await new Promise<void>((resolve) => {
      request.onsuccess = () => {
        expect([...request.result.objectStoreNames]).toEqual(['library']);
        request.result.close();
        resolve();
      };
    });
  });
  it('leaves both memory and disk unchanged on an actual transaction abort and allows retry', async () => {
    const library = TestBed.inject(LibraryService);
    await library.ready;
    library.toggleFavorite('old');
    await library.flush();
    const before = structuredClone(library.state());
    const transaction = IDBDatabase.prototype.transaction;
    const spy = vi.spyOn(IDBDatabase.prototype, 'transaction').mockImplementation(function (
      this: IDBDatabase,
      ...args: Parameters<IDBDatabase['transaction']>
    ) {
      const tx = transaction.apply(this, args);
      if (args[1] === 'readwrite') queueMicrotask(() => tx.abort());
      return tx;
    });
    try {
      await expect(library.restore(() => ({ ...emptyLibrary(), favorites: ['new'] }))).rejects.toThrow();
    } finally {
      spy.mockRestore();
    }
    expect(library.state()).toEqual(before);
    expect(await new LocalStorageRepository().read()).toEqual(before);
    await library.restore(() => ({ ...before, favorites: ['retry'] }));
    expect(library.state().favorites).toEqual(['retry']);
    expect(library.repository.error()).toBe('');
  });
  it('does not overwrite a snapshot changed by another tab after hydration', async () => {
    const library = TestBed.inject(LibraryService);
    await library.ready;
    const external = { ...emptyLibrary(), favorites: ['other-tab'] };
    await new LocalStorageRepository().write(external);
    await expect(
      library.restore(() => ({ ...emptyLibrary(), favorites: ['imported'] })),
    ).rejects.toBeInstanceOf(LibraryConflictError);
    expect(await new LocalStorageRepository().read()).toEqual(external);
    expect(library.state()).toEqual(emptyLibrary());
  });
  it('defers ordinary mutations while the restore is pending and replays them afterward', async () => {
    const library = TestBed.inject(LibraryService);
    await library.ready;
    let release!: () => void;
    const original = library.repository.write.bind(library.repository);
    const gate = new Promise<void>((resolve) => (release = resolve));
    vi.spyOn(library.repository, 'write').mockImplementation(async (s, strict, expected) => {
      if (strict) await gate;
      return original(s, strict, expected);
    });
    const restoring = library.restore(() => ({ ...emptyLibrary(), favorites: ['imported'] }));
    await Promise.resolve();
    await Promise.resolve();
    library.enqueue('later');
    expect(library.state().queue).toEqual([]);
    release();
    await restoring;
    await library.flush();
    expect(library.state()).toMatchObject({ favorites: ['imported'], queue: ['later'] });
    expect(await new LocalStorageRepository().read()).toEqual(library.state());
  });
  it('preserves recency on paused saves/seeks and updates it only on actual playback', async () => {
    const library = TestBed.inject(LibraryService);
    await library.ready;
    library.savePosition('a', 10, 100);
    expect(library.record('a')?.lastPlayed).toBe(0);
    library.savePosition('a', 10, 100, 0, false, true);
    const time = library.record('a')!.lastPlayed;
    library.savePosition('a', 80, 100);
    expect(library.record('a')?.lastPlayed).toBe(time);
    expect(library.record('a')?.listenedSeconds).toBe(0);
  });
});
