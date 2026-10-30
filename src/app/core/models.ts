export interface Episode {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  duration: number;
  episodeNumber: number | null;
  season: number | null;
  artwork: string;
  localArtwork?: string;
  audioUrl: string;
  audioType: string;
  explicit: boolean;
  episodeType: 'full' | 'trailer' | 'bonus';
  contentKind: 'public-episode' | 'promotional-preview';
  categories: CrimeCategory[];
  categorySource: 'editorial-keywords';
  link: string;
  access: 'public';
}
export interface Catalog {
  schemaVersion: number;
  source: string;
  fetchedAt: string;
  fixture: boolean;
  title: string;
  description: string;
  artwork: string;
  localArtwork?: string;
  episodes: Episode[];
}
export interface ListeningRecord {
  episodeId: string;
  position: number;
  duration: number;
  completed: boolean;
  lastPlayed: number;
  listenedSeconds: number;
}
export interface LibrarySnapshot {
  favorites: string[];
  queue: string[];
  records: Record<string, ListeningRecord>;
  currentId: string | null;
}
export interface DemoUser {
  displayName: string;
  demo: true;
}
export type Theme = 'noir' | 'archive' | 'after-hours';
export type Language = 'el' | 'en';
export type CrimeCategory =
  | 'serial-killers'
  | 'cults'
  | 'robberies'
  | 'historical'
  | 'unsolved'
  | 'disappearances'
  | 'other';
