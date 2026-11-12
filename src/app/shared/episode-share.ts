import { Component, Injector, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { copyEpisodeLink, episodePermalink, shareEpisode } from '../core/episode-sharing';
import type { Episode } from '../core/models';
import { IconComponent } from './icon';

@Component({
  selector: 'dd-episode-share',
  imports: [TranslocoDirective, IconComponent],
  template: `<section
    class="episode-share"
    *transloco="let t"
    [attr.aria-label]="t('sharing.title')"
    [attr.aria-busy]="busy()"
  >
    <div class="flex flex-wrap gap-3">
      <button type="button" class="button secondary" [disabled]="busy()" (click)="run('share', $event)">
        <dd-icon name="share" />{{ t('sharing.share') }}
      </button>
      <button type="button" class="button secondary" [disabled]="busy()" (click)="run('copy', $event)">
        <dd-icon name="copy" />{{ t('sharing.copy') }}
      </button>
    </div>
    <p class="action-feedback" role="status" aria-live="polite">{{ message() ? t(message()) : '' }}</p>
    @if (manualLink()) {
      <label class="backup-field"
        >{{ t('sharing.permalink')
        }}<input type="text" readonly [value]="link()" (focus)="$any($event.target).select()"
      /></label>
    }
  </section>`,
})
export class EpisodeShareComponent {
  private readonly injector = inject(Injector);
  readonly episode = input.required<Episode>();
  readonly link = computed(() => episodePermalink(this.episode().id));
  readonly busy = signal(false);
  readonly message = signal('');
  readonly manualLink = computed(() =>
    ['sharing.copyFailed', 'sharing.shareFailed'].includes(this.message()),
  );
  async run(action: 'share' | 'copy', event?: Event): Promise<void> {
    const button = event?.currentTarget as HTMLButtonElement | undefined;
    if (this.busy()) return;
    this.busy.set(true);
    this.message.set('');
    try {
      this.message.set(
        await (action === 'share' ? shareEpisode(this.episode()) : copyEpisodeLink(this.episode().id)),
      );
    } finally {
      this.busy.set(false);
      afterNextRender(
        () => {
          if (button?.isConnected) button.focus();
        },
        { injector: this.injector },
      );
    }
  }
}
