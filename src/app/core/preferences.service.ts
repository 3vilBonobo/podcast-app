import { computed, Injectable, signal } from '@angular/core';
import type { DemoUser, Language, Theme } from './models';
export function readPreference(key: string): string | null {
  try {
    return localStorage.getItem(`dd:${key}`);
  } catch {
    return null;
  }
}
export function savePreference(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(`dd:${key}`);
    else localStorage.setItem(`dd:${key}`, value);
  } catch {
    /* Core listening remains usable without preferences storage. */
  }
}
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly media = window.matchMedia('(prefers-color-scheme: dark)');
  readonly choice = signal<Theme | 'system'>(this.saved());
  readonly theme = signal<Theme>('noir');
  constructor() {
    this.apply();
    this.media.addEventListener('change', () => {
      if (this.choice() === 'system') this.apply();
    });
  }
  private saved(): Theme | 'system' {
    const value = readPreference('theme');
    return value === 'noir' || value === 'archive' || value === 'after-hours' ? value : 'system';
  }
  set(theme: Theme | 'system'): void {
    this.choice.set(theme);
    savePreference('theme', theme === 'system' ? null : theme);
    this.apply();
  }
  private apply(): void {
    const choice = this.choice();
    const theme = choice === 'system' ? (this.media.matches ? 'noir' : 'archive') : choice;
    this.theme.set(theme);
    document.documentElement.dataset['theme'] = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        'content',
        theme === 'archive' ? '#f2ede3' : theme === 'after-hours' ? '#101b23' : '#171817',
      );
  }
}
@Injectable({ providedIn: 'root' })
export class MockAuthService {
  readonly user = signal<DemoUser | null>(
    readPreference('demo') === 'true' ? { displayName: 'Νυχτερινός ακροατής', demo: true } : null,
  );
  readonly guest = computed(() => this.user() === null);
  demoLogin(): void {
    this.user.set({ displayName: 'Νυχτερινός ακροατής', demo: true });
    savePreference('demo', 'true');
  }
  logout(): void {
    this.user.set(null);
    savePreference('demo', null);
  }
}
const translations = {
  el: { home: 'Αρχική', episodes: 'Επεισόδια', library: 'Βιβλιοθήκη', extras: 'Extras', profile: 'Προφίλ' },
  en: { home: 'Home', episodes: 'Episodes', library: 'Library', extras: 'Extras', profile: 'Profile' },
} as const;
@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly language = signal<Language>(readPreference('language') === 'en' ? 'en' : 'el');
  readonly nav = computed(() => translations[this.language()]);
  constructor() {
    document.documentElement.lang = this.language();
  }
  set(language: Language): void {
    this.language.set(language);
    savePreference('language', language);
    document.documentElement.lang = language;
  }
}
