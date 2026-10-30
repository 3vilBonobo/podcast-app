import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/icon';
import { EXTRAS } from './extras.data';
@Component({
  imports: [RouterLink, IconComponent],
  template: `<div class="page">
    <div class="page-intro">
      <div>
        <p class="eyebrow accent">ΕΚΤΟΣ ΗΧΟΓΡΑΦΗΣΗΣ</p>
        <h1>Η άλλη πλευρά<span class="accent">.</span></h1>
        <p class="intro-description">Άνοιξε μια πόρτα. Δες τι ετοιμάζεται πίσω της.</p>
      </div>
      <span class="issue-note">UNDER CONSTRUCTION<br /><strong>PREVIEW EXPERIENCES</strong></span>
    </div>
    <div class="extras-grid">
      @for (extra of extras; track extra.slug) {
        <a [routerLink]="['/extras', extra.slug]" class="extra-card" [class]="'extra-card ' + extra.className"
          ><div class="extra-topline">
            <span class="eyebrow">EXPERIENCE {{ extra.number }}</span
            ><span class="tag">COMING SOON</span>
          </div>
          <div class="extra-illustration">
            <span class="illustration-ring"></span><dd-icon [name]="extra.icon" />
          </div>
          <p class="eyebrow">{{ extra.title }}</p>
          <h2>{{ extra.greek }}</h2>
          <p>{{ extra.description }}</p>
          <span class="text-button">Μια ματιά μέσα <dd-icon name="arrow" /></span
        ></a>
      }
    </div>
    <p class="privacy-note">
      Τα Extras είναι προεπισκοπήσεις σχεδιασμού. Δεν περιλαμβάνουν κλειδωμένο περιεχόμενο, πληρωμές ή ενεργές
      ανταμοιβές.
    </p>
  </div>`,
})
export class ExtrasComponent {
  readonly extras = EXTRAS;
}
