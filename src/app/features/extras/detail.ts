import { TranslocoDirective } from '@jsverse/transloco';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { IconComponent } from '../../shared/icon';
import { EmptyStateComponent } from '../../shared/empty-state';
import { MachineArtComponent } from './machine-art';
import { EXTRAS } from './extras.data';
@Component({
  imports: [TranslocoDirective, RouterLink, IconComponent, EmptyStateComponent, MachineArtComponent],
  styleUrl: './extras.css',
  template: `<ng-container *transloco="let t"
    ><div class="page extras-page">
      <a routerLink="/extras" class="back-link">{{ t('extras.backToExtras') }}</a>
      @for (extra of selected(); track extra.slug) {
        <article class="extras-detail" aria-labelledby="concept-title">
          <div class="extras-detail-art" aria-hidden="true">
            @if (extra.slug === 'waking-machine') {
              <dd-machine-art />
            } @else {
              <div class="extras-file-art">
                <span>{{ extra.number }}</span
                ><dd-icon [name]="extra.icon" /><span class="extras-plate-rule"></span>
              </div>
            }
          </div>
          <div class="extras-detail-copy">
            <div class="extras-meta">
              <span class="eyebrow">{{ t('extras.concept') }} {{ extra.number }}</span
              ><span class="tag">{{ t('extras.conceptPreview') }}</span>
            </div>
            <p class="eyebrow accent">{{ t(extra.tagline) }}</p>
            <h1 id="concept-title">{{ t(extra.title) }}</h1>
            <p class="intro-description">{{ t(extra.description) }}</p>
            <section class="extras-availability" aria-labelledby="availability-title">
              <h2 id="availability-title">{{ t('extras.notAvailable') }}</h2>
              <p>{{ t(extra.pending) }}</p>
            </section>
            <details class="extras-notes">
              <summary>{{ t('extras.aboutConcept') }}</summary>
              <p>{{ t('extras.conceptNotice') }}</p>
              <p>{{ t('extras.noReleaseDate') }}</p>
            </details>
            <a routerLink="/episodes" class="button secondary"
              >{{ t('extras.browseEpisodes') }}<dd-icon name="arrow"
            /></a>
          </div>
        </article>
        <nav class="extras-related" [attr.aria-label]="t('extras.otherConcepts')">
          <h2>{{ t('extras.otherConcepts') }}</h2>
          <div>
            @for (other of extras; track other.slug) {
              @if (other.slug !== extra.slug) {
                <a [routerLink]="['/extras', other.slug]">{{ t(other.title) }}<dd-icon name="arrow" /></a>
              }
            }
          </div>
        </nav>
      } @empty {
        <dd-empty
          [headingLevel]="1"
          title="extras.thisDoorLeadsNowhere"
          link="/extras"
          action="extras.backToExtras136"
        />
      }</div
  ></ng-container>`,
})
export class ExtraDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  // Keying the view by slug also resets native disclosure state on reused detail routes.
  readonly selected = computed(() => EXTRAS.filter((e) => e.slug === this.params().get('slug')));
  readonly extras = EXTRAS;
}
