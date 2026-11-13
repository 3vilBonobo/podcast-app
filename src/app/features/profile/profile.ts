import { TranslocoDirective } from '@jsverse/transloco';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MockAuthService } from '../../core/preferences.service';
import { LibraryService } from '../../core/library.service';
import { SavedViewsService } from '../../core/saved-views.service';
import { IconComponent } from '../../shared/icon';
import { LibraryBackupPanelComponent } from './library-backup-panel';
import { ProfilePreferencesComponent } from './profile-preferences';
import { SavedViewsPanelComponent } from './saved-views-panel';
@Component({
  imports: [
    TranslocoDirective,
    RouterLink,
    IconComponent,
    LibraryBackupPanelComponent,
    ProfilePreferencesComponent,
    SavedViewsPanelComponent,
  ],
  styleUrl: './profile.css',
  template: `<ng-container *transloco="let t"
    ><div class="page personal-space">
      <div class="page-intro">
        <div>
          <p class="eyebrow accent">{{ t('profile.makeYourselfAtHomeAlmost') }}</p>
          <h1>{{ t('profile.yourSpace') }}<span class="accent">.</span></h1>
          <p class="intro-description">{{ t('profile.yourStoriesOnYourTerms') }}</p>
        </div>
      </div>
      <section class="space-identity" [attr.aria-label]="t('profile.yourAccount')">
        <div class="avatar" aria-hidden="true">{{ auth.guest() ? t('shell.g') : t('shell.n') }}</div>
        <div>
          <strong>{{ t(auth.guest() ? 'profile.guestListener' : 'profile.localDemoAccount') }}</strong>
          <p>{{ t('space.deviceNote') }}</p>
        </div>
        <span class="tag"><dd-icon name="lock" />{{ t('profile.onDevice') }}</span>
      </section>
      <div class="space-layout">
        <nav class="space-nav" [attr.aria-label]="t('space.navigation')">
          @for (item of sections; track item.id) {
            <a
              routerLink="/profile"
              [queryParams]="item.id === 'overview' ? {} : { section: item.id }"
              [attr.aria-current]="section() === item.id ? 'page' : null"
            >
              <dd-icon [name]="item.icon" /><span>{{ t(item.label) }}</span
              ><dd-icon name="chevron"
            /></a>
          }
        </nav>
        <div class="space-content">
          @switch (section()) {
            @case ('overview') {
              <section class="space-heading">
                <p class="eyebrow accent">{{ t('space.yourTrail') }}</p>
                <h2>{{ t('space.overview') }}</h2>
                <p>{{ t('space.overviewHelp') }}</p>
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
                <a routerLink="/library" [queryParams]="{ tab: 'favorites' }"
                  ><span class="eyebrow">{{ t('profile.closeToTheHeart') }}</span
                  ><strong>{{ library.state().favorites.length }}</strong
                  ><span>{{ t('profile.favoriteStories') }} <dd-icon name="arrow" /></span
                ></a>
              </div>
              @if (!library.records().length) {
                <p class="privacy-note">{{ t('profile.theCountersStartAtZeroYourFirstListen') }}</p>
              }

              <div class="space-shortcuts">
                <a routerLink="/library" class="space-shortcut"
                  ><dd-icon name="library" /><span
                    ><strong>{{ t('home.yourLibrary') }}</strong
                    ><small>{{ t('space.libraryHelp') }}</small></span
                  ><dd-icon name="arrow"
                /></a>
                <a routerLink="/profile" [queryParams]="{ section: 'presets' }" class="space-shortcut"
                  ><dd-icon name="folder" /><span
                    ><strong>{{ t('space.presets') }}</strong
                    ><small>{{ t('space.viewsHelp') }}</small></span
                  ><dd-icon name="arrow"
                /></a>
              </div>
              @if (views.views().length) {
                <section class="space-saved-preview">
                  <h3>{{ t('space.savedViews') }}</h3>
                  @for (view of views.views().slice(0, 3); track view.id) {
                    <a routerLink="/episodes" [queryParams]="view.filters" class="text-button"
                      >{{ view.name }} <dd-icon name="arrow"
                    /></a>
                  }
                </section>
              }
            }
            @case ('preferences') {
              <section class="space-heading">
                <p class="eyebrow accent">{{ t('profile.makeYourselfAtHome') }}</p>
                <h2>{{ t('space.preferences') }}</h2>
                <p>{{ t('space.preferencesHelp') }}</p>
              </section>
              <dd-profile-preferences />
            }
            @case ('presets') {
              <dd-saved-views-panel />
            }
            @case ('data') {
              <section class="space-heading">
                <p class="eyebrow accent">{{ t('profile.onDevice') }}</p>
                <h2>{{ t('space.data') }}</h2>
                <p>{{ t('space.dataHelp') }}</p>
              </section>
              <dd-library-backup />
              <p class="privacy-note">{{ t('space.backupScope') }}</p>
            }
            @case ('account') {
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
                    <a routerLink="/auth/login" class="button secondary">
                      {{ t('profile.getToKnowUs') }} <dd-icon name="arrow" />
                    </a>
                    <button class="button secondary" (click)="auth.demoLogin()">
                      {{ t('auth.enterDemoAccount') }}
                    </button>
                  }
                  @if (!auth.guest()) {
                    <button class="button secondary" (click)="auth.logout()">
                      {{ t('profile.leaveTheDemo') }}
                    </button>
                  }
                  <a routerLink="/plus" class="button primary"
                    >{{ t('episodes.aboutPlus') }} <dd-icon name="arrow"
                  /></a>
                </div>
              </section>
            }
          }
        </div>
      </div></div
  ></ng-container>`,
})
export class ProfileComponent {
  readonly auth = inject(MockAuthService);
  readonly library = inject(LibraryService);
  readonly views = inject(SavedViewsService);
  readonly sections = [
    { id: 'overview', icon: 'user', label: 'space.overview' },
    { id: 'preferences', icon: 'headphones', label: 'space.preferences' },
    { id: 'presets', icon: 'folder', label: 'space.presets' },
    { id: 'data', icon: 'backup', label: 'space.data' },
    { id: 'account', icon: 'lock', label: 'space.account' },
  ];
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  readonly section = computed(() => {
    const section = this.params().get('section');
    return this.sections.some((item) => item.id === section) ? section : 'overview';
  });
}
