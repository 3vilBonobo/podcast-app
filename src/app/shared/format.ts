import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'time' })
export class TimePipe implements PipeTransform {
  transform(value: number): string {
    const seconds = Math.max(0, Math.floor(value || 0));
    return seconds >= 3600
      ? `${Math.floor(seconds / 3600)}:${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
      : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }
}
@Pipe({ name: 'minutes' })
export class MinutesPipe implements PipeTransform {
  transform(value: number): string {
    const minutes = Math.round(value / 60);
    return `${minutes} ${minutes === 1 ? 'λεπτό' : 'λεπτά'}`;
  }
}
