import type { Catalog } from './models';
export const PUBLIC_FEED: string;
export function isCatalog(value: unknown): value is Catalog;
export function normalizeCatalog(value: unknown): Catalog | null;
export function assertCompleteCatalog(value: unknown, previous?: unknown): asserts value is Catalog;
export function meaningfulCatalog(value: Catalog): string;
