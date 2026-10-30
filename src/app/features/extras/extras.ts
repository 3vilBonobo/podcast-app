import { TranslocoDirective } from '@jsverse/transloco';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/icon';
import { EXTRAS } from './extras.data';
@Component({
  imports: [TranslocoDirective, RouterLink, IconComponent],
  template: `<ng-container *transloco="let t"
    ><div class="page">
      <div class="page-intro">
        <div>
          <p class="eyebrow accent">{{ t('extras.offTheRecord') }}</p>
          <h1>{{ t('extras.theOtherSide') }}<span class="accent">.</span></h1>
          <p class="intro-description">{{ t('extras.openADoorSeeWhatIsTakingShape') }}</p>
        </div>
        <span class="issue-note">UNDER CONSTRUCTION<br /><strong>PREVIEW EXPERIENCES</strong></span>
      </div>
      <div class="extras-grid">
        @for (extra of extras; track extra.slug) {
          <a
            [routerLink]="['/extras', extra.slug]"
            class="extra-card"
            [class]="'extra-card ' + extra.className"
            ><div class="extra-topline">
              <span class="eyebrow">EXPERIENCE {{ extra.number }}</span
              ><span class="tag">COMING SOON</span>
            </div>
            <div class="extra-illustration">
              <span class="illustration-ring"></span><dd-icon [name]="extra.icon" />
            </div>
            <p class="eyebrow">{{ extra.title }}</p>
            <h2>{{ t(extra.greek) }}</h2>
            <p>{{ t(extra.description) }}</p>
            <span class="text-button">{{ t('extras.aLookInside') }} <dd-icon name="arrow" /></span
          ></a>
        }
      </div>
      <p class="privacy-note">
        {{ t('extras.extrasAreDesignPreviewsTheyDoNotInclude') }}
      </p>
    </div></ng-container
  >`,
})
export class ExtrasComponent {
  readonly extras = EXTRAS;
}
