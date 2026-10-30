import { TranslocoDirective } from '@jsverse/transloco';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from './icon';
@Component({
  selector: 'dd-empty',
  imports: [TranslocoDirective, RouterLink, IconComponent],
  template: `<ng-container *transloco="let t"
    ><div class="empty-state">
      <div class="empty-symbol"><dd-icon [name]="icon()" /></div>
      <h2>{{ t(title()) }}</h2>
      <p>{{ description() ? t(description()) : '' }}</p>
      @if (link()) {
        <a class="button secondary" [routerLink]="link()">{{ t(action()) }} <dd-icon name="arrow" /></a>
      }</div
  ></ng-container>`,
})
export class EmptyStateComponent {
  readonly title = input('library.theArchiveIsEmpty');
  readonly description = input('');
  readonly icon = input('headphones');
  readonly link = input('');
  readonly action = input('common.findYourNextEpisode');
}
