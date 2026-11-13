import { Component } from '@angular/core';

/** Original decorative instrument illustration, not a playable control. */
@Component({
  selector: 'dd-machine-art',
  host: { 'aria-hidden': 'true' },
  template: `<svg viewBox="0 0 420 320" fill="none" aria-hidden="true" focusable="false">
    <g stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path opacity=".25" d="M28 260h364M48 280h324M210 24v18M56 153h28m252 0h28" />
      <path d="M112 260V133a98 98 0 0 1 196 0v127M96 260h228v16H96z" />
      <path opacity=".45" d="M126 246V133a84 84 0 0 1 168 0v113M148 240h124" />
      <circle cx="210" cy="140" r="62" />
      <circle cx="210" cy="140" r="53" opacity=".35" />
      <path d="M163 140s20-25 47-25 47 25 47 25-20 25-47 25-47-25-47-25Z" />
      <circle cx="210" cy="140" r="15" />
      <path d="M210 130v20m-10-10h20M173 222h74M184 215v14m13-14v14m13-14v14m13-14v14m13-14v14" />
      <path opacity=".45" d="m66 76 16 16m272-16-16 16M73 226h17m240 0h17M204 62h12" />
    </g>
    <path d="M210 156v23m-5-11v8m10-6v11" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" />
  </svg>`,
  styles: `
    :host {
      display: block;
      width: 100%;
      max-width: 420px;
      color: var(--gold);
    }
    svg {
      display: block;
      width: 100%;
      height: auto;
    }
  `,
})
export class MachineArtComponent {}
