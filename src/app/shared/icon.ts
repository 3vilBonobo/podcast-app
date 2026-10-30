import { Component, input } from '@angular/core';
const icons: Record<string, string> = {
  home: 'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  headphones: 'M4 14v-3a8 8 0 0 1 16 0v3M4 13H3v7h4v-7Zm16 0h1v7h-4v-7Z',
  library: 'M4 4v16M9 4v16M14 4v16M18 4l3 16',
  spark: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4M18 4h4',
  user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2',
  play: 'm9 5 11 7-11 7Z',
  pause: 'M8 5v14M16 5v14',
  heart:
    'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  chevron: 'm9 5 7 7-7 7',
  down: 'm5 9 7 7 7-7',
  close: 'm6 6 12 12M6 18 18 6',
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  queue: 'M3 6h15M3 12h12M3 18h9m7-4v8m-4-4h8',
  next: 'm5 5 11 7-11 7ZM20 5v14',
  previous: 'm19 5-11 7 11 7ZM4 5v14',
  back: 'M4 10a8 8 0 1 1 1 8M4 4v6h6',
  forward: 'M20 10a8 8 0 1 0-1 8m1-14v6h-6',
  volume: 'm11 4-6 5H2v6h3l6 5ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14',
  clock: 'M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  moon: 'M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z',
  lock: 'M6 11V7a6 6 0 0 1 12 0v4M4 11h16v11H4Zm8 4v3',
  check: 'm5 12 4 4L20 5',
  external: 'M14 3h7v7M21 3l-9 9M10 3H3v18h18v-7',
  mail: 'M3 5h18v14H3Zm0 0 9 8 9-8',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  mic: 'M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0ZM5 10v2a7 7 0 0 0 14 0v-2m-7 9v4m-4 0h8',
  folder: 'M3 5h7l2 3h9v13H3Z',
  gift: 'M3 8h18v5H3Zm2 5v8h14v-8M12 8v13M12 8s-7 0-7-4 7-3 7 4Zm0 0s7 0 7-4-7-3-7 4Z',
  settings:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM9 3l-1 3-3 1-2 3 2 2-1 3 2 3 3-1 3 4 3-3 3 1 3-4-2-2 1-4-4-1-1-3Z',
  sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z',
};
@Component({
  selector: 'dd-icon',
  host: { 'aria-hidden': 'true' },
  template: `<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path [attr.d]="path()" [attr.fill]="name() === 'play' ? 'currentColor' : null" />
  </svg>`,
  styles: [':host{display:inline-flex;width:1.2em;height:1.2em;flex-shrink:0}svg{width:100%;height:100%}'],
})
export class IconComponent {
  readonly name = input('play');
  path(): string {
    return icons[this.name()] ?? icons['spark'];
  }
}
