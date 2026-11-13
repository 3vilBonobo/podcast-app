import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { SavedViewsService, type SavedCatalogView } from '../../core/saved-views.service';
import { IconComponent } from '../../shared/icon';

@Component({
  selector: 'dd-saved-views-panel',
  imports: [TranslocoDirective, RouterLink, IconComponent],
  styleUrl: './saved-views.css',
  template: `<ng-container *transloco="let t">
    <section class="space-heading">
      <p class="eyebrow accent">{{ t('space.yourRituals') }}</p>
      <h2>{{ t('space.presets') }}</h2>
      <p>{{ t('space.viewsHelp') }}</p>
    </section>
    @if (views.error()) {
      <p class="notice" role="alert">{{ t('space.storageError') }}</p>
    }
    <div class="saved-view-list">
      @for (view of views.views(); track view.id; let index = $index) {
        <article class="saved-view">
          <div class="saved-view-heading">
            <dd-icon name="folder" />
            <h3>{{ view.name }}</h3>
            <span class="tag">{{ t('space.savedView') }}</span>
          </div>
          <p class="saved-view-summary">{{ t('space.filtersCount', { count: filterCount(view) }) }}</p>
          @if (editing() === view.id) {
            <form class="view-name-form" (submit)="$event.preventDefault(); rename(view.id, nameInput.value)">
              <label [for]="'view-name-' + view.id">{{ t('space.viewName') }}</label>
              <div>
                <input #nameInput [id]="'view-name-' + view.id" [value]="view.name" required maxlength="80" />
                <button type="submit" class="button secondary">{{ t('space.saveName') }}</button>
                <button type="button" class="text-button" (click)="cancel(view.id)">
                  {{ t('player.cancel') }}
                </button>
              </div>
            </form>
          } @else {
            <div class="saved-view-actions">
              <a routerLink="/episodes" [queryParams]="view.filters" class="button secondary"
                >{{ t('space.openView') }} <dd-icon name="arrow"
              /></a>
              <button [id]="'rename-view-' + view.id" class="text-button" (click)="edit(view.id)">
                {{ t('space.rename') }}<span class="sr-only"> {{ view.name }}</span>
              </button>
              <button class="text-button" (click)="remove(view, index)">
                {{ t('library.remove') }}<span class="sr-only"> {{ view.name }}</span>
              </button>
            </div>
          }
        </article>
      } @empty {
        <div class="saved-view-empty">
          <dd-icon name="folder" />
          <h3>{{ t('space.noViews') }}</h3>
          <p>{{ t('space.noViewsHelp') }}</p>
        </div>
      }
    </div>
    <p role="status" aria-live="polite">{{ message() ? t(message()) : '' }}</p>
    @if (removed(); as item) {
      <button id="undo-view" class="text-button" (click)="undo()">
        {{ t('space.undoRemove') }} · {{ item.view.name }}
      </button>
    }
    <a routerLink="/episodes" class="button primary saved-view-browse"
      >{{ t('space.browseToSave') }} <dd-icon name="arrow"
    /></a>
    <p class="privacy-note">{{ t('space.viewsLocal') }}</p>
  </ng-container>`,
})
export class SavedViewsPanelComponent {
  readonly views = inject(SavedViewsService);
  readonly editing = signal<string | null>(null);
  readonly message = signal('');
  readonly removed = signal<{ view: SavedCatalogView; index: number } | null>(null);
  filterCount(view: SavedCatalogView): number {
    return Object.keys(view.filters).length;
  }
  edit(id: string): void {
    this.editing.set(id);
    setTimeout(() => document.getElementById('view-name-' + id)?.focus());
  }
  cancel(id: string): void {
    this.editing.set(null);
    setTimeout(() => document.getElementById('rename-view-' + id)?.focus());
  }
  rename(id: string, name: string): void {
    if (this.views.rename(id, name)) {
      this.cancel(id);
      this.message.set('space.renamed');
    }
  }
  remove(view: SavedCatalogView, index: number): void {
    if (this.views.remove(view.id)) {
      this.removed.set({ view, index });
      this.message.set('space.removed');
      setTimeout(() => document.getElementById('undo-view')?.focus());
    }
  }
  undo(): void {
    const item = this.removed();
    if (item && this.views.restore(item.view, item.index)) {
      this.removed.set(null);
      this.message.set('space.restored');
      setTimeout(() => document.getElementById('rename-view-' + item.view.id)?.focus());
    }
  }
}
