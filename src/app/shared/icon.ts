import { Component, input } from '@angular/core';

/** Original 24px glyphs: murder-mansion silhouettes and separate blood-ink details. */
interface CrimeGlyph { outline: string; blood: string; }
const icons: Record<string, CrimeGlyph> = {
  home: { outline: 'M3 21V9l3-3 3 3v12m6 0V9l3-3 3 3v12M7 21V10l5-8 5 8v11M10 21v-6q2-4 4 0v6M2 21h20M5 12v2m14-2v2M11 8h2', blood: 'M18 3v3m-1-2h2M4 17v2' },
  headphones: { outline: 'M4 12v-1a8 8 0 0 1 16 0v1M3 11l4 1v7l-4-1ZM21 11l-4 1v7l4-1ZM7 8q5-5 10 0M7 20l4 2', blood: 'M18 19v2m-1-1h2M5 16v5m0 0-.7 1h1.4Z' },
  library: { outline: 'M3 4h5v16H3ZM9 3h5v17H9Zm6 2 5-1 2 15-5 1ZM4 8h3m3-1h3m4 1 3-.5M3 21h19', blood: 'M11 12v6m-1-4h2M18 15l.5 3M6 4v2' },
  spark: { outline: 'm12 2 3 3 4 1 1 4 2 3-3 3-1 4-4 1-3 1-3-3-4-1-1-4-1-3 3-3 1-4 4-1ZM9 16l6-9-1 7-3-1m-3 4 3-2', blood: 'M14 17v3m-1-2h2M7 7l1 1' },
  user: { outline: 'M18 11c0 6-2 10-6 10s-6-4-6-10 2-9 6-9 6 3 6 9ZM9 18q0-4 3-4t3 4M14.5 9a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM4 8v8m16-8v8', blood: 'm16 5 2-2m-1 4 3-1M8 17v3' },
  play: { outline: 'M7 3.5 21 12 7 20.5ZM10 8v8', blood: 'M15 16v4m0 0-.7 1h1.4ZM5 5v3' },
  pause: { outline: 'M6 3h4v13l-4 4Zm8 0h4v13l-4 4Z', blood: 'M8 18v4m8-4v3M15 6h2' },
  heart: { outline: 'M12 5C7-2 0 5 3 11l9 10 9-10c3-6-4-13-9-6ZM10 5l3 4-3 3 4 3m-5-7 4-2m-3 6 4-2', blood: 'M17 15v6m0 0-.7 1h1.4ZM5 12v3' },
  arrow: { outline: 'M3 12h17m-7-6 7 6-7 6M3 9l3 3-3 3', blood: 'M16 15v5m0 0-.7 1h1.4Z' },
  chevron: { outline: 'm8 4 10 8L8 20m-2-2 7-6-7-6', blood: 'M15 15v5' },
  down: { outline: 'm4 8 8 10 8-10M7 5l5 6 5-6', blood: 'M12 18v4m-1-2h2' },
  close: { outline: 'm5 3 16 16-3 2L3 5Zm14 0L3 19l2 2L21 5ZM7 7l2 2m8-2-2 2', blood: 'M18 19v3M5 18v3' },
  search: { outline: 'M16 9a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-2 6 7 6 1-2-6-5M8 4l2 4-3 3 4 2', blood: 'M5 12v6m0 0-.7 1h1.4ZM18 19v3' },
  queue: { outline: 'M3 3h14v4H3Zm0 7h11v4H3Zm0 7h8v4H3ZM19 11v11m-4-6h8', blood: 'M7 5v4m12 10v3' },
  next: { outline: 'm3 4 13 8-13 8ZM20 3l-2 3v14h3V3Z', blood: 'M9 17v5m11-4v4' },
  previous: { outline: 'm21 4-13 8 13 8ZM4 3l2 3v14H3V3Z', blood: 'M15 17v5m-11-4v4' },
  back: { outline: 'M3 10a9 9 0 1 1 2 8M3 3v7h7', blood: 'M20 16v5m-1-2h2M7 3v2' },
  forward: { outline: 'M21 10a9 9 0 1 0-2 8m2-15v7h-7', blood: 'M4 16v5m-1-2h2M17 3v2' },
  volume: { outline: 'm11 3-6 6H2v6h3l6 6ZM15 8q5 4 0 8m3-11q8 7 0 14M3 12h3', blood: 'M9 17v5m7-5v4' },
  clock: { outline: 'M15 2H9m3 0v3M20 14a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM12 8v6l4 2M4 5l2 2m14-2-2 2', blood: 'M9 20v3m7-2v2' },
  moon: { outline: 'M20 15A9 9 0 0 1 10 3a9 9 0 1 0 10 12ZM17 3v5m-2-2h4', blood: 'M7 18v5m0 0-.8-1h1.6ZM4 15v3' },
  lock: { outline: 'M6 10V7a6 6 0 0 1 12 0v3M4 10h16l-1 11H5Zm8 3-2 3 2 2 2-2ZM8 6v3m8-3v3', blood: 'M7 18v5m8-4v3' },
  check: { outline: 'm3 11 6 8L22 4l-3-1L9 14l-4-5Z', blood: 'M9 18v4m4-8v5' },
  external: { outline: 'M14 2h8v8m0-8L11 13M9 4H3v17h17v-7M6 7v11h11', blood: 'M7 18v5m10-6v3' },
  mail: { outline: 'M2 5h20v15H2Zm0 0 10 8L22 5M2 20l7-9m13 9-7-9M10 13l2 2 2-2', blood: 'M11 15v7m-1-2h2M5 7v3' },
  eye: { outline: 'M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12Zm15 0a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 8v8M5 3l1 3m13-3-1 3', blood: 'M5 15v6m13-6v7m-1-2h2' },
  mic: { outline: 'M7 7a5 5 0 0 1 10 0v4a5 5 0 0 1-10 0ZM7 6h10M7 9h10m-7 3h4M4 10v2a8 8 0 0 0 16 0v-2m-8 10v3m-4 0h8', blood: 'M10 3v5m4 6v4' },
  folder: { outline: 'M2 5h8l3 3h9l-2 13H2Zm1 4h17M7 3h6l2 3M8 12l4-1 3 3-4 3-3-2Z', blood: 'M11 16v6m-1-2h2M5 7v4' },
  gift: { outline: 'M3 8h18v5H3Zm2 5v8h14v-8M10 8v13m4-13v13M12 8S3 7 5 3s7 5 7 5 9-1 7-5-7 5-7 5Z', blood: 'M17 12v7m0 0-.7 1h1.4ZM8 8v3' },
  settings: { outline: 'm12 2 3 4 4-1v5l3 3-4 3 1 4-5-1-3 3-3-4-4 1v-5l-3-3 4-3-1-4 5 1ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z', blood: 'M17 17v6m-1-3h2M7 8v3' },
  sun: { outline: 'M12 1v3m0 16v3M1 12h3m16 0h3M4 4l3 3m10 10 3 3M4 20l3-3M17 7l3-3M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z', blood: 'M10 16v5m5-4v3M12 8v2' },
  knife: { outline: 'M18 2C13 3 8 7 7 13l5 2 8-11ZM7 13l-5 6 3 3 7-7M4 18l2 2', blood: 'M14 10v8m0 0-.8 1h1.6ZM11 13v5' },
  cult: { outline: 'm12 2 11 19H1ZM5 14s3-4 7-4 7 4 7 4-3 4-7 4-7-4-7-4Zm9 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z', blood: 'M12 17v6m-1-2h2' },
  robbery: { outline: 'M4 8q8-6 16 0l2 7-6 4-4-3-4 3-6-4ZM5 10l5 1-2 3-3-1Zm14 0-5 1 2 3 3-1Z', blood: 'M17 18v5M6 17v4' },
  history: { outline: 'M3 8h18L12 2ZM5 10v9m5-9v9m4-9v9m5-9v9M2 22h20M3 19h18', blood: 'M7 8v6m9 5v4' },
};
@Component({
  selector: 'dd-icon', host: { 'aria-hidden': 'true' },
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round"><path [attr.d]="glyph().outline"/><path class="blood-ink" [attr.d]="glyph().blood" stroke-width="1.6"/></svg>`,
  styles: [':host{display:inline-flex;width:1.2em;height:1.2em;flex-shrink:0}svg{width:100%;height:100%;overflow:visible}.blood-ink{stroke:var(--blood,var(--accent));fill:none}'],
})
export class IconComponent {
  readonly name = input('play');
  glyph(): CrimeGlyph { return icons[this.name()] ?? icons['spark']; }
}
