export interface Extra {
  slug: string;
  title: string;
  tagline: string;
  pending: string;
  description: string;
  icon: string;
  number: string;
  className: string;
}
export const EXTRAS: Extra[] = [
  {
    slug: 'waking-machine',
    title: 'extras.names.waking',
    tagline: 'extras.doNotCloseYourEyes',
    pending: 'extras.pending.waking',
    description: 'extras.anInteractiveMysteryIsTakingShapeTheMachine',
    icon: 'eye',
    number: '001',
    className: 'waking',
  },
  {
    slug: 'secret-archive',
    title: 'extras.names.secret',
    tagline: 'extras.notEverythingBelongsInTheArchive',
    pending: 'extras.pending.secret',
    description: 'extras.aFutureHomeForHiddenCluesAndPodcast',
    icon: 'folder',
    number: '002',
    className: 'secret',
  },
  {
    slug: 'seasonal-events',
    title: 'extras.names.seasonal',
    tagline: 'extras.everySeasonHasItsGhosts',
    pending: 'extras.pending.seasonal',
    description: 'extras.themedExperiencesAndLittleSurprisesFromHalloweenTo',
    icon: 'moon',
    number: '003',
    className: 'seasonal',
  },
  {
    slug: 'rewards',
    title: 'extras.names.rewards',
    tagline: 'extras.forYourDevotionToTheDark',
    pending: 'extras.pending.rewards',
    description: 'extras.futureBadgesAppearancesAndExperiencesTheRulesHave',
    icon: 'gift',
    number: '004',
    className: 'rewards',
  },
  {
    slug: 'behind-the-mic',
    title: 'extras.names.behind',
    tagline: 'extras.whenTheRedLightGoesOut',
    pending: 'extras.pending.behind',
    description: 'extras.aFutureSpaceForBehindTheScenesStories',
    icon: 'mic',
    number: '005',
    className: 'behind',
  },
];
