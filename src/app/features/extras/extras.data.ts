export interface Extra {
  slug: string;
  title: string;
  greek: string;
  description: string;
  icon: string;
  number: string;
  className: string;
}
export const EXTRAS: Extra[] = [
  {
    slug: 'waking-machine',
    title: 'THE WAKING MACHINE',
    greek: "extras.doNotCloseYourEyes",
    description: "extras.anInteractiveMysteryIsTakingShapeTheMachine",
    icon: 'eye',
    number: '001',
    className: 'waking',
  },
  {
    slug: 'secret-archive',
    title: 'SECRET ARCHIVE',
    greek: "extras.notEverythingBelongsInTheArchive",
    description: "extras.aFutureHomeForHiddenCluesAndPodcast",
    icon: 'folder',
    number: '002',
    className: 'secret',
  },
  {
    slug: 'seasonal-events',
    title: 'SEASONAL EVENTS',
    greek: "extras.everySeasonHasItsGhosts",
    description:
      "extras.themedExperiencesAndLittleSurprisesFromHalloweenTo",
    icon: 'moon',
    number: '003',
    className: 'seasonal',
  },
  {
    slug: 'rewards',
    title: 'REWARDS',
    greek: "extras.forYourDevotionToTheDark",
    description:
      "extras.futureBadgesAppearancesAndExperiencesTheRulesHave",
    icon: 'gift',
    number: '004',
    className: 'rewards',
  },
  {
    slug: 'behind-the-mic',
    title: 'BEHIND THE MIC',
    greek: "extras.whenTheRedLightGoesOut",
    description:
      "extras.aFutureSpaceForBehindTheScenesStories",
    icon: 'mic',
    number: '005',
    className: 'behind',
  },
];
