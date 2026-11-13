import { afterEach, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EpisodeShareComponent } from '../src/app/shared/episode-share';
afterEach(() => {
  TestBed.resetTestingModule();
  Reflect.deleteProperty(navigator, 'share');
});
it('returns focus to the invoking control after native share cancellation', async () => {
  Object.defineProperty(navigator, 'share', {
    configurable: true,
    value: vi.fn(async () => {
      (document.activeElement as HTMLElement)?.blur();
      throw new DOMException('Cancelled', 'AbortError');
    }),
  });
  // Plain Vitest does not emit AOT signal-input metadata; supply the input value explicitly.
  TestBed.overrideComponent(EpisodeShareComponent, {
    set: {
      imports: [],
      template: `<button type="button" [disabled]="busy()" (click)="run('share', $event)">Share</button>`,
    },
  });
  const fixture = TestBed.createComponent(EpisodeShareComponent);
  Object.defineProperty(fixture.componentInstance, 'episode', {
    value: () => ({ id: 'Buzzsprout-1', title: 'Test' }),
  });
  document.body.append(fixture.nativeElement);
  try {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.focus();
    button.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.message()).toBe('sharing.cancelled');
    expect(document.activeElement).toBe(button);
  } finally {
    fixture.nativeElement.remove();
  }
});

it('does not schedule focus recovery when sharing settles after navigation destroys the view', async () => {
  let cancel!: (reason: unknown) => void;
  Object.defineProperty(navigator, 'share', {
    configurable: true,
    value: vi.fn(
      () =>
        new Promise<void>((_resolve, reject) => {
          cancel = reject;
        }),
    ),
  });
  TestBed.overrideComponent(EpisodeShareComponent, { set: { imports: [], template: '' } });
  const fixture = TestBed.createComponent(EpisodeShareComponent);
  Object.defineProperty(fixture.componentInstance, 'episode', {
    value: () => ({ id: 'Buzzsprout-1', title: 'Test' }),
  });
  const sharing = fixture.componentInstance.run('share');
  fixture.destroy();
  cancel(new DOMException('Cancelled', 'AbortError'));
  await expect(sharing).resolves.toBeUndefined();
});
