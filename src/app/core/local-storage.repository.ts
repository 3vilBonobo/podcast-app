import { Injectable, signal } from '@angular/core';
import type { LibrarySnapshot } from './models';
export const emptyLibrary = (): LibrarySnapshot => ({
  favorites: [],
  queue: [],
  records: {},
  currentId: null,
});
export class LibraryConflictError extends Error {}
const fingerprint = (s: LibrarySnapshot) =>
  JSON.stringify([
    s.favorites,
    s.queue,
    s.currentId,
    Object.keys(s.records)
      .sort()
      .map((id) => {
        const r = s.records[id];
        return [id, r.position, r.duration, r.completed, r.lastPlayed, r.listenedSeconds];
      }),
  ]);
@Injectable({ providedIn: 'root' })
export class LocalStorageRepository {
  readonly error = signal('');
  private dbPromise?: Promise<IDBDatabase>;
  private db(): Promise<IDBDatabase> {
    return (this.dbPromise ??= new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('dumb-and-dahmer', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('library');
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          this.dbPromise = undefined;
        };
        resolve(db);
      };
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Database blocked'));
    }).catch((error) => {
      this.dbPromise = undefined;
      throw error;
    }));
  }
  async read(): Promise<LibrarySnapshot> {
    try {
      const db = await this.db();
      return await new Promise((resolve, reject) => {
        const transaction = db.transaction('library', 'readonly');
        const request = transaction.objectStore('library').get('snapshot');
        request.onsuccess = () => {
          const value = request.result as Partial<LibrarySnapshot> | undefined;
          resolve({ ...emptyLibrary(), ...value });
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      this.error.set('common.localStorageIsUnavailableChangesWillOnlyLast');
      return emptyLibrary();
    }
  }
  async write(snapshot: LibrarySnapshot, strict = false, expected?: LibrarySnapshot): Promise<void> {
    try {
      const db = await this.db();
      let conflict = false;
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('library', 'readwrite');
        const store = transaction.objectStore('library');
        if (expected) {
          const request = store.get('snapshot');
          request.onsuccess = () => {
            try {
              if (fingerprint({ ...emptyLibrary(), ...request.result }) !== fingerprint(expected)) {
                conflict = true;
                transaction.abort();
              } else store.put(snapshot, 'snapshot');
            } catch {
              transaction.abort();
            }
          };
        } else store.put(snapshot, 'snapshot');
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () =>
          reject(
            conflict
              ? new LibraryConflictError('Library changed in another tab')
              : (transaction.error ?? new Error('Library transaction aborted')),
          );
      });
      this.error.set('');
    } catch (error) {
      this.error.set('common.yourChangesCouldNotBeSavedCheckAvailable');
      if (strict) throw error;
    }
  }
}
