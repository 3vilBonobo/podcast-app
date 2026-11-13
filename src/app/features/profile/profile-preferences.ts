import { TranslocoDirective } from '@jsverse/transloco';
import { Component, inject } from '@angular/core';
import { ThemeService, I18nService } from '../../core/preferences.service';
import { AudioPlayerService } from '../../core/audio-player.service';
import { IconComponent } from '../../shared/icon';
import type { Theme, Language } from '../../core/models';
@Component({
  selector: 'dd-profile-preferences',
  imports: [TranslocoDirective, IconComponent],
  styleUrl: './profile-preferences.css',
  template: `<ng-container *transloco="let t">
    <div class="settings-grid">
      <section class="settings-panel">
        <p class="eyebrow">{{ t('profile.makeYourselfAtHome') }}</p>
        <h2>{{ t('space.appearance') }}</h2>
        <p class="muted">{{ t('profile.chooseTheLightForYourNextStory') }}</p>
        <div class="theme-grid" role="group" [attr.aria-label]="t('profile.chooseATheme')">
          @for (option of themes; track option.id) {
            <button
              class="theme-option"
              [class.chosen]="theme.choice() === option.id"
              [attr.aria-pressed]="theme.choice() === option.id"
              (click)="theme.set(option.id)"
            >
              <span [class]="'theme-swatch swatch-' + option.id"><span></span><span></span><span></span></span
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
        <label class="setting-row"
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
      </section>
      <section class="settings-panel">
        <p class="eyebrow">{{ t('profile.justTheWayYouLikeIt') }}</p>
        <h2>{{ t('profile.listeningPreferences') }}</h2>
        <label class="setting-row"
          ><span
            ><strong>{{ t('player.playbackSpeed') }}</strong
            ><small>{{ t('space.speedHelp') }}</small></span
          ><select
            [attr.aria-label]="t('player.playbackSpeed')"
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
        >
      </section>
    </div>
  </ng-container>`,
})
export class ProfilePreferencesComponent {
  readonly theme = inject(ThemeService);
  readonly i18n = inject(I18nService);
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
