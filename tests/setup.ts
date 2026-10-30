import '@angular/compiler';
import 'fake-indexeddb/auto';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { vi } from 'vitest';
getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi
    .fn()
    .mockImplementation(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
});
