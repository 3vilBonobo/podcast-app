import type { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    title: 'Dumb & Dahmer — Έλα για τσάι.',
    loadComponent: () => import('./features/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'episodes',
    title: 'Το αρχείο · Dumb & Dahmer',
    loadComponent: () => import('./features/episodes/episodes').then((m) => m.EpisodesComponent),
  },
  {
    path: 'episodes/:id',
    title: 'Επεισόδιο · Dumb & Dahmer',
    loadComponent: () => import('./features/episodes/details').then((m) => m.EpisodeDetailsComponent),
  },
  {
    path: 'library',
    title: 'Η βιβλιοθήκη σου · Dumb & Dahmer',
    loadComponent: () => import('./features/library/library').then((m) => m.LibraryComponent),
  },
  {
    path: 'extras',
    title: 'Πέρα από το μικρόφωνο · Dumb & Dahmer',
    loadComponent: () => import('./features/extras/extras').then((m) => m.ExtrasComponent),
  },
  {
    path: 'extras/:slug',
    title: 'Extras · Dumb & Dahmer',
    loadComponent: () => import('./features/extras/detail').then((m) => m.ExtraDetailComponent),
  },
  {
    path: 'profile',
    title: 'Ο χώρος σου · Dumb & Dahmer',
    loadComponent: () => import('./features/profile/profile').then((m) => m.ProfileComponent),
  },
  {
    path: 'auth/:mode',
    title: 'Καλώς ήρθες · Dumb & Dahmer',
    loadComponent: () => import('./features/auth/auth').then((m) => m.AuthComponent),
  },
  {
    path: 'plus',
    title: 'Dumb & Dahmer Plus',
    loadComponent: () => import('./features/plus/plus').then((m) => m.PlusComponent),
  },
  {
    path: 'player',
    title: 'Τώρα ακούς · Dumb & Dahmer',
    loadComponent: () => import('./features/player/player').then((m) => m.PlayerComponent),
  },
  {
    path: '**',
    title: 'Η σελίδα χάθηκε · Dumb & Dahmer',
    loadComponent: () => import('./features/not-found').then((m) => m.NotFoundComponent),
  },
];
