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
    greek: 'Μην κλείσεις τα μάτια.',
    description: 'Μια διαδραστική εμπειρία μυστηρίου ετοιμάζεται. Η μηχανή δεν έχει ξυπνήσει ακόμα.',
    icon: 'eye',
    number: '001',
    className: 'waking',
  },
  {
    slug: 'secret-archive',
    title: 'SECRET ARCHIVE',
    greek: 'Δεν είναι όλα για το αρχείο.',
    description: 'Ένας χώρος για μελλοντικά κρυμμένα στοιχεία και συλλεκτικό υλικό του podcast.',
    icon: 'folder',
    number: '002',
    className: 'secret',
  },
  {
    slug: 'seasonal-events',
    title: 'SEASONAL EVENTS',
    greek: 'Κάθε εποχή έχει τα φαντάσματά της.',
    description:
      'Θεματικές εμπειρίες και μικρές εκπλήξεις, από το Halloween μέχρι την επόμενη σκοτεινή νύχτα.',
    icon: 'moon',
    number: '003',
    className: 'seasonal',
  },
  {
    slug: 'rewards',
    title: 'REWARDS',
    greek: 'Για την αφοσίωση στο σκοτάδι.',
    description:
      'Μελλοντικές συλλογές από σήματα, εμφανίσεις και εμπειρίες. Οι κανόνες δεν έχουν οριστεί ακόμα.',
    icon: 'gift',
    number: '004',
    className: 'rewards',
  },
  {
    slug: 'behind-the-mic',
    title: 'BEHIND THE MIC',
    greek: 'Όταν σβήνει το κόκκινο φωτάκι.',
    description:
      'Ένας μελλοντικός χώρος για παρασκήνια, φωτογραφίες και έξτρα υλικό από την Έλενα και την Ειρηνέλλα.',
    icon: 'mic',
    number: '005',
    className: 'behind',
  },
];
