import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { IconComponent } from '../../shared/icon';
import { EmptyStateComponent } from '../../shared/empty-state';
import { EXTRAS } from './extras.data';
@Component({
  imports: [RouterLink, IconComponent, EmptyStateComponent],
  template: `<div class="page">
    <a routerLink="/extras" class="back-link">← Πίσω στα Extras</a>
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
        <h1>{{ extra.greek }}</h1>
        <p>{{ extra.description }}</p>
        <button
          class="button secondary"
          (click)="revealed.set(!revealed())"
          [attr.aria-expanded]="revealed()"
          aria-controls="experience-preview"
        >
          <dd-icon name="lock" /> {{ revealed() ? 'Κλείσε τον φάκελο' : 'Άνοιξε τον φάκελο' }}
        </button>
        @if (revealed()) {
          <div id="experience-preview" class="preview-note" role="status">
            <p class="eyebrow">DESIGN PREVIEW · ΦΑΚΕΛΟΣ {{ extra.number }}</p>
            <h2>
              {{
                extra.slug === 'waking-machine'
                  ? 'Η μηχανή παραμένει σιωπηλή.'
                  : 'Ο φάκελος περιμένει την ιστορία του.'
              }}
            </h2>
            <p>
              Αυτή είναι μια διαδραστική προεπισκόπηση της εφαρμογής. Η εμπειρία δεν έχει κυκλοφορήσει ακόμα.
              Δεν χρειάζεται εγγραφή ή συνδρομή.
            </p>
            <a routerLink="/episodes" class="text-button"
              >Μέχρι τότε, άκου μια αληθινή ιστορία <dd-icon name="arrow"
            /></a>
          </div>
        }
      </div>
    } @else {
      <dd-empty title="Αυτή η πόρτα δεν οδηγεί κάπου." link="/extras" action="Πίσω στα Extras" />
    }
  </div>`,
})
export class ExtraDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  readonly extra = computed(() => EXTRAS.find((e) => e.slug === this.params().get('slug')));
  readonly revealed = signal(false);
}
