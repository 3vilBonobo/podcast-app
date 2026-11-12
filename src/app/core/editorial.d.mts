import type { Catalog, CrimeCategory } from './models';
export type EditorialText = string | { el?: string; en?: string };
export interface EditorialCollection {
  id: string;
  reviewed: true;
  title: EditorialText;
  description?: EditorialText;
  episodeIds: string[];
}
export interface EditorialConfig {
  schemaVersion: 1;
  episodes: Record<string, { reviewed: true; categories?: CrimeCategory[]; tags?: string[] }>;
  collections: EditorialCollection[];
  featured: string[];
}
export function validateEditorial(value: unknown, catalog?: Catalog): EditorialConfig;
export function applyEditorial(catalog: Catalog, config: EditorialConfig): Catalog;
export function editorialText(value: EditorialText | undefined, language: string): string;
