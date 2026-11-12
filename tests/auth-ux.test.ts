import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthComponent } from '../src/app/features/auth/auth';
import { MockAuthService } from '../src/app/core/preferences.service';

describe('authentication prototype route changes', () => {
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let auth: AuthComponent;

  beforeEach(() => {
    params = new BehaviorSubject(convertToParamMap({ mode: 'login' }));
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: params, snapshot: { paramMap: params.value } } },
        { provide: Router, useValue: {} },
        { provide: MockAuthService, useValue: {} },
      ],
    });
    auth = TestBed.runInInjectionContext(() => new AuthComponent());
    TestBed.tick();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('clears stale feedback, password and validation state while keeping the email', () => {
    for (const mode of ['register', 'forgot', 'login']) {
      auth.form.setValue({ email: 'listener@example.com', password: 'prototype-only' });
      auth.showPassword.set(true);
      auth.submit();
      auth.form.controls.password.setValue('sensitive-test-value');
      auth.form.markAllAsTouched();
      params.next(convertToParamMap({ mode }));
      TestBed.tick();
      expect(auth.mode()).toBe(mode);
      expect(auth.message()).toBe('');
      expect(auth.showPassword()).toBe(false);
      expect(auth.form.value).toEqual({ email: 'listener@example.com', password: '' });
      expect(auth.form.untouched).toBe(true);
      expect(auth.form.pristine).toBe(true);
    }
  });

  it('focuses the first invalid field on submission, including email-only recovery', () => {
    const email = document.createElement('input');
    email.id = 'auth-email';
    const password = document.createElement('input');
    password.id = 'auth-password';
    document.body.append(email, password);
    try {
      auth.submit();
      expect(document.activeElement).toBe(email);
      auth.form.controls.email.setValue('listener@example.com');
      auth.submit();
      expect(document.activeElement).toBe(password);
      params.next(convertToParamMap({ mode: 'forgot' }));
      TestBed.tick();
      auth.form.controls.email.setValue('invalid');
      auth.submit();
      expect(document.activeElement).toBe(email);
    } finally {
      email.remove();
      password.remove();
    }
  });
});
