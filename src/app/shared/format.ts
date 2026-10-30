import { inject, Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '../core/preferences.service';
@Pipe({ name: 'time' })
export class TimePipe implements PipeTransform {
  transform(value: number): string {
    const seconds = Math.max(0, Math.floor(value || 0));
    return seconds >= 3600
      ? `${Math.floor(seconds / 3600)}:${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
      : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }
}
@Pipe({ name: 'minutes', pure: false })
export class MinutesPipe implements PipeTransform {
  private readonly i18n = inject(I18nService);
  transform(value: number): string {
    const minutes = Math.round(value / 60);
    return `${minutes} ${this.i18n.t(minutes === 1 ? 'common.minute' : 'common.minutes')}`;
  }
}
