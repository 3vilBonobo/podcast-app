import { Injectable, signal } from '@angular/core';
import type { LibrarySnapshot } from './models';
export const emptyLibrary = (): LibrarySnapshot => ({
  favorites: [],
  queue: [],
  records: {},
  currentId: null,
});
@Injectable({ providedIn: 'root' })
export class LocalStorageRepository {
  readonly error = signal('');
  private dbPromise?: Promise<IDBDatabase>;
  private db(): Promise<IDBDatabase> {
    return (this.dbPromise ??= new Promise((resolve, reject) => {
      const request = indexedDB.open('dumb-and-dahmer', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('library');
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => db.close();
        resolve(db);
      };
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Database blocked'));
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
      this.error.set(
        'Η τοπική αποθήκευση δεν είναι διαθέσιμη. Οι αλλαγές ισχύουν μόνο για αυτή την επίσκεψη.',
      );
      return emptyLibrary();
    }
  }
  async write(snapshot: LibrarySnapshot): Promise<void> {
    try {
      const db = await this.db();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('library', 'readwrite');
        transaction.objectStore('library').put(snapshot, 'snapshot');
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
    } catch {
      this.error.set('Οι αλλαγές δεν αποθηκεύτηκαν. Έλεγξε τον διαθέσιμο χώρο ή τις ρυθμίσεις του browser.');
    }
  }
}
