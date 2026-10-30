import type { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    title: 'titles.dumbDahmerComeForTea',
    loadComponent: () => import('./features/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'episodes',
    title: 'titles.theArchiveDumbDahmer',
    loadComponent: () => import('./features/episodes/episodes').then((m) => m.EpisodesComponent),
  },
  {
    path: 'episodes/:id',
    title: 'titles.episodeDumbDahmer',
    loadComponent: () => import('./features/episodes/details').then((m) => m.EpisodeDetailsComponent),
  },
  {
    path: 'library',
    title: 'titles.yourLibraryDumbDahmer',
    loadComponent: () => import('./features/library/library').then((m) => m.LibraryComponent),
  },
  {
    path: 'extras',
    title: 'titles.beyondTheMicrophoneDumbDahmer',
    loadComponent: () => import('./features/extras/extras').then((m) => m.ExtrasComponent),
  },
  {
    path: 'extras/:slug',
    title: 'titles.extrasDetail',
    loadComponent: () => import('./features/extras/detail').then((m) => m.ExtraDetailComponent),
  },
  {
    path: 'profile',
    title: 'titles.yourSpaceDumbDahmer',
    loadComponent: () => import('./features/profile/profile').then((m) => m.ProfileComponent),
  },
  {
    path: 'auth/:mode',
    title: 'titles.welcomeDumbDahmer',
    loadComponent: () => import('./features/auth/auth').then((m) => m.AuthComponent),
  },
  {
    path: 'plus',
    title: 'titles.plus',
    loadComponent: () => import('./features/plus/plus').then((m) => m.PlusComponent),
  },
  {
    path: 'player',
    title: 'titles.nowPlayingDumbDahmer',
    loadComponent: () => import('./features/player/player').then((m) => m.PlayerComponent),
  },
  {
    path: '**',
    title: 'titles.pageNotFoundDumbDahmer',
    loadComponent: () => import('./features/not-found').then((m) => m.NotFoundComponent),
  },
];
