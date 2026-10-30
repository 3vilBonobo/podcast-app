import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService, MockAuthService, I18nService } from '../../core/preferences.service';
import { LibraryService } from '../../core/library.service';
import { AudioPlayerService } from '../../core/audio-player.service';
import { IconComponent } from '../../shared/icon';
import type { Theme, Language } from '../../core/models';
@Component({
  imports: [RouterLink, IconComponent],
  template: `<div class="page">
    <div class="page-intro">
      <div>
        <p class="eyebrow accent">ΣΑΝ ΣΤΟ ΣΠΙΤΙ ΣΟΥ. ΣΧΕΔΟΝ.</p>
        <h1>Ο χώρος σου<span class="accent">.</span></h1>
        <p class="intro-description">Οι ιστορίες σου, με τους δικούς σου όρους.</p>
      </div>
    </div>
    <section class="profile-card">
      <div class="avatar large-avatar">{{ auth.guest() ? 'Ε' : 'Ν' }}</div>
      <div>
        <p class="eyebrow accent">{{ auth.guest() ? 'GUEST LISTENER' : 'LOCAL DEMO ACCOUNT' }}</p>
        <h2>{{ auth.user()?.displayName ?? 'Καλώς ήρθες, επισκέπτη.' }}</h2>
        <p>
          {{
            auth.guest()
              ? 'Η ακρόαση δεν χρειάζεται συστάσεις.'
              : 'Ένα δοκιμαστικό προφίλ, μόνο σε αυτή τη συσκευή.'
          }}
        </p>
      </div>
      @if (auth.guest()) {
        <a routerLink="/auth/login" class="button secondary">Γνώρισέ μας <dd-icon name="arrow" /></a>
      } @else {
        <button class="button secondary" (click)="auth.logout()">Έξοδος από το demo</button>
      }
    </section>
    <div class="stats-grid">
      <div>
        <span class="eyebrow">ΛΕΠΤΑ ΑΚΡΟΑΣΗΣ</span><strong>{{ library.minutes() }}</strong
        ><span>Πραγματικός χρόνος ακρόασης</span>
      </div>
      <div>
        <span class="eyebrow">ΥΠΟΘΕΣΕΙΣ ΠΟΥ ΕΚΛΕΙΣΑΝ</span><strong>{{ library.completed().length }}</strong
        ><span>Ολοκληρωμένα επεισόδια</span>
      </div>
      <a routerLink="/library"
        ><span class="eyebrow">ΚΟΝΤΑ ΣΤΗΝ ΚΑΡΔΙΑ</span><strong>{{ library.state().favorites.length }}</strong
        ><span>Αγαπημένες ιστορίες <dd-icon name="arrow" /></span
      ></a>
    </div>
    @if (!library.records().length) {
      <p class="privacy-note">Οι μετρητές ξεκινούν από το μηδέν. Η πρώτη σου ακρόαση θα γράψει την αρχή.</p>
    }
    <div class="settings-grid">
      <section class="settings-panel">
        <p class="eyebrow">MAKE YOURSELF AT HOME</p>
        <h2>Η δική σου ατμόσφαιρα</h2>
        <p class="muted">Διάλεξε σε τι φως θα ακούσεις την επόμενη ιστορία.</p>
        <div class="theme-grid" role="group" aria-label="Επιλογή θέματος">
          @for (option of themes; track option.id) {
            <button
              class="theme-option"
              [class.chosen]="theme.choice() === option.id"
              [attr.aria-pressed]="theme.choice() === option.id"
              (click)="theme.set(option.id)"
            >
              <span [class]="'theme-swatch swatch-' + option.id"><span></span><span></span><span></span></span
              ><strong>{{ option.name }}</strong
              ><small>{{ option.description }}</small>
              @if (theme.choice() === option.id) {
                <dd-icon name="check" />
              }
            </button>
          }
        </div>
        <button
          class="text-button system-theme"
          (click)="theme.set('system')"
          [attr.aria-pressed]="theme.choice() === 'system'"
        >
          <dd-icon [name]="theme.choice() === 'system' ? 'check' : 'sun'" /> Ακολούθησε το σύστημα
        </button>
      </section>
      <section class="settings-panel">
        <p class="eyebrow">JUST THE WAY YOU LIKE IT</p>
        <h2>Προτιμήσεις ακρόασης</h2>
        <label class="setting-row"
          ><span
            ><strong>Ταχύτητα αναπαραγωγής</strong
            ><small>Αποθηκεύεται για τις επόμενες ακροάσεις.</small></span
          ><select
            aria-label="Προεπιλεγμένη ταχύτητα"
            [value]="player.speed()"
            (change)="player.setSpeed(+$any($event.target).value)"
          >
            @for (speed of speeds; track speed) {
              <option [value]="speed" [selected]="speed === player.speed()">{{ speed }}×</option>
            }
          </select></label
        ><label class="setting-row"
          ><span
            ><strong>Γλώσσα πλοήγησης</strong
            ><small>Προεπισκόπηση English · το περιεχόμενο παραμένει ελληνικό.</small></span
          ><select
            aria-label="Γλώσσα πλοήγησης"
            [value]="i18n.language()"
            (change)="setLanguage($any($event.target).value)"
          >
            <option value="el">Ελληνικά</option>
            <option value="en">English</option>
          </select></label
        >
        <div class="setting-row">
          <span><strong>Η βιβλιοθήκη σου</strong><small>Τοπική αποθήκευση με IndexedDB.</small></span
          ><span class="tag">ON DEVICE</span>
        </div>
      </section>
    </div>
    <section class="settings-panel account-panel">
      <div>
        <p class="eyebrow">Ο ΛΟΓΑΡΙΑΣΜΟΣ ΣΟΥ</p>
        <h2>Κάθε ιστορία έχει συνέχεια.</h2>
        <p>
          Οι λογαριασμοί και ο συγχρονισμός μεταξύ συσκευών θα προστεθούν σε επόμενη φάση. Το demo δεν
          ενεργοποιεί συνδρομή ή προστατευμένο περιεχόμενο.
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        @if (auth.guest()) {
          <button class="button secondary" (click)="auth.demoLogin()">Μπες στο Demo Account</button>
        }
        <a routerLink="/plus" class="button primary">Πληροφορίες Plus <dd-icon name="arrow" /></a>
      </div>
    </section>
  </div>`,
})
export class ProfileComponent {
  readonly theme = inject(ThemeService);
  readonly auth = inject(MockAuthService);
  readonly i18n = inject(I18nService);
  readonly library = inject(LibraryService);
  readonly player = inject(AudioPlayerService);
  readonly speeds = [0.75, 1, 1.25, 1.5, 1.75, 2];
  readonly themes: { id: Theme; name: string; description: string }[] = [
    { id: 'noir', name: 'Noir', description: 'Η κλασική σκοτεινή πλευρά' },
    { id: 'archive', name: 'Archive', description: 'Μια ιστορία στο φως' },
    { id: 'after-hours', name: 'After Hours', description: 'Για μετά τα μεσάνυχτα' },
  ];
  setLanguage(value: string): void {
    this.i18n.set(value as Language);
  }
}
