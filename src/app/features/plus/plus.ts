import { TranslocoDirective } from '@jsverse/transloco';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/icon';
@Component({
  imports: [TranslocoDirective, RouterLink, IconComponent],
  template: `<ng-container *transloco="let t"><div class="page plus-page">
    <section class="plus-hero">
      <p class="eyebrow accent">THE STORY GOES A LITTLE DEEPER</p>
      <h1>Dumb & Dahmer <em>Plus.</em></h1>
      <p>{{ t('plus.aLittleMoreOfOurCompany') }}<br />{{ t('plus.learnAboutSubscribingOnTheOfficialPodcastPage') }}</p>
      <a
        href="https://www.buzzsprout.com/2006539/subscribe"
        target="_blank"
        rel="noopener noreferrer"
        class="button primary"
        >{{ t('plus.subscribeOnBuzzsprout') }} <dd-icon name="external" /></a
      ><span class="tiny-label">{{ t('plus.subscriptionsAreHandledByTheOfficialBuzzsproutPage') }}</span>
    </section>
    <div class="plus-content">
      <div>
        <p class="eyebrow">{{ t('plus.yourPersonalFrequency') }}</p>
        <h2>{{ t('plus.alreadyASubscriber') }}</h2>
        <p>{{ t('plus.yourPersonalPremiumRssOpensSubscriberEpisodesIn') }}</p>
        <ol class="instruction-list">
          <li>
            <span>01</span>
            <div>
              <h3>{{ t('plus.findTheEmailFromBuzzsprout') }}</h3>
              <p>
                {{ t('plus.afterYouSubscribeBuzzsproutSendsAnEmailWith') }}
              </p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>{{ t('plus.chooseYourApp') }}</h3>
              <p>
                {{ t('plus.followTheEmailInstructionsOrAddYourPrivate') }}
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>{{ t('plus.addTheRssToYourPlayer') }}</h3>
              <p>
                {{ t('plus.findTheOptionToAddAPodcastBy') }}
              </p>
            </div>
          </li>
        </ol>
        <a
          href="https://www.buzzsprout.com/help/186-personal-rss"
          target="_blank"
          rel="noopener noreferrer"
          class="text-button"
          >{{ t('plus.fullInstructionsFromBuzzsprout') }} <dd-icon name="external"
        /></a>
      </div>
      <aside class="premium-note">
        <dd-icon name="lock" />
        <h3>{{ t('plus.yourLinkIsPersonal') }}</h3>
        <p>
          {{ t('plus.keepYourPrivateRssConfidentialAnyoneWithThe') }}
        </p>
        <p>
          {{ t('plus.thisAppOnlyPlaysPublicEpisodesItDoes') }}
        </p>
        <span class="tag">PUBLIC PLAYBACK ONLY</span
        ><a routerLink="/episodes" class="text-button">{{ t('plus.goToThePublicArchive') }} <dd-icon name="arrow" /></a>
      </aside>
    </div>
  </div></ng-container>`,
})
export class PlusComponent {}
