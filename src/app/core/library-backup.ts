import type { LibrarySnapshot, ListeningRecord } from './models';
import { PUBLIC_FEED } from './catalog-contract.mjs';

export const MAX_BACKUP_BYTES = 2 * 1024 * 1024;
export const MAX_BACKUP_ENTRIES = 10_000;
const MAX_SECONDS = 100 * 366 * 86400;
export interface PlaybackPreferences {
  speed: number;
  volume: number;
}
export interface LibraryBackup {
  format: 'dumb-and-dahmer-library';
  version: 1;
  source: string;
  exportedAt: string;
  library: Omit<LibrarySnapshot, 'records'> & { records: ListeningRecord[] };
  playbackPreferences: PlaybackPreferences;
}
export interface ParsedBackup {
  backup: LibraryBackup;
  snapshot: LibrarySnapshot;
  duplicates: number;
}
export class BackupError extends Error {
  constructor(readonly key: string) {
    super(key);
  }
}
function invalid(): never {
  throw new BackupError('backup.invalidData');
}
const object = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);
const exact = (v: Record<string, unknown>, keys: string[]) =>
  Object.keys(v).length === keys.length && keys.every((key) => Object.hasOwn(v, key));
export function validGuid(value: unknown): value is string {
  if (
    typeof value !== 'string' ||
    !value ||
    value !== value.trim() ||
    value.length > 512 ||
    /[\u0000-\u001f\u007f]/.test(value) ||
    ['__proto__', 'constructor', 'prototype'].includes(value)
  )
    return false;
  try {
    encodeURIComponent(value);
    return true;
  } catch {
    return false;
  }
}
const seconds = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= MAX_SECONDS;
export function validPlaybackPreferences(value: unknown): value is PlaybackPreferences {
  return (
    object(value) &&
    exact(value, ['speed', 'volume']) &&
    typeof value.speed === 'number' &&
    Number.isFinite(value.speed) &&
    value.speed >= 0.5 &&
    value.speed <= 2 &&
    typeof value.volume === 'number' &&
    Number.isFinite(value.volume) &&
    value.volume >= 0 &&
    value.volume <= 1
  );
}

/** The model has a timestamp per record, but no session IDs or per-field revisions. */
export function mergeListeningRecord(local: ListeningRecord, incoming: ListeningRecord): ListeningRecord {
  const latest = incoming.lastPlayed > local.lastPlayed ? incoming : local;
  return {
    ...latest,
    completed: local.completed || incoming.completed,
    listenedSeconds: Math.max(local.listenedSeconds, incoming.listenedSeconds),
  };
}
export function mergeLibrary(local: LibrarySnapshot, incoming: LibrarySnapshot): LibrarySnapshot {
  const records = { ...local.records };
  for (const record of Object.values(incoming.records)) {
    const previous = Object.hasOwn(records, record.episodeId) ? records[record.episodeId] : undefined;
    records[record.episodeId] = previous ? mergeListeningRecord(previous, record) : { ...record };
  }
  return {
    favorites: [...new Set([...local.favorites, ...incoming.favorites])],
    queue: [...new Set([...local.queue, ...incoming.queue])],
    currentId: local.currentId ?? incoming.currentId,
    records,
  };
}
export function parseLibraryBackup(text: string): ParsedBackup {
  if (new TextEncoder().encode(text).byteLength > MAX_BACKUP_BYTES) throw new BackupError('backup.tooLarge');
  let value: unknown;
  try {
    value = JSON.parse(text.replace(/^\uFEFF/, ''));
  } catch {
    throw new BackupError('backup.invalidJson');
  }
  if (!object(value) || value.format !== 'dumb-and-dahmer-library') invalid();
  if (value.version !== 1) throw new BackupError('backup.unsupportedVersion');
  if (
    !exact(value, ['format', 'version', 'source', 'exportedAt', 'library', 'playbackPreferences']) ||
    value.source !== PUBLIC_FEED ||
    typeof value.exportedAt !== 'string' ||
    value.exportedAt.length > 40 ||
    !Number.isFinite(Date.parse(value.exportedAt)) ||
    !validPlaybackPreferences(value.playbackPreferences)
  )
    invalid();
  const library = value.library;
  if (
    !object(library) ||
    !exact(library, ['favorites', 'queue', 'records', 'currentId']) ||
    !(library.currentId === null || validGuid(library.currentId))
  )
    invalid();
  let duplicates = 0;
  const ids = (input: unknown): string[] => {
    if (!Array.isArray(input) || input.length > MAX_BACKUP_ENTRIES || !input.every(validGuid)) invalid();
    const unique = [...new Set(input as string[])];
    duplicates += input.length - unique.length;
    return unique;
  };
  const favorites = ids(library.favorites),
    queue = ids(library.queue);
  if (!Array.isArray(library.records) || library.records.length > MAX_BACKUP_ENTRIES) invalid();
  const records = new Map<string, ListeningRecord>();
  for (const item of library.records) {
    if (
      !object(item) ||
      !exact(item, ['episodeId', 'position', 'duration', 'completed', 'lastPlayed', 'listenedSeconds']) ||
      !validGuid(item.episodeId) ||
      !seconds(item.position) ||
      !seconds(item.duration) ||
      !seconds(item.listenedSeconds) ||
      typeof item.completed !== 'boolean' ||
      typeof item.lastPlayed !== 'number' ||
      !Number.isSafeInteger(item.lastPlayed) ||
      item.lastPlayed < 0 ||
      item.lastPlayed > 8.64e15 ||
      (item.duration > 0 && item.position > item.duration)
    )
      invalid();
    const record = {
      episodeId: item.episodeId,
      position: item.position,
      duration: item.duration,
      completed: item.completed,
      lastPlayed: item.lastPlayed,
      listenedSeconds: item.listenedSeconds,
    } as ListeningRecord;
    const previous = records.get(record.episodeId);
    if (previous) duplicates++;
    records.set(record.episodeId, previous ? mergeListeningRecord(previous, record) : record);
  }
  const snapshot: LibrarySnapshot = {
    favorites,
    queue,
    records: Object.fromEntries(records),
    currentId: library.currentId as string | null,
  };
  const backup: LibraryBackup = {
    format: 'dumb-and-dahmer-library',
    version: 1,
    source: PUBLIC_FEED,
    exportedAt: value.exportedAt,
    library: { ...snapshot, records: [...records.values()] },
    playbackPreferences: { speed: value.playbackPreferences.speed, volume: value.playbackPreferences.volume },
  };
  return { snapshot, backup, duplicates };
}

/** Whitelist fields: no catalog URLs, credentials, demo identity or appearance settings. */
export function createLibraryBackup(
  snapshot: LibrarySnapshot,
  preferences: PlaybackPreferences,
  now = new Date(),
): LibraryBackup {
  const data = {
    format: 'dumb-and-dahmer-library',
    version: 1,
    source: PUBLIC_FEED,
    exportedAt: now.toISOString(),
    library: {
      favorites: [...snapshot.favorites],
      queue: [...snapshot.queue],
      currentId: snapshot.currentId,
      records: Object.values(snapshot.records).map((r) => ({
        episodeId: r.episodeId,
        position: r.position,
        duration: r.duration,
        completed: r.completed,
        lastPlayed: r.lastPlayed,
        listenedSeconds: r.listenedSeconds,
      })),
    },
    playbackPreferences: { speed: preferences.speed, volume: preferences.volume },
  };
  return parseLibraryBackup(JSON.stringify(data)).backup;
}
