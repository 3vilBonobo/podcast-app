/** Local assets follow Angular's base href, including GitHub Pages project subdirectories. */
export function assetUrl(path: string, base = document.baseURI): string {
  return /^https?:\/\//.test(path) ? path : new URL(path.replace(/^\//, ''), base).href;
}
