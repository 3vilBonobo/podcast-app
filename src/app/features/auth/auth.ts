import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MockAuthService } from '../../core/preferences.service';
import { IconComponent } from '../../shared/icon';
@Component({
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  template: `<div class="page auth-page">
    <div class="auth-editorial">
      <p class="eyebrow accent">THERE'S A PLACE FOR YOU HERE</p>
      <span class="auth-wordmark">dumb<br /><i>&</i> dahmer<span>.</span></span>
      <p>Μια θέση στο τραπέζι.<br />Μια ιστορία που δεν τελειώνει.</p>
      <span class="tiny-label">TRUE CRIME. DARK HUMOR. GOOD COMPANY.</span>
    </div>
    <section class="auth-panel">
      <span class="tag">FRONTEND PROTOTYPE</span>
      <h1>
        {{
          mode() === 'register'
            ? 'Έλα στην παρέα.'
            : mode() === 'forgot'
              ? 'Χάθηκε ο κωδικός;'
              : 'Σε περιμέναμε.'
        }}
      </h1>
      <p class="muted">
        {{
          mode() === 'forgot'
            ? 'Μια προεπισκόπηση ανάκτησης κωδικού.'
            : 'Μπες για μια ματιά στον προσωπικό σου χώρο.'
        }}
      </p>
      <div class="prototype-notice">
        <dd-icon name="lock" />
        <p>
          Η πραγματική σύνδεση δεν είναι ακόμα διαθέσιμη. Χρησιμοποίησε το Demo Account ή συνέχισε ως
          επισκέπτης.
        </p>
      </div>
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <label for="auth-email">Email</label>
        <div class="form-input">
          <dd-icon name="mail" /><input
            id="auth-email"
            type="email"
            formControlName="email"
            autocomplete="email"
            placeholder="you@example.com"
            [attr.aria-invalid]="form.controls.email.touched && form.controls.email.invalid"
            aria-describedby="email-error"
          />
        </div>
        @if (form.controls.email.touched && form.controls.email.invalid) {
          <p id="email-error" class="field-error">Γράψε μια έγκυρη διεύθυνση email.</p>
        }
        @if (mode() !== 'forgot') {
          <label for="auth-password">Κωδικός</label>
          <div class="form-input">
            <dd-icon name="lock" /><input
              id="auth-password"
              [type]="showPassword() ? 'text' : 'password'"
              formControlName="password"
              [autocomplete]="mode() === 'register' ? 'new-password' : 'current-password'"
              placeholder="Τουλάχιστον 8 χαρακτήρες"
              [attr.aria-invalid]="form.controls.password.touched && form.controls.password.invalid"
              aria-describedby="password-error"
            /><button
              type="button"
              class="icon-button"
              (click)="showPassword.set(!showPassword())"
              [attr.aria-label]="showPassword() ? 'Απόκρυψη κωδικού' : 'Εμφάνιση κωδικού'"
              [attr.aria-pressed]="showPassword()"
            >
              <dd-icon name="eye" />
            </button>
          </div>
          @if (form.controls.password.touched && form.controls.password.invalid) {
            <p id="password-error" class="field-error">Χρειάζονται τουλάχιστον 8 χαρακτήρες.</p>
          }
          @if (mode() === 'login') {
            <a routerLink="/auth/forgot" class="forgot-link">Ξέχασες τον κωδικό;</a>
          }
        }
        <button class="button primary full-width" type="submit">
          {{ mode() === 'register' ? 'Εγγραφή' : mode() === 'forgot' ? 'Αποστολή οδηγιών' : 'Σύνδεση' }}
          <dd-icon name="arrow" />
        </button>
      </form>
      @if (message()) {
        <div class="notice auth-message" role="status"><dd-icon name="check" />{{ message() }}</div>
      }
      @if (mode() !== 'forgot') {
        <div class="auth-divider"><span>ή</span></div>
        <button class="button secondary full-width" (click)="google()">
          <span class="google-letter">G</span> Συνέχεια με Google
        </button>
      }
      <button class="button demo-button full-width" (click)="demo()">
        Μπες στο Demo Account <dd-icon name="arrow" /></button
      ><a routerLink="/" class="guest-link">Συνέχισε ως επισκέπτης</a>
      <p class="auth-switch">
        {{ mode() === 'login' ? 'Πρώτη φορά εδώ;' : 'Έχεις ήδη λογαριασμό;' }}
        <a [routerLink]="mode() === 'login' ? '/auth/register' : '/auth/login'">{{
          mode() === 'login' ? 'Εγγραφή' : 'Σύνδεση'
        }}</a>
      </p>
      <p class="privacy-note">Δεν αποθηκεύουμε κωδικούς, στοιχεία σύνδεσης ή tokens.</p>
    </section>
  </div>`,
})
export class AuthComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly auth = inject(MockAuthService);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  readonly mode = computed(() => {
    const value = this.params().get('mode');
    return value === 'register' || value === 'forgot' ? value : 'login';
  });
  readonly showPassword = signal(false);
  readonly message = signal('');
  readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });
  submit(): void {
    const email = this.form.controls.email;
    const password = this.form.controls.password;
    email.markAsTouched();
    if (this.mode() !== 'forgot') password.markAsTouched();
    if (email.invalid || (this.mode() !== 'forgot' && password.invalid)) {
      this.message.set('Έλεγξε τα πεδία που έχουν επισημανθεί.');
      return;
    }
    password.reset();
    this.message.set(
      this.mode() === 'forgot'
        ? 'Η φόρμα είναι έγκυρη. Δεν στάλθηκε email: η ανάκτηση κωδικού θα ενεργοποιηθεί σε επόμενη φάση.'
        : 'Η φόρμα είναι έγκυρη. Η πραγματική σύνδεση και εγγραφή δεν είναι διαθέσιμες ακόμα. Μπες με το Demo Account.',
    );
  }
  google(): void {
    this.form.controls.password.reset();
    this.message.set(
      'Το Google sign-in είναι προεπισκόπηση. Δεν έγινε σύνδεση με τη Google. Δοκίμασε το Demo Account.',
    );
  }
  demo(): void {
    this.form.reset();
    this.auth.demoLogin();
    void this.router.navigateByUrl('/profile');
  }
}
