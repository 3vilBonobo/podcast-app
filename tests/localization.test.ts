import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideTransloco } from '@jsverse/transloco';
import { I18nService } from '../src/app/core/preferences.service';
import { BundledTranslationLoader, TRANSLATIONS } from '../src/app/core/transloco-loader';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function flatten(value: Record<string, unknown>, prefix = ''): Record<string, string> {
  return Object.fromEntries(Object.entries(value).flatMap(([key, child]) => typeof child === 'string' ? [[prefix + key, child]] : Object.entries(flatten(child as Record<string, unknown>, prefix + key + '.'))));
}
beforeEach(() => { TestBed.resetTestingModule(); localStorage.clear(); TestBed.configureTestingModule({providers:[provideTransloco({config:{availableLangs:['el','en'],defaultLang:'el',fallbackLang:'el',reRenderOnLangChange:true,prodMode:true},loader:BundledTranslationLoader})]}); });
afterEach(() => TestBed.resetTestingModule());
describe('Greek and English interface', () => {
  it('has matching complete dictionaries with no empty values', () => { const el=flatten(TRANSLATIONS.el), en=flatten(TRANSLATIONS.en); expect(Object.keys(en).sort()).toEqual(Object.keys(el).sort()); expect(Object.values(en).every(value=>value.trim().length>0)).toBe(true); expect(Object.keys(en).length).toBeGreaterThan(300); });
  it('resolves every literal translation key referenced by a template', () => { const messages=flatten(TRANSLATIONS.en); function walk(dir:string):void { for(const entry of readdirSync(dir,{withFileTypes:true})){const file=join(dir,entry.name);if(entry.isDirectory())walk(file);else if(file.endsWith('.ts')){for(const match of readFileSync(file,'utf8').matchAll(/\bt\('([^']+)'/g))expect(Object.keys(messages),`${file}: ${match[1]}`).toContain(match[1]);}}} walk('src/app'); });
  it('switches the complete dictionary, navigation and document language at runtime', () => { const i18n=TestBed.inject(I18nService); expect(i18n.nav().home).toBe('Αρχική'); i18n.set('en'); expect(i18n.nav().home).toBe('Home'); expect(i18n.t('categories.serialKillers')).toBe('Serial killers'); expect(i18n.t('auth.signIn')).toBe('Sign in'); expect(document.documentElement.lang).toBe('en'); expect(localStorage.getItem('dd:language')).toBe('en'); });
  it('restores a persisted language and keeps the Greek dictionary available', () => { localStorage.setItem('dd:language','en'); const i18n=TestBed.inject(I18nService); expect(i18n.language()).toBe('en'); expect(i18n.t('shell.pause')).toBe('Pause'); i18n.set('el'); expect(i18n.t('shell.pause')).toBe('Παύση'); });
});
