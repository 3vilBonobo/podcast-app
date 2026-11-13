import { Component, inject, Input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { SavedViewsService } from '../core/saved-views.service';
import { IconComponent } from './icon';

@Component({
  selector: 'dd-save-view',
  imports: [TranslocoDirective, RouterLink, IconComponent],
  styles: `
    :host {
      display: block;
    }
    .save-view-tools,
    .save-view-form {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .save-view-tools {
      padding: 16px 0;
      border-top: 1px solid var(--line);
    }
    .save-view-form {
      margin: 0 0 16px;
    }
    input {
      min-width: 0;
      max-width: 100%;
    }
    label {
      font-size: 13px;
    }
    .save-feedback {
      font-size: 13px;
      color: var(--muted);
    }
  `,
  template: `<ng-container *transloco="let t">
    <div class="save-view-tools">
      <button
        id="save-view-toggle"
        type="button"
        class="text-button"
        [attr.aria-expanded]="expanded()"
        aria-controls="save-view-form"
        (click)="toggle()"
      >
        <dd-icon name="folder" />{{ t('space.saveView') }}
      </button>
      <a routerLink="/profile" [queryParams]="{ section: 'presets' }" class="text-button"
        >{{ t('space.manageViews') }} <dd-icon name="arrow"
      /></a>
    </div>
    @if (expanded()) {
      <form
        id="save-view-form"
        class="save-view-form"
        (submit)="$event.preventDefault(); save(viewName.value)"
      >
        <label for="new-view-name">{{ t('space.viewName') }}</label
        ><input #viewName id="new-view-name" required maxlength="80" [placeholder]="t('space.nameExample')" />
        <button type="submit" class="button secondary">{{ t('space.saveView') }}</button>
        <button type="button" class="text-button" (click)="close()">{{ t('player.cancel') }}</button>
      </form>
    }
    <p class="save-feedback" role="status" aria-live="polite">{{ saved() ? t('space.saved') : '' }}</p>
    @if (views.error()) {
      <p class="notice" role="alert">{{ t('space.storageError') }}</p>
    }
  </ng-container>`,
})
export class SaveViewComponent {
  @Input({ required: true }) filters: Record<string, string> = {};
  readonly views = inject(SavedViewsService);
  readonly expanded = signal(false);
  readonly saved = signal(false);
  toggle(): void {
    this.expanded.update((value) => !value);
    this.saved.set(false);
    if (this.expanded()) setTimeout(() => document.getElementById('new-view-name')?.focus());
  }
  close(): void {
    this.expanded.set(false);
    setTimeout(() => document.getElementById('save-view-toggle')?.focus());
  }
  save(name: string): void {
    if (this.views.save(name, this.filters)) {
      this.saved.set(true);
      this.close();
    }
  }
}
