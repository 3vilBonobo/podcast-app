import { computed, inject, Injectable, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { TRANSLATIONS } from './transloco-loader';
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
    return value === 'noir' || value === 'archive' || value === 'after-hours' || value === 'system' ? value : 'noir';
  }
  set(theme: Theme | 'system'): void {
    this.choice.set(theme);
    savePreference('theme', theme);
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
        theme === 'archive' ? '#f2ede3' : theme === 'after-hours' ? '#101b23' : '#0c090c',
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
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly transloco = inject(TranslocoService);
  readonly language = signal<Language>(readPreference('language') === 'en' ? 'en' : 'el');
  readonly nav = computed(() => ({
    home: this.t('common.home'),
    episodes: this.t('common.episodes'),
    library: this.t('common.library'),
    extras: 'Extras',
    profile: this.t('common.profile'),
  }));
  constructor() {
    this.transloco.setTranslation(TRANSLATIONS.el, 'el');
    this.transloco.setTranslation(TRANSLATIONS.en, 'en');
    this.transloco.setActiveLang(this.language());
    document.documentElement.lang = this.language();
  }
  set(language: Language): void {
    if (language !== 'el' && language !== 'en') return;
    this.language.set(language);
    savePreference('language', language);
    document.documentElement.lang = language;
    this.transloco.setActiveLang(language);
  }
  t(key: string, params?: Record<string, unknown>): string {
    this.language();
    return this.transloco.translate(key, params);
  }
}
