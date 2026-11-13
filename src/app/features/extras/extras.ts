import { TranslocoDirective } from '@jsverse/transloco';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/icon';
import { MachineArtComponent } from './machine-art';
import { EXTRAS } from './extras.data';
@Component({
  imports: [TranslocoDirective, RouterLink, IconComponent, MachineArtComponent],
  styleUrl: './extras.css',
  template: `<ng-container *transloco="let t"
    ><div class="page extras-page">
      <div class="page-intro">
        <div>
          <p class="eyebrow accent">{{ t('extras.offTheRecord') }}</p>
          <h1>{{ t('extras.theOtherSide') }}<span class="accent">.</span></h1>
          <p class="intro-description">{{ t('extras.introduction') }}</p>
        </div>
      </div>
      <p class="extras-disclaimer"><dd-icon name="folder" />{{ t('extras.conceptNotice') }}</p>
      <section class="extras-feature" aria-labelledby="waking-title">
        <div class="extras-feature-copy">
          <div class="extras-meta">
            <span class="eyebrow">{{ t('extras.concept') }} 001</span
            ><span class="tag">{{ t('extras.conceptPreview') }}</span>
          </div>
          <p class="eyebrow accent">{{ t('extras.doNotCloseYourEyes') }}</p>
          <h2 id="waking-title">{{ t(featured.title) }}</h2>
          <p>{{ t(featured.description) }}</p>
          <a [routerLink]="['/extras', featured.slug]" class="button primary" aria-describedby="waking-status"
            >{{ t('extras.exploreConcept') }}<dd-icon name="arrow"
          /></a>
          <p id="waking-status" class="extras-caption">{{ t('extras.awaitingApproval') }}</p>
        </div>
        <div class="extras-machine-plate" aria-hidden="true">
          <span class="eyebrow">D&amp;D / 001</span><dd-machine-art /><span class="extras-plate-rule"></span>
        </div>
      </section>
      <section class="extras-more" aria-labelledby="more-extras-title">
        <div class="extras-section-heading">
          <h2 id="more-extras-title">{{ t('extras.moreConcepts') }}</h2>
          <span class="extras-caption">{{ t('extras.notAvailable') }}</span>
        </div>
        <div class="extras-concepts">
          @for (extra of others; track extra.slug) {
            <a
              [routerLink]="['/extras', extra.slug]"
              class="extras-concept"
              [attr.aria-labelledby]="extra.slug + '-title'"
              [attr.aria-describedby]="extra.slug + '-status'"
            >
              <div class="extras-meta">
                <span class="eyebrow">{{ t('extras.concept') }} {{ extra.number }}</span
                ><dd-icon [name]="extra.icon" />
              </div>
              <h3 [id]="extra.slug + '-title'">{{ t(extra.title) }}</h3>
              <p class="extras-tagline">{{ t(extra.tagline) }}</p>
              <p>{{ t(extra.description) }}</p>
              <div class="extras-card-footer">
                <span [id]="extra.slug + '-status'" class="extras-caption">{{
                  t('extras.conceptPreview')
                }}</span
                ><dd-icon name="arrow" />
              </div>
            </a>
          }
        </div>
      </section></div
  ></ng-container>`,
})
export class ExtrasComponent {
  readonly featured = EXTRAS[0];
  readonly others = EXTRAS.slice(1);
}
