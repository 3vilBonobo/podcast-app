import type { CrimeCategory } from './models';
export const CRIME_CATEGORIES: { id: CrimeCategory; label: string; icon: string }[] = [
  { id: 'serial-killers', label: 'categories.serialKillers', icon: 'knife' },
  { id: 'cults', label: 'categories.cults', icon: 'cult' },
  { id: 'robberies', label: 'categories.robberies', icon: 'robbery' },
  { id: 'historical', label: 'categories.historicalCases', icon: 'history' },
  { id: 'unsolved', label: 'categories.unsolvedMysteries', icon: 'eye' },
  { id: 'disappearances', label: 'categories.disappearances', icon: 'search' },
  { id: 'other', label: 'categories.otherCases', icon: 'folder' },
];
