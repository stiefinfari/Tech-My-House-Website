export type ArtistSocialKey = 'instagram' | 'soundcloud' | 'youtube' | 'tiktok' | 'facebook' | 'website';

export type Artist = {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl?: string;
  latestMix?: string;
  location?: string;
  socials: Partial<Record<ArtistSocialKey, string>>;
};

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
    latestMix: '/podcast',
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
