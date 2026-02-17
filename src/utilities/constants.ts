export const METADATA = {
  siteName: 'Название',
  siteUrl: 'https://example.com',
  siteDescription: 'Описание',
  siteKeywords: 'ключевые слова',
  siteKey: 'name',
  homePage: {
    title: 'Главная',
    description: 'Главная страница',
  },
  aboutPage: {
    title: 'О нас',
    description: 'Описание страницы о нас',
  },
  reviewsPage: {
    title: 'Отзывы',
    description: 'Описание страницы отзывов',
  },
};

export const REVALIDATE_TIME = 60;

export const PAGE_SLUGS = {
  about: 'about',
  reviews: 'reviews',
  home: 'home',
  collections: 'collections',
  blog: 'blog',
} as const;

export const BLOCK_TYPES = {
  hero: 'hero',
} as const;
