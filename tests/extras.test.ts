import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Component, Input } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideTransloco, TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { ExtrasComponent } from '../src/app/features/extras/extras';
import { ExtraDetailComponent } from '../src/app/features/extras/detail';
import { EXTRAS } from '../src/app/features/extras/extras.data';
import { MachineArtComponent } from '../src/app/features/extras/machine-art';
import { BundledTranslationLoader, TRANSLATIONS } from '../src/app/core/transloco-loader';

// Plain Vitest does not emit AOT metadata for shared signal inputs.
@Component({ selector: 'dd-icon', template: '' })
class StubIcon {
  @Input() name = '';
}
@Component({
  selector: 'dd-empty',
  template:
    '@if (headingLevel === 1) { <h1>{{ title }}</h1> } @else { <h2>{{ title }}</h2> }<a [attr.href]="link">Back</a>',
})
class StubEmpty {
  @Input() headingLevel = 2;
  @Input() title = '';
  @Input() link = '';
  @Input() action = '';
}
@Component({ template: '<h1>Episodes</h1>' })
class StubEpisodes {}

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      { provide: APP_BASE_HREF, useValue: '/podcast-app/' },
      provideRouter([
        { path: 'extras', component: ExtrasComponent },
        { path: 'extras/:slug', component: ExtraDetailComponent },
        { path: 'episodes', component: StubEpisodes },
      ]),
      provideTransloco({
        config: {
          availableLangs: ['en', 'el'],
          defaultLang: 'en',
          reRenderOnLangChange: true,
          prodMode: true,
        },
        loader: BundledTranslationLoader,
      }),
    ],
  });
  TestBed.overrideComponent(ExtrasComponent, {
    set: { styleUrl: undefined, imports: [TranslocoDirective, RouterLink, StubIcon, MachineArtComponent] },
  });
  TestBed.overrideComponent(ExtraDetailComponent, {
    set: {
      styleUrl: undefined,
      imports: [TranslocoDirective, RouterLink, StubIcon, StubEmpty, MachineArtComponent],
    },
  });
  const translation = TestBed.inject(TranslocoService);
  translation.setTranslation(TRANSLATIONS.en, 'en');
  translation.setTranslation(TRANSLATIONS.el, 'el');
});
afterEach(() => TestBed.resetTestingModule());

describe('honest Extras concept routes', () => {
  it.each(['en', 'el'])(
    'renders the featured concept and four named placeholders in %s',
    async (language) => {
      const t = TestBed.inject(TranslocoService);
      t.setActiveLang(language);
      const harness = await RouterTestingHarness.create('/extras');
      const view = harness.routeNativeElement!;
      expect(view.querySelectorAll('h1')).toHaveLength(1);
      expect(view.querySelector('#waking-title')?.textContent).toBe(t.translate(EXTRAS[0].title));
      const links = [...view.querySelectorAll<HTMLAnchorElement>('a')];
      expect(links.map((a) => a.getAttribute('href'))).toEqual(
        EXTRAS.map((e) => '/podcast-app/extras/' + e.slug),
      );
      expect(view.querySelectorAll('.extras-concept')).toHaveLength(4);
      for (const extra of EXTRAS.slice(1)) {
        expect(view.querySelector('#' + extra.slug + '-title')?.textContent).toBe(t.translate(extra.title));
        expect(view.querySelector('#' + extra.slug + '-status')?.textContent).toBe(
          t.translate('extras.conceptPreview'),
        );
      }
      expect(view.textContent).toContain(t.translate('extras.conceptNotice'));
      expect(view.textContent).not.toMatch(/COMING SOON|UNDER CONSTRUCTION|extras\./);
      expect(view.querySelector('dd-machine-art')?.getAttribute('aria-hidden')).toBe('true');
    },
  );

  it.each(['en', 'el'])(
    'shows specific unavailable status on all five detail routes in %s',
    async (language) => {
      const t = TestBed.inject(TranslocoService);
      t.setActiveLang(language);
      const harness = await RouterTestingHarness.create();
      for (const extra of EXTRAS) {
        await harness.navigateByUrl('/extras/' + extra.slug, ExtraDetailComponent);
        const view = harness.routeNativeElement!;
        expect(view.querySelectorAll('h1')).toHaveLength(1);
        expect(view.querySelector('h1')?.textContent).toBe(t.translate(extra.title));
        expect(view.querySelector('.extras-availability')?.textContent).toContain(t.translate(extra.pending));
        expect(view.querySelector('details')?.open).toBe(false);
        expect(view.querySelector('summary')?.textContent).toBe(t.translate('extras.aboutConcept'));
        expect(view.querySelectorAll('.extras-related a')).toHaveLength(4);
        expect(view.querySelector('a[href="/podcast-app/episodes"]')).not.toBeNull();
        expect(view.querySelector('button, input, audio, iframe')).toBeNull();
      }
    },
  );

  it('resets native disclosure state when Angular reuses the detail route', async () => {
    const harness = await RouterTestingHarness.create('/extras/waking-machine');
    const first = harness.routeNativeElement!.querySelector('details')!;
    first.querySelector('summary')!.click();
    expect(first.open).toBe(true);
    await harness.navigateByUrl('/extras/rewards', ExtraDetailComponent);
    const next = harness.routeNativeElement!.querySelector('details')!;
    expect(next).not.toBe(first);
    expect(next.open).toBe(false);
    expect(harness.routeNativeElement!.querySelector('h1')?.textContent).toBe('Rewards');
  });

  it('offers a primary-heading recovery state for an unknown concept and can return to the index', async () => {
    const harness = await RouterTestingHarness.create('/extras/not-a-concept');
    expect(harness.routeNativeElement!.querySelectorAll('h1')).toHaveLength(1);
    expect(harness.routeNativeElement!.querySelector('h1')?.textContent).toBe('extras.thisDoorLeadsNowhere');
    expect(harness.routeNativeElement!.querySelector('.extras-detail')).toBeNull();
    await harness.navigateByUrl('/extras', ExtrasComponent);
    expect(harness.routeNativeElement!.querySelector('#waking-title')).not.toBeNull();
  });

  it('uses a decorative, unfocusable illustration without media or animated controls', () => {
    const fixture = TestBed.createComponent(MachineArtComponent);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('focusable')).toBe('false');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.querySelector('animate, foreignObject, script')).toBeNull();
  });
});
