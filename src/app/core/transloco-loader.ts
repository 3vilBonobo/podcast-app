import { Injectable } from '@angular/core';
import { TranslocoLoader, Translation } from '@jsverse/transloco';
import { of } from 'rxjs';
import el from '../i18n/el.json';
import en from '../i18n/en.json';

/** Both dictionaries are bundled, so language switching also works offline. */
@Injectable({ providedIn: 'root' })
export class BundledTranslationLoader implements TranslocoLoader {
  getTranslation(language: string) {
    return of<Translation>(language === 'en' ? en : el);
  }
}
export const TRANSLATIONS = { el, en };
