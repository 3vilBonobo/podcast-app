import { TranslocoDirective } from '@jsverse/transloco';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MockAuthService } from '../../core/preferences.service';
import { IconComponent } from '../../shared/icon';
@Component({
  imports: [TranslocoDirective, ReactiveFormsModule, RouterLink, IconComponent],
  template: `<ng-container *transloco="let t"
    ><div class="page auth-page">
      <div class="auth-editorial">
        <p class="eyebrow accent">THERE'S A PLACE FOR YOU HERE</p>
        <span class="auth-wordmark">dumb<br /><i>&</i> dahmer<span>.</span></span>
        <p>{{ t('auth.aPlaceAtTheTable') }}<br />{{ t('auth.aStoryThatNeverEnds') }}</p>
        <span class="tiny-label">TRUE CRIME. DARK HUMOR. GOOD COMPANY.</span>
      </div>
      <section class="auth-panel">
        <span class="tag">FRONTEND PROTOTYPE</span>
        <h1>
          {{
            mode() === 'register'
              ? t('auth.joinTheCompany')
              : mode() === 'forgot'
                ? t('auth.lostYourPassword')
                : t('auth.weWereExpectingYou')
          }}
        </h1>
        <p class="muted">
          {{
            mode() === 'forgot'
              ? t('auth.aPreviewOfPasswordRecovery')
              : t('auth.takeALookAroundYourPersonalSpace')
          }}
        </p>
        <div class="prototype-notice">
          <dd-icon name="lock" />
          <p>
            {{ t('auth.realSignInIsNotAvailableYetUse') }}
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
            <p id="email-error" class="field-error">{{ t('auth.enterAValidEmailAddress') }}</p>
          }
          @if (mode() !== 'forgot') {
            <label for="auth-password">{{ t('auth.password') }}</label>
            <div class="form-input">
              <dd-icon name="lock" /><input
                id="auth-password"
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                [autocomplete]="mode() === 'register' ? 'new-password' : 'current-password'"
                [placeholder]="t('auth.atLeast8Characters')"
                [attr.aria-invalid]="form.controls.password.touched && form.controls.password.invalid"
                aria-describedby="password-error"
              /><button
                type="button"
                class="icon-button"
                (click)="showPassword.set(!showPassword())"
                [attr.aria-label]="showPassword() ? t('auth.hidePassword') : t('auth.showPassword')"
                [attr.aria-pressed]="showPassword()"
              >
                <dd-icon name="eye" />
              </button>
            </div>
            @if (form.controls.password.touched && form.controls.password.invalid) {
              <p id="password-error" class="field-error">{{ t('auth.useAtLeast8Characters') }}</p>
            }
            @if (mode() === 'login') {
              <a routerLink="/auth/forgot" class="forgot-link">{{ t('auth.forgotYourPassword') }}</a>
            }
          }
          <button class="button primary full-width" type="submit">
            {{
              mode() === 'register'
                ? t('auth.register')
                : mode() === 'forgot'
                  ? t('auth.sendInstructions')
                  : t('auth.signIn')
            }}
            <dd-icon name="arrow" />
          </button>
        </form>
        @if (message()) {
          <div class="notice auth-message" role="status"><dd-icon name="check" />{{ t(message()) }}</div>
        }
        @if (mode() !== 'forgot') {
          <div class="auth-divider">
            <span>{{ t('auth.or') }}</span>
          </div>
          <button class="button secondary full-width" (click)="google()">
            <span class="google-letter">G</span> {{ t('auth.continueWithGoogle') }}
          </button>
        }
        <button class="button demo-button full-width" (click)="demo()">
          {{ t('auth.enterDemoAccount') }} <dd-icon name="arrow" /></button
        ><a routerLink="/" class="guest-link">{{ t('auth.continueAsAGuest') }}</a>
        <p class="auth-switch">
          {{ mode() === 'login' ? t('auth.firstTimeHere') : t('auth.alreadyHaveAnAccount') }}
          <a [routerLink]="mode() === 'login' ? '/auth/register' : '/auth/login'">{{
            mode() === 'login' ? t('auth.register') : t('auth.signIn')
          }}</a>
        </p>
        <p class="privacy-note">{{ t('auth.weDoNotStorePasswordsCredentialsOrTokens') }}</p>
      </section>
    </div></ng-container
  >`,
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
      this.message.set('auth.checkTheHighlightedFields');
      return;
    }
    password.reset();
    this.message.set(
      this.mode() === 'forgot' ? 'auth.theFormIsValidNoEmailWasSent' : 'auth.theFormIsValidRealSignInAnd',
    );
  }
  google(): void {
    this.form.controls.password.reset();
    this.message.set('auth.googleSignInIsAPreviewYouHave');
  }
  demo(): void {
    this.form.reset();
    this.auth.demoLogin();
    void this.router.navigateByUrl('/profile');
  }
}
