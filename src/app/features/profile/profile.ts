import { TranslocoDirective } from '@jsverse/transloco';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService, MockAuthService, I18nService } from '../../core/preferences.service';
import { LibraryService } from '../../core/library.service';
import { AudioPlayerService } from '../../core/audio-player.service';
import { IconComponent } from '../../shared/icon';
import type { Theme, Language } from '../../core/models';
import { LibraryBackupPanelComponent } from './library-backup-panel';
@Component({
  imports: [TranslocoDirective, RouterLink, IconComponent, LibraryBackupPanelComponent],
  template: `<ng-container *transloco="let t"
    ><div class="page">
      <div class="page-intro">
        <div>
          <p class="eyebrow accent">{{ t('profile.makeYourselfAtHomeAlmost') }}</p>
          <h1>{{ t('profile.yourSpace') }}<span class="accent">.</span></h1>
          <p class="intro-description">{{ t('profile.yourStoriesOnYourTerms') }}</p>
        </div>
      </div>
      <section class="profile-card">
        <div class="avatar large-avatar">{{ auth.guest() ? t('shell.g') : t('shell.n') }}</div>
        <div>
          <p class="eyebrow accent">{{ auth.guest() ? 'GUEST LISTENER' : 'LOCAL DEMO ACCOUNT' }}</p>
          <h2>{{ auth.guest() ? t('profile.welcomeGuest') : t('common.nightListener') }}</h2>
          <p>
            {{
              auth.guest()
                ? t('profile.listeningNeedsNoIntroduction')
                : t('profile.aDemoProfileOnlyOnThisDevice')
            }}
          </p>
        </div>
        @if (auth.guest()) {
          <a routerLink="/auth/login" class="button secondary"
            >{{ t('profile.getToKnowUs') }} <dd-icon name="arrow"
          /></a>
        } @else {
          <button class="button secondary" (click)="auth.logout()">{{ t('profile.leaveTheDemo') }}</button>
        }
      </section>
      <div class="stats-grid">
        <div>
          <span class="eyebrow">{{ t('profile.minutesListened') }}</span
          ><strong>{{ library.minutes() }}</strong
          ><span>{{ t('profile.actualListeningTime') }}</span>
        </div>
        <div>
          <span class="eyebrow">{{ t('profile.casesClosed') }}</span
          ><strong>{{ library.completed().length }}</strong
          ><span>{{ t('profile.completedEpisodes') }}</span>
        </div>
        <a routerLink="/library"
          ><span class="eyebrow">{{ t('profile.closeToTheHeart') }}</span
          ><strong>{{ library.state().favorites.length }}</strong
          ><span>{{ t('profile.favoriteStories') }} <dd-icon name="arrow" /></span
        ></a>
      </div>
      @if (!library.records().length) {
        <p class="privacy-note">{{ t('profile.theCountersStartAtZeroYourFirstListen') }}</p>
      }
      <div class="settings-grid">
        <section class="settings-panel">
          <p class="eyebrow">MAKE YOURSELF AT HOME</p>
          <h2>{{ t('profile.yourOwnAtmosphere') }}</h2>
          <p class="muted">{{ t('profile.chooseTheLightForYourNextStory') }}</p>
          <div class="theme-grid" role="group" [attr.aria-label]="t('profile.chooseATheme')">
            @for (option of themes; track option.id) {
              <button
                class="theme-option"
                [class.chosen]="theme.choice() === option.id"
                [attr.aria-pressed]="theme.choice() === option.id"
                (click)="theme.set(option.id)"
              >
                <span [class]="'theme-swatch swatch-' + option.id"
                  ><span></span><span></span><span></span></span
                ><strong>{{ option.name }}</strong
                ><small>{{ t(option.description) }}</small>
                @if (theme.choice() === option.id) {
                  <dd-icon name="check" />
                }
              </button>
            }
          </div>
          <button
            class="text-button system-theme"
            (click)="theme.set('system')"
            [attr.aria-pressed]="theme.choice() === 'system'"
          >
            <dd-icon [name]="theme.choice() === 'system' ? 'check' : 'sun'" />
            {{ t('profile.followTheSystem') }}
          </button>
        </section>
        <section class="settings-panel">
          <p class="eyebrow">JUST THE WAY YOU LIKE IT</p>
          <h2>{{ t('profile.listeningPreferences') }}</h2>
          <label class="setting-row"
            ><span
              ><strong>{{ t('player.playbackSpeed') }}</strong
              ><small>{{ t('profile.savedForYourNextListeningSessions') }}</small></span
            ><select
              [attr.aria-label]="t('profile.defaultPlaybackSpeed')"
              [value]="player.speed()"
              (change)="player.setSpeed(+$any($event.target).value)"
            >
              @if (!speeds.includes(player.speed())) {
                <option [value]="player.speed()">{{ player.speed() }}×</option>
              }
              @for (speed of speeds; track speed) {
                <option [value]="speed" [selected]="speed === player.speed()">{{ speed }}×</option>
              }
            </select></label
          ><label class="setting-row"
            ><span
              ><strong>{{ t('profile.interfaceLanguage') }}</strong
              ><small>{{ t('profile.greekAndEnglishInterfaceEpisodesStayInTheir') }}</small></span
            ><select
              [attr.aria-label]="t('profile.interfaceLanguage')"
              [value]="i18n.language()"
              (change)="setLanguage($any($event.target).value)"
            >
              <option value="el">{{ t('profile.greek') }}</option>
              <option value="en">English</option>
            </select></label
          >
          <div class="setting-row">
            <span
              ><strong>{{ t('home.yourLibrary') }}</strong
              ><small>{{ t('profile.localStorageWithIndexeddb') }}</small></span
            ><span class="tag">ON DEVICE</span>
          </div>
        </section>
      </div>
      <dd-library-backup />
      <section class="settings-panel account-panel">
        <div>
          <p class="eyebrow">{{ t('profile.yourAccount') }}</p>
          <h2>{{ t('profile.everyStoryHasANextChapter') }}</h2>
          <p>
            {{ t('profile.realAccountsAndCrossDeviceSyncWillArrive') }}
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          @if (auth.guest()) {
            <button class="button secondary" (click)="auth.demoLogin()">
              {{ t('auth.enterDemoAccount') }}
            </button>
          }
          <a routerLink="/plus" class="button primary"
            >{{ t('episodes.aboutPlus') }} <dd-icon name="arrow"
          /></a>
        </div>
      </section></div
  ></ng-container>`,
})
export class ProfileComponent {
  readonly theme = inject(ThemeService);
  readonly auth = inject(MockAuthService);
  readonly i18n = inject(I18nService);
  readonly library = inject(LibraryService);
  readonly player = inject(AudioPlayerService);
  readonly speeds = [0.75, 1, 1.25, 1.5, 1.75, 2];
  readonly themes: { id: Theme; name: string; description: string }[] = [
    { id: 'noir', name: 'Noir', description: 'profile.blackVelvetBloodRedAccents' },
    { id: 'archive', name: 'Archive', description: 'profile.aStoryInTheLight' },
    { id: 'after-hours', name: 'After Hours', description: 'profile.forAfterMidnight' },
  ];
  setLanguage(value: string): void {
    this.i18n.set(value as Language);
  }
}
