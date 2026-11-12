import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { IDBFactory } from 'fake-indexeddb';
import { LibraryBackupPanelComponent } from '../src/app/features/profile/library-backup-panel';
import { LibraryService } from '../src/app/core/library.service';
import { AudioPlayerService } from '../src/app/core/audio-player.service';
import { PodcastService } from '../src/app/core/podcast.service';
import { createLibraryBackup, MAX_BACKUP_BYTES } from '../src/app/core/library-backup';
import { emptyLibrary, LocalStorageRepository } from '../src/app/core/local-storage.repository';
let library: LibraryService, panel: LibraryBackupPanelComponent;
const player = {
  pause: vi.fn(),
  prepareLibraryRestore: vi.fn(),
  restoreLibrarySelection: vi.fn(),
  restorePreference: vi.fn().mockReturnValue(true),
  speed: signal(1),
  volume: signal(0.8),
};
const file = (text: string) => ({ size: text.length, text: async () => text });
const backup = () =>
  JSON.stringify(
    createLibraryBackup(
      { ...emptyLibrary(), favorites: ['imported'], queue: ['unavailable'] },
      { speed: 1.25, volume: 0.4 },
    ),
  );
beforeEach(async () => {
  TestBed.resetTestingModule();
  Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: new IDBFactory() });
  vi.clearAllMocks();
  TestBed.configureTestingModule({
    providers: [
      { provide: AudioPlayerService, useValue: player },
      { provide: PodcastService, useValue: { find: () => undefined } },
    ],
  });
  library = TestBed.inject(LibraryService);
  await library.ready;
  library.toggleFavorite('local');
  await library.flush();
  panel = TestBed.runInInjectionContext(() => new LibraryBackupPanelComponent());
});
afterEach(() => TestBed.resetTestingModule());
describe('backup preview and confirmation boundary', () => {
  it('previews without writing, defaults to merge, and requires explicit replacement acknowledgement', async () => {
    await panel.readFile(file(backup()));
    expect(panel.mode()).toBe('merge');
    expect(panel.unavailable()).toBe(2);
    expect(library.state().favorites).toEqual(['local']);
    panel.setMode('replace');
    await panel.applyImport();
    expect(player.pause).not.toHaveBeenCalled();
    expect(library.state().favorites).toEqual(['local']);
    panel.confirmed.set(true);
    await panel.applyImport();
    expect(library.state().favorites).toEqual(['imported']);
    expect(await new LocalStorageRepository().read()).toEqual(library.state());
    expect(player.restorePreference).not.toHaveBeenCalled();
    expect(panel.preferences()).toEqual({ speed: 1.25, volume: 0.4 });
    panel.restorePreference('speed');
    expect(player.restorePreference).toHaveBeenCalledWith('speed', 1.25);
  });
  it('merges existing state at apply time and keeps the preview cancellable without writes', async () => {
    await panel.readFile(file(backup()));
    panel.cancelDialog();
    expect(panel.preview()).toBeNull();
    expect(library.state().favorites).toEqual(['local']);
    await panel.readFile(file(backup()));
    library.toggleFavorite('during-preview');
    await panel.applyImport();
    expect(library.state().favorites).toEqual(['local', 'during-preview', 'imported']);
    expect(panel.message()).toBe('backup.restored');
  });
  it('rejects invalid/oversized/unreadable files before any library mutation', async () => {
    for (const input of [
      file('{'),
      file('{"format":"dumb-and-dahmer-library","version":2}'),
      { size: MAX_BACKUP_BYTES + 1, text: vi.fn() },
      {
        size: 1,
        text: async () => {
          throw new Error('Read failed');
        },
      },
    ]) {
      await panel.readFile(input);
      expect(panel.preview()).toBeNull();
      expect(panel.error()).not.toBe('');
      expect(library.state().favorites).toEqual(['local']);
    }
    expect(player.pause).not.toHaveBeenCalled();
  });
  it('keeps failed imports unapplied and prevents Escape cancellation during the transaction', async () => {
    await panel.readFile(file(backup()));
    vi.spyOn(library.repository, 'write').mockRejectedValueOnce(new Error('Storage failure'));
    await panel.applyImport();
    expect(panel.error()).toBe('backup.restoreFailed');
    expect(panel.preview()).not.toBeNull();
    expect(library.state().favorites).toEqual(['local']);
    panel.busy.set(true);
    const event = new Event('cancel', { cancelable: true });
    panel.cancelDialog(event);
    expect(event.defaultPrevented).toBe(true);
    expect(panel.preview()).not.toBeNull();
  });
  it('reports a committed library accurately even if the media capability fails afterward', async () => {
    await panel.readFile(file(backup()));
    player.restoreLibrarySelection.mockImplementationOnce(() => {
      throw new Error('Media unavailable');
    });
    await panel.applyImport();
    expect(panel.error()).toBe('');
    expect(panel.message()).toBe('backup.restoredPlayerError');
    expect((await new LocalStorageRepository().read()).favorites).toEqual(['local', 'imported']);
  });
  it('does not resume stale player writes or overwrite another tab after a restore conflict', async () => {
    await panel.readFile(file(backup()));
    const external = { ...emptyLibrary(), favorites: ['other-tab'] };
    await new LocalStorageRepository().write(external);
    await panel.applyImport();
    expect(panel.error()).toBe('backup.concurrentChange');
    expect(player.restoreLibrarySelection).not.toHaveBeenCalled();
    library.toggleFavorite('must-not-overwrite');
    await library.flush();
    expect(await new LocalStorageRepository().read()).toEqual(external);
  });
  it('ignores a file read completed after the component was destroyed', async () => {
    let resolve!: (value: string) => void;
    const reading = panel.readFile({ size: 10, text: () => new Promise((r) => (resolve = r)) });
    TestBed.resetTestingModule();
    resolve(backup());
    await reading;
    expect(panel.preview()).toBeNull();
  });
});
