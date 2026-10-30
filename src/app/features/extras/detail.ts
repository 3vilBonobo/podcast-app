import { TranslocoDirective } from '@jsverse/transloco';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { IconComponent } from '../../shared/icon';
import { EmptyStateComponent } from '../../shared/empty-state';
import { EXTRAS } from './extras.data';
@Component({
  imports: [TranslocoDirective, RouterLink, IconComponent, EmptyStateComponent],
  template: `<ng-container *transloco="let t"><div class="page">
    <a routerLink="/extras" class="back-link">{{ t('extras.backToExtras') }}</a>
    @if (extra(); as extra) {
      <div [class]="'experience-detail ' + extra.className">
        <div class="extra-topline">
          <span class="eyebrow">EXPERIENCE {{ extra.number }} / {{ extra.title }}</span
          ><span class="tag">COMING SOON</span>
        </div>
        <div class="experience-art">
          <span class="orbit-ring"></span><span class="orbit-ring inner"></span
          ><dd-icon [name]="extra.icon" />
        </div>
        <p class="eyebrow accent">{{ extra.title }}</p>
        <h1>{{ t(extra.greek) }}</h1>
        <p>{{ t(extra.description) }}</p>
        <button
          class="button secondary"
          (click)="revealed.set(!revealed())"
          [attr.aria-expanded]="revealed()"
          aria-controls="experience-preview"
        >
          <dd-icon name="lock" /> {{ revealed() ? t('extras.closeTheFile') : t('extras.openTheFile') }}
        </button>
        @if (revealed()) {
          <div id="experience-preview" class="preview-note" role="status">
            <p class="eyebrow">{{ t('extras.designPreviewFile') }} {{ extra.number }}</p>
            <h2>
              {{
                extra.slug === 'waking-machine'
                  ? t('extras.theMachineRemainsSilent')
                  : t('extras.theFileIsWaitingForItsStory')
              }}
            </h2>
            <p>
              {{ t('extras.thisIsAnInteractiveDesignPreviewTheExperience') }}
            </p>
            <a routerLink="/episodes" class="text-button"
              >{{ t('extras.untilThenListenToATrueStory') }} <dd-icon name="arrow"
            /></a>
          </div>
        }
      </div>
    } @else {
      <dd-empty title="extras.thisDoorLeadsNowhere" link="/extras" action="extras.backToExtras136" />
    }
  </div></ng-container>`,
})
export class ExtraDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  readonly extra = computed(() => EXTRAS.find((e) => e.slug === this.params().get('slug')));
  readonly revealed = signal(false);
}
