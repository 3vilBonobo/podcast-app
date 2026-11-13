import { Injectable, signal } from '@angular/core';

export interface SavedCatalogView {
  id: string;
  name: string;
  filters: Record<string, string>;
}

const FILTER_KEYS = ['q', 'view', 'season', 'country', 'sort', 'collection', 'category', 'tag'];
export function catalogFilters(input: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    FILTER_KEYS.flatMap((key) => {
      const value = input[key];
      return typeof value === 'string' && value.length > 0 && value.length <= 2000 ? [[key, value]] : [];
    }),
  );
}

/** Device-local shortcuts only; independent of identity and library backup format. */
@Injectable({ providedIn: 'root' })
export class SavedViewsService {
  readonly error = signal(false);
  readonly views = signal<SavedCatalogView[]>(this.read());
  private read(): SavedCatalogView[] {
    try {
      const raw = localStorage.getItem('dd:saved-views');
      if (!raw) return [];
      const data = JSON.parse(raw);
      if (data.version !== 1 || !Array.isArray(data.views)) throw new Error('Invalid saved views');
      const ids = new Set<string>();
      return data.views.map((view: SavedCatalogView) => {
        if (
          !view ||
          typeof view.id !== 'string' ||
          !view.id ||
          ids.has(view.id) ||
          typeof view.name !== 'string' ||
          !view.name.trim() ||
          view.name.length > 80 ||
          !view.filters ||
          typeof view.filters !== 'object' ||
          Array.isArray(view.filters)
        ) {
          throw new Error('Invalid saved view');
        }
        ids.add(view.id);
        return { id: view.id, name: view.name.trim(), filters: catalogFilters(view.filters) };
      });
    } catch {
      this.error.set(true);
      return [];
    }
  }
  private write(views: SavedCatalogView[]): boolean {
    try {
      localStorage.setItem('dd:saved-views', JSON.stringify({ version: 1, views }));
      this.views.set(views);
      this.error.set(false);
      return true;
    } catch {
      this.error.set(true);
      return false;
    }
  }
  save(name: string, filters: Record<string, unknown>): boolean {
    name = name.trim();
    if (!name || name.length > 80) return false;
    return this.write([...this.views(), { id: crypto.randomUUID(), name, filters: catalogFilters(filters) }]);
  }
  rename(id: string, name: string): boolean {
    name = name.trim();
    if (!name || name.length > 80 || !this.views().some((view) => view.id === id)) return false;
    return this.write(this.views().map((view) => (view.id === id ? { ...view, name } : view)));
  }
  remove(id: string): boolean {
    return this.write(this.views().filter((view) => view.id !== id));
  }
  restore(view: SavedCatalogView, index: number): boolean {
    if (this.views().some((item) => item.id === view.id)) return false;
    const views = [...this.views()];
    views.splice(index, 0, view);
    return this.write(views);
  }
}
