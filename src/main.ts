import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, TitleStrategy, withInMemoryScrolling } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { inject, isDevMode, provideAppInitializer } from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';
import { BundledTranslationLoader } from './app/core/transloco-loader';
import { LocalizedTitleStrategy } from './app/core/localized-title.strategy';
import { I18nService } from './app/core/preferences.service';
import { AppComponent } from './app/app';
import { routes } from './app/app.routes';
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideTransloco({config:{availableLangs:['el','en'],defaultLang:'el',fallbackLang:'el',reRenderOnLangChange:true,prodMode:!isDevMode()},loader:BundledTranslationLoader}),
    provideAppInitializer(() => { inject(I18nService); }),
    { provide: TitleStrategy, useClass: LocalizedTitleStrategy },
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
}).catch(console.error);
