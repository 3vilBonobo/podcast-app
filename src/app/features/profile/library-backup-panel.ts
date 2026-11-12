import { Component, DestroyRef, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { LibraryService } from '../../core/library.service';
import { AudioPlayerService } from '../../core/audio-player.service';
import { PodcastService } from '../../core/podcast.service';
import { LibraryConflictError } from '../../core/local-storage.repository';
import {
  BackupError,
  MAX_BACKUP_BYTES,
  createLibraryBackup,
  mergeLibrary,
  parseLibraryBackup,
} from '../../core/library-backup';
import type { ParsedBackup, PlaybackPreferences } from '../../core/library-backup';
import { IconComponent } from '../../shared/icon';

@Component({
  selector: 'dd-library-backup',
  imports: [TranslocoDirective, DatePipe, IconComponent],
  template: `<section class="settings-panel backup-panel" *transloco="let t" [attr.aria-busy]="busy()">
    <p class="eyebrow">{{ t('backup.localOnly') }}</p>
    <h2>{{ t('backup.title') }}</h2>
    <p class="muted" id="backup-help">{{ t('backup.description') }}</p>
    <div class="backup-actions">
      <button
        type="button"
        class="button secondary"
        [disabled]="busy() || !library.loaded() || library.reloadRequired()"
        (click)="exportLibrary()"
      >
        <dd-icon name="backup" />{{ t('backup.export') }}
      </button>
      <label class="backup-field"
        >{{ t('backup.chooseFile')
        }}<input
          type="file"
          accept=".json,application/json"
          [disabled]="busy() || !library.loaded() || library.reloadRequired()"
          aria-describedby="backup-help backup-file-error"
          (change)="chooseFile($event)"
      /></label>
    </div>
    <p class="action-feedback" role="status" aria-live="polite">
      {{ busy() ? t('backup.working') : message() ? t(message()) : '' }}
    </p>
    <p id="backup-file-error" [attr.role]="error() && !preview() ? 'alert' : null">
      {{ error() && !preview() ? t(error()) : '' }}
    </p>
    @if (library.reloadRequired()) {
      <button type="button" class="button secondary" (click)="reloadLibrary()">
        {{ t('backup.reload') }}
      </button>
    }
    @if (preferences(); as saved) {
      <div class="backup-preferences">
        <h3>{{ t('backup.preferencesTitle') }}</h3>
        <p class="muted">{{ t('backup.preferencesSeparate') }}</p>
        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="button secondary"
            [disabled]="busy() || player.speed() === saved.speed"
            (click)="restorePreference('speed')"
          >
            {{ t('backup.restoreSpeed') }} · {{ saved.speed }}×
          </button>
          <button
            type="button"
            class="button secondary"
            [disabled]="busy() || player.volume() === saved.volume"
            (click)="restorePreference('volume')"
          >
            {{ t('backup.restoreVolume') }} · {{ (saved.volume * 100).toFixed(0) }}%
          </button>
        </div>
      </div>
    }
    <dialog
      #importDialog
      class="backup-dialog"
      aria-labelledby="backup-preview-title"
      aria-describedby="backup-policy"
      (cancel)="cancelDialog($event)"
    >
      <h2 id="backup-preview-title" tabindex="-1">{{ t('backup.previewTitle') }}</h2>
      @if (preview(); as candidate) {
        <p>{{ t('backup.exportDate') }} {{ candidate.backup.exportedAt | date: 'dd.MM.yyyy HH:mm' }}</p>
        <dl class="backup-summary">
          <div>
            <dt>{{ t('library.favorites') }}</dt>
            <dd>{{ candidate.snapshot.favorites.length }}</dd>
          </div>
          <div>
            <dt>{{ t('library.inTheQueue') }}</dt>
            <dd>{{ candidate.snapshot.queue.length }}</dd>
          </div>
          <div>
            <dt>{{ t('backup.progressRecords') }}</dt>
            <dd>{{ candidate.backup.library.records.length }}</dd>
          </div>
          <div>
            <dt>{{ t('library.completed') }}</dt>
            <dd>{{ completedCount() }}</dd>
          </div>
        </dl>
        <p>
          {{ t('backup.duplicateCount', { count: candidate.duplicates }) }} ·
          {{ t('backup.conflictCount', { count: conflicts() }) }}
        </p>
        @if (unavailable()) {
          <p class="notice">{{ t('backup.unavailable', { count: unavailable() }) }}</p>
        }
        <fieldset class="backup-mode" [disabled]="busy() || library.reloadRequired()">
          <legend>{{ t('backup.howToRestore') }}</legend>
          <label
            ><input
              type="radio"
              name="library-restore-mode"
              value="merge"
              [checked]="mode() === 'merge'"
              [disabled]="busy()"
              (change)="setMode('merge')"
            />{{ t('backup.merge') }}</label
          >
          <label
            ><input
              type="radio"
              name="library-restore-mode"
              value="replace"
              [checked]="mode() === 'replace'"
              [disabled]="busy()"
              (change)="setMode('replace')"
            />{{ t('backup.replace') }}</label
          >
        </fieldset>
        <p id="backup-policy" class="muted">
          {{ t(mode() === 'merge' ? 'backup.mergePolicy' : 'backup.replacePolicy') }}
        </p>
        <p class="muted">{{ t('backup.pauseNotice') }} {{ t('backup.preferencesSeparate') }}</p>
        @if (mode() === 'replace') {
          <label class="backup-confirm"
            ><input
              type="checkbox"
              [checked]="confirmed()"
              [disabled]="busy()"
              (change)="confirmed.set($any($event.target).checked)"
            />{{ t('backup.confirmReplace') }}</label
          >
        }
        @if (error()) {
          <p role="alert" class="backup-error">{{ t(error()) }}</p>
        }
        <p class="action-feedback" role="status">{{ busy() ? t('backup.working') : '' }}</p>
        <div class="backup-actions">
          <button type="button" class="button secondary" [disabled]="busy()" (click)="cancelDialog()">
            {{ t('backup.cancel') }}
          </button>
          <button
            type="button"
            class="button primary"
            [disabled]="busy() || library.reloadRequired() || (mode() === 'replace' && !confirmed())"
            (click)="applyImport()"
          >
            {{ t(mode() === 'merge' ? 'backup.applyMerge' : 'backup.applyReplace') }}
          </button>
          @if (library.reloadRequired()) {
            <button type="button" class="button secondary" (click)="reloadLibrary()">
              {{ t('backup.reload') }}
            </button>
          }
        </div>
      }
    </dialog>
  </section>`,
})
export class LibraryBackupPanelComponent {
  readonly library = inject(LibraryService);
  readonly player = inject(AudioPlayerService);
  private readonly podcast = inject(PodcastService);
  @ViewChild('importDialog') dialog?: ElementRef<HTMLDialogElement>;
  readonly preview = signal<ParsedBackup | null>(null);
  readonly preferences = signal<PlaybackPreferences | null>(null);
  readonly busy = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  readonly mode = signal<'merge' | 'replace'>('merge');
  readonly confirmed = signal(false);
  readonly completedCount = computed(
    () => this.preview()?.backup.library.records.filter((r) => r.completed).length ?? 0,
  );
  readonly conflicts = computed(
    () =>
      this.preview()?.backup.library.records.filter((r) =>
        Object.hasOwn(this.library.state().records, r.episodeId),
      ).length ?? 0,
  );
  readonly unavailable = computed(() => {
    const s = this.preview()?.snapshot;
    return s
      ? [
          ...new Set([
            ...s.favorites,
            ...s.queue,
            ...Object.keys(s.records),
            ...(s.currentId ? [s.currentId] : []),
          ]),
        ].filter((id) => !this.podcast.find(id)).length
      : 0;
  });
  private readVersion = 0;
  private destroyed = false;
  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.readVersion++;
    });
  }
  async exportLibrary(): Promise<void> {
    if (this.busy() || !this.library.loaded() || this.library.reloadRequired()) return;
    this.busy.set(true);
    this.error.set('');
    this.message.set('');
    try {
      this.player.captureProgress();
      await this.library.flush();
      const backup = createLibraryBackup(this.library.state(), {
        speed: this.player.speed(),
        volume: this.player.volume(),
      });
      const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
      if (blob.size > MAX_BACKUP_BYTES) throw new BackupError('backup.tooLarge');
      const url = URL.createObjectURL(blob);
      try {
        const a = document.createElement('a');
        a.href = url;
        a.download = `dumb-and-dahmer-library-${backup.exportedAt.slice(0, 10)}.json`;
        document.body.append(a);
        a.click();
        a.remove();
      } finally {
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      this.message.set('backup.exported');
    } catch {
      this.error.set('backup.exportFailed');
    } finally {
      this.busy.set(false);
    }
  }
  async chooseFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || this.busy()) return;
    await this.readFile(file);
  }
  async readFile(file: Pick<File, 'size' | 'text'>): Promise<void> {
    if (this.busy() || this.library.reloadRequired()) return;
    const version = ++this.readVersion;
    this.preview.set(null);
    this.preferences.set(null);
    this.error.set('');
    this.message.set('');
    this.mode.set('merge');
    this.confirmed.set(false);
    this.busy.set(true);
    try {
      if (!file.size) throw new BackupError('backup.invalidJson');
      if (file.size > MAX_BACKUP_BYTES) throw new BackupError('backup.tooLarge');
      const parsed = parseLibraryBackup(await file.text());
      if (this.destroyed || version !== this.readVersion) return;
      this.preview.set(parsed);
      this.dialog?.nativeElement.showModal();
      this.dialog?.nativeElement.querySelector<HTMLElement>('h2')?.focus();
    } catch (error) {
      if (!this.destroyed && version === this.readVersion)
        this.error.set(error instanceof BackupError ? error.key : 'backup.readFailed');
    } finally {
      if (version === this.readVersion) this.busy.set(false);
    }
  }
  setMode(mode: 'merge' | 'replace'): void {
    if (this.library.reloadRequired()) return;
    this.mode.set(mode);
    this.confirmed.set(false);
    this.error.set('');
  }
  cancelDialog(event?: Event): void {
    if (this.busy()) {
      event?.preventDefault();
      return;
    }
    this.preview.set(null);
    this.error.set('');
    this.confirmed.set(false);
    this.dialog?.nativeElement.close();
  }
  async applyImport(): Promise<void> {
    const candidate = this.preview();
    if (
      !candidate ||
      this.busy() ||
      this.library.reloadRequired() ||
      (this.mode() === 'replace' && !this.confirmed())
    )
      return;
    this.busy.set(true);
    this.error.set('');
    this.message.set('');
    const mode = this.mode();
    try {
      this.player.prepareLibraryRestore();
      await this.library.restore((current) => {
        const next =
          mode === 'merge' ? mergeLibrary(current, candidate.snapshot) : structuredClone(candidate.snapshot);
        createLibraryBackup(next, candidate.backup.playbackPreferences);
        return next;
      });
    } catch (error) {
      try {
        if (!(error instanceof LibraryConflictError)) this.player.restoreLibrarySelection();
      } catch {
        /* The saved library remains unchanged even if media is unavailable. */
      }
      this.error.set(
        error instanceof LibraryConflictError
          ? 'backup.concurrentChange'
          : error instanceof BackupError
            ? error.key
            : 'backup.restoreFailed',
      );
      this.busy.set(false);
      return;
    }
    // The transaction committed. A media capability failure cannot undo it or be reported as an import failure.
    let playerFailed = false;
    try {
      this.player.restoreLibrarySelection();
    } catch {
      playerFailed = true;
    }
    this.preferences.set(candidate.backup.playbackPreferences);
    this.preview.set(null);
    this.confirmed.set(false);
    this.dialog?.nativeElement.close();
    this.message.set(playerFailed ? 'backup.restoredPlayerError' : 'backup.restored');
    this.busy.set(false);
  }
  restorePreference(key: 'speed' | 'volume'): void {
    const saved = this.preferences();
    if (!saved || this.busy()) return;
    this.error.set('');
    if (this.player.restorePreference(key, saved[key])) this.message.set('backup.preferenceRestored');
    else this.error.set('backup.preferenceFailed');
  }
  reloadLibrary(): void {
    window.location.reload();
  }
}
