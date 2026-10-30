import { Component } from '@angular/core';
import { EmptyStateComponent } from '../shared/empty-state';
@Component({
  imports: [EmptyStateComponent],
  template: `<div class="page">
    <p class="eyebrow accent">CASE 404 · UNSOLVED</p>
    <dd-empty
      title="Αυτή η ιστορία χάθηκε."
      description="Η σελίδα που ψάχνεις δεν υπάρχει. Το αρχείο, όμως, σε περιμένει."
      link="/episodes"
    />
  </div>`,
})
export class NotFoundComponent {}
