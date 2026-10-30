import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/icon';
@Component({
  imports: [RouterLink, IconComponent],
  template: `<div class="page plus-page">
    <section class="plus-hero">
      <p class="eyebrow accent">THE STORY GOES A LITTLE DEEPER</p>
      <h1>Dumb & Dahmer <em>Plus.</em></h1>
      <p>Λίγο παραπάνω από την παρέα μας.<br />Μάθε για τη συνδρομή στην επίσημη σελίδα του podcast.</p>
      <a
        href="https://www.buzzsprout.com/2006539/subscribe"
        target="_blank"
        rel="noopener noreferrer"
        class="button primary"
        >Συνδρομή στο Buzzsprout <dd-icon name="external" /></a
      ><span class="tiny-label">Η ΣΥΝΔΡΟΜΗ ΓΙΝΕΤΑΙ ΣΤΟ ΕΠΙΣΗΜΟ BUZZSPROUT</span>
    </section>
    <div class="plus-content">
      <div>
        <p class="eyebrow">Η ΠΡΟΣΩΠΙΚΗ ΣΟΥ ΣΥΧΝΟΤΗΤΑ</p>
        <h2>Είσαι ήδη συνδρομητής;</h2>
        <p>Το προσωπικό premium RSS σου ανοίγει τα επεισόδια της συνδρομής σε συμβατές εφαρμογές podcast.</p>
        <ol class="instruction-list">
          <li>
            <span>01</span>
            <div>
              <h3>Βρες το email του Buzzsprout.</h3>
              <p>
                Μετά τη συνδρομή, το Buzzsprout στέλνει email με οδηγίες και το προσωπικό premium RSS. Έλεγξε
                και τον φάκελο ανεπιθύμητων.
              </p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Διάλεξε την εφαρμογή σου.</h3>
              <p>
                Ακολούθησε τις οδηγίες του email ή πρόσθεσε το ιδιωτικό feed σε έναν συμβατό player, όπως
                Apple Podcasts, Overcast ή Pocket Casts.
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Πρόσθεσε το RSS στον player.</h3>
              <p>
                Βρες την επιλογή προσθήκης podcast μέσω URL και χρησιμοποίησε τον προσωπικό σύνδεσμο μέσα στη
                δική σου εφαρμογή podcast.
              </p>
            </div>
          </li>
        </ol>
        <a
          href="https://www.buzzsprout.com/help/186-personal-rss"
          target="_blank"
          rel="noopener noreferrer"
          class="text-button"
          >Οι αναλυτικές οδηγίες του Buzzsprout <dd-icon name="external"
        /></a>
      </div>
      <aside class="premium-note">
        <dd-icon name="lock" />
        <h3>Ο σύνδεσμός σου είναι προσωπικός.</h3>
        <p>
          Κράτησε το ιδιωτικό RSS εμπιστευτικό. Όποιος έχει τον σύνδεσμο μπορεί να αποκτήσει πρόσβαση στο feed
          σου.
        </p>
        <p>
          Η εφαρμογή αυτή παίζει μόνο δημόσια επεισόδια. Δεν ζητά το προσωπικό RSS σου και δεν διαχειρίζεται
          συνδρομές.
        </p>
        <span class="tag">PUBLIC PLAYBACK ONLY</span
        ><a routerLink="/episodes" class="text-button">Στο δημόσιο αρχείο <dd-icon name="arrow" /></a>
      </aside>
    </div>
  </div>`,
})
export class PlusComponent {}
