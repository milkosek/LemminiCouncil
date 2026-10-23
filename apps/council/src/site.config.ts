/**
 * Site-wide settings.
 */
export const site = {
  title: 'Lemmini Council',
  tagline: 'In a world full of lemmings be a lemming. But different.',
  description:
    'Personal project shining light and thoughts on the IT industry, unethical business practices and a sprinkle of philosophy.',
  author: 'Mateusz Miłkowski',
  locale: 'en',

  /** Leave a value empty to hide that link. */
  social: {
    github: 'milkosek',
    linkedin: 'https://www.linkedin.com/in/mateusz-milkowski/',
  },

  /** Repositories shown on the About page are fetched from GitHub at build time. */
  portfolio: {
    maxShownReposCount: 6,
    /** Repo names to always hide (forks are hidden automatically). */
    exclude: [] as string[],
  },
} as const;

export const nav = [
  { href: '/posts/', label: 'Posts' },
  { href: '/tags/', label: 'Tags' },
  { href: '/about/', label: 'About' },
  { href: '/search/', label: 'Search' },
] as const;
