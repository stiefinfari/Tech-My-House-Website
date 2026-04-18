export type ArtistSocialKey = 'instagram' | 'soundcloud' | 'youtube' | 'tiktok' | 'facebook' | 'website';

export type Artist = {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl?: string;
  location?: string;
  socials: Partial<Record<ArtistSocialKey, string>>;
};

export type Release = {
  id: string;
  catNum: string;
  artist: string;
  title: string;
  date: string;
  coverUrl: string;
  status: 'PRE-SAVE' | 'OUT SOON' | 'OUT NOW';
  link?: string;
};

export const releases: Release[] = [
  {
    id: 'tmh-001',
    catNum: 'TMH001',
    artist: 'Lysa Chain',
    title: 'Warehouse Protocol',
    date: '2026-06-12',
    coverUrl: '/assets/placeholder-cover-1.jpg',
    status: 'PRE-SAVE',
    link: '#',
  },
  {
    id: 'tmh-002',
    catNum: 'TMH002',
    artist: 'Phari',
    title: 'Acid Baseline',
    date: '2026-07-24',
    coverUrl: '/assets/placeholder-cover-2.jpg',
    status: 'OUT SOON',
  },
  {
    id: 'tmh-003',
    catNum: 'TMH003',
    artist: 'Various Artists',
    title: 'Tech My House Vol. 1',
    date: '2026-09-10',
    coverUrl: '/assets/placeholder-cover-3.jpg',
    status: 'OUT SOON',
  },
];

export const artists: Artist[] = [
  {
    id: 'lysa-chain',
    name: 'Lysa Chain',
    role: 'DJ / Producer',
    bio: 'Techno and Tech House DJ and Producer.',
    imageUrl: '/assets/lysa-chain.png',
    socials: {
      instagram: 'https://instagram.com/lysachain',
      soundcloud: 'https://soundcloud.com/lysachain',
    },
  },
  {
    id: 'phari',
    name: 'Phari',
    role: 'DJ / Host',
    bio: 'Host of Tech My House Radio Show.',
    imageUrl: '/assets/phari.png',
    socials: {
      facebook: 'https://www.facebook.com/djphari',
      website: 'https://linktr.ee/djphari',
    },
  },
  {
    id: 'people',
    name: 'People',
    role: 'Project',
    bio: 'Featured artists on Tech My House Radio Show.',
    socials: {
      facebook: 'https://www.facebook.com/Peopleev',
    },
  },
  {
    id: 'philip-stan',
    name: 'Philip Stan',
    role: 'DJ',
    bio: 'Featured artist on Tech My House Radio Show.',
    socials: {
      facebook: 'https://www.facebook.com/filipposant99',
    },
  },
  {
    id: 'barbe',
    name: 'Barbe',
    role: 'DJ',
    bio: 'Featured artist on Tech My House Radio Show.',
    socials: {
      facebook: 'https://www.facebook.com/mattia.barbon1',
    },
  },
  {
    id: 'be-a-son',
    name: 'Be.A.Son',
    role: 'DJ',
    bio: 'Featured artist on Tech My House Radio Show.',
    socials: {
      facebook: 'https://www.facebook.com/simo.biason',
    },
  },
];
