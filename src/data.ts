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
    bio: 'Techno, hard techno e melodic techno.',
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
    bio: 'Tech house e host.',
    imageUrl: '/assets/phari.png',
    latestMix: '/podcast',
    socials: {
      facebook: 'https://www.facebook.com/djphari',
      website: 'https://linktr.ee/djphari',
    },
  },
];
