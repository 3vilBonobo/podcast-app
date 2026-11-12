import { describe, expect, it } from 'vitest';
import {
  createLibraryBackup,
  parseLibraryBackup,
  mergeLibrary,
  MAX_BACKUP_BYTES,
  MAX_BACKUP_ENTRIES,
} from '../src/app/core/library-backup';
import { emptyLibrary } from '../src/app/core/local-storage.repository';
import type { ListeningRecord } from '../src/app/core/models';
const record = (id = 'Buzzsprout-1', patch: Partial<ListeningRecord> = {}): ListeningRecord => ({
  episodeId: id,
  position: 50,
  duration: 600,
  completed: false,
  lastPlayed: 1000,
  listenedSeconds: 40,
  ...patch,
});
const sample = () => ({
  favorites: ['Buzzsprout-1'],
  queue: ['Buzzsprout-2', 'Buzzsprout-1'],
  currentId: 'Buzzsprout-1',
  records: {
    'Buzzsprout-1': record(),
    'Buzzsprout-2': record('Buzzsprout-2', {
      completed: true,
      position: 600,
      lastPlayed: 2000,
      listenedSeconds: 600,
    }),
  },
});
const backup = () =>
  createLibraryBackup(sample(), { speed: 1.25, volume: 0.6 }, new Date('2026-11-12T12:00:00Z'));
describe('versioned local-library backups', () => {
  it('round-trips favorites, queue order, current selection, progress, completion, recency and preferences', () => {
    const parsed = parseLibraryBackup(JSON.stringify(backup()));
    expect(parsed.snapshot).toEqual(sample());
    expect(parsed.backup.playbackPreferences).toEqual({ speed: 1.25, volume: 0.6 });
    expect(parsed.duplicates).toBe(0);
    expect(
      parseLibraryBackup(JSON.stringify(createLibraryBackup(emptyLibrary(), { speed: 1, volume: 0.8 })))
        .snapshot,
    ).toEqual(emptyLibrary());
  });
  it('exports an explicit whitelist and never includes identity, credentials or unexpected fields', () => {
    const state = { ...sample(), password: 'secret', demo: true, token: 'secret' };
    const preferences = { speed: 1, volume: 0.8, theme: 'noir', email: 'private@example.com' };
    const exported = JSON.stringify(createLibraryBackup(state, preferences));
    for (const forbidden of ['secret', 'demo', 'token', 'theme', 'email'])
      expect(exported).not.toContain(forbidden);
  });
  it('rejects invalid JSON, unsupported versions, other feeds, unknown fields and oversized files', () => {
    expect(() => parseLibraryBackup('{')).toThrow('backup.invalidJson');
    for (const patch of [{ version: 2 }, { source: 'https://other.example/feed' }, { token: 'unexpected' }]) {
      expect(() => parseLibraryBackup(JSON.stringify({ ...backup(), ...patch }))).toThrow();
    }
    expect(() => parseLibraryBackup(' '.repeat(MAX_BACKUP_BYTES + 1))).toThrow('backup.tooLarge');
    const large = backup();
    large.library.queue = Array(MAX_BACKUP_ENTRIES + 1).fill('a');
    expect(() => parseLibraryBackup(JSON.stringify(large))).toThrow();
  });
  it.each([
    { position: -1 },
    { position: '20' },
    { position: 700 },
    { duration: null },
    { completed: 'true' },
    { lastPlayed: 'yesterday' },
    { lastPlayed: 1.5 },
    { listenedSeconds: -1 },
    { episodeId: '__proto__' },
    { episodeId: ' ' },
    { episodeId: 'bad\u0000id' },
    { lastPlayed: 9e15 },
  ])('rejects invalid record values %j without mutating input', (patch) => {
    const data = backup();
    Object.assign(data.library.records[0], patch);
    const text = JSON.stringify(data);
    expect(() => parseLibraryBackup(text)).toThrow('backup.invalidData');
    expect(JSON.stringify(data)).toBe(text);
  });
  it('requires every existing record field and valid preference types/bounds', () => {
    const data: any = backup();
    delete data.library.records[0].lastPlayed;
    expect(() => parseLibraryBackup(JSON.stringify(data))).toThrow();
    for (const preferences of [
      { speed: 3, volume: 0.5 },
      { speed: 1, volume: -1 },
      { speed: '1', volume: 0.5 },
    ]) {
      expect(() =>
        parseLibraryBackup(JSON.stringify({ ...backup(), playbackPreferences: preferences })),
      ).toThrow();
    }
  });
  it('deduplicates lists in original order and record conflicts by timestamp with sticky completion/max time', () => {
    const data = backup();
    data.library.favorites.push('Buzzsprout-1');
    data.library.queue.push('Buzzsprout-2');
    data.library.records.push(
      record('Buzzsprout-1', { position: 20, lastPlayed: 2000, completed: true, listenedSeconds: 20 }),
    );
    const parsed = parseLibraryBackup(JSON.stringify(data));
    expect(parsed.duplicates).toBe(3);
    expect(parsed.snapshot.queue).toEqual(['Buzzsprout-2', 'Buzzsprout-1']);
    expect(parsed.snapshot.records['Buzzsprout-1']).toEqual(
      record('Buzzsprout-1', { position: 20, lastPlayed: 2000, completed: true }),
    );
  });
  it('merges non-destructively, keeps local order/selection and does not inflate time on repeated imports', () => {
    const local = sample();
    const incoming = {
      favorites: ['Buzzsprout-3'],
      queue: ['Buzzsprout-3', 'Buzzsprout-2'],
      currentId: 'Buzzsprout-3',
      records: {
        'Buzzsprout-1': record('Buzzsprout-1', { position: 10, lastPlayed: 3000, listenedSeconds: 30 }),
        'Buzzsprout-3': record('Buzzsprout-3'),
      },
    };
    const before = structuredClone(local);
    const merged = mergeLibrary(local, incoming);
    expect(merged.favorites).toEqual(['Buzzsprout-1', 'Buzzsprout-3']);
    expect(merged.queue).toEqual(['Buzzsprout-2', 'Buzzsprout-1', 'Buzzsprout-3']);
    expect(merged.currentId).toBe('Buzzsprout-1');
    expect(merged.records['Buzzsprout-1']).toEqual(
      record('Buzzsprout-1', { position: 10, lastPlayed: 3000 }),
    );
    expect(mergeLibrary(merged, incoming)).toEqual(merged);
    expect(local).toEqual(before);
  });
  it('keeps local progress on equal timestamps, preserves completion and opaque unavailable GUIDs', () => {
    const local = sample(),
      incoming = sample();
    incoming.records['Buzzsprout-1'] = record('Buzzsprout-1', {
      position: 5,
      completed: true,
      listenedSeconds: 60,
    });
    const result = mergeLibrary(local, incoming);
    expect(result.records['Buzzsprout-1']).toEqual(
      record('Buzzsprout-1', { completed: true, listenedSeconds: 60 }),
    );
    const data = backup();
    data.library.favorites.push('future/opaque:guid');
    expect(parseLibraryBackup(JSON.stringify(data)).snapshot.favorites).toContain('future/opaque:guid');
  });
});
