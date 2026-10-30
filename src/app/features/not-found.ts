import { TranslocoDirective } from '@jsverse/transloco';
import { Component } from '@angular/core';
import { EmptyStateComponent } from '../shared/empty-state';
@Component({
  imports: [TranslocoDirective, EmptyStateComponent],
  template: `<ng-container *transloco="let t"
    ><div class="page">
      <p class="eyebrow accent">CASE 404 · UNSOLVED</p>
      <dd-empty
        title="not-found.thisStoryHasGoneMissing"
        description="not-found.thePageYouAreLookingForDoesNot"
        link="/episodes"
      /></div
  ></ng-container>`,
})
export class NotFoundComponent {}
