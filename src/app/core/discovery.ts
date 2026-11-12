/** Greek search treats accents, letter case and final sigma as equivalent. */
export function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('el').replace(/ς/g, 'σ').trim();
}

export function matchesSearch(query: string, ...fields: string[]): boolean {
  const haystack = normalizeSearch(fields.join(' '));
  return normalizeSearch(query)
    .split(/\s+/)
    .every((word) => haystack.includes(word));
}
