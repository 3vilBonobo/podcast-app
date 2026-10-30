import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from './icon';
@Component({
  selector: 'dd-empty',
  imports: [RouterLink, IconComponent],
  template: `<div class="empty-state">
    <div class="empty-symbol"><dd-icon [name]="icon()" /></div>
    <h2>{{ title() }}</h2>
    <p>{{ description() }}</p>
    @if (link()) {
      <a class="button secondary" [routerLink]="link()">{{ action() }} <dd-icon name="arrow" /></a>
    }
  </div>`,
})
export class EmptyStateComponent {
  readonly title = input('Το αρχείο είναι άδειο.');
  readonly description = input('');
  readonly icon = input('headphones');
  readonly link = input('');
  readonly action = input('Βρες το επόμενο επεισόδιο');
}
