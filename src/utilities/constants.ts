import { Variants } from 'framer-motion';
import { Film, LucideIcon, Palette, Tv, ListIcon } from 'lucide-react';

// ============================================================================
// Анимации
// ============================================================================

// Анимации для контейнера и элементов.
export const ANIMATIONS = {
  containerVariants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  } as Variants,
  itemVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  } as Variants,
};

// ============================================================================
//
// ============================================================================

/**
 * Метаданные сайта.
 * Используется для фильтрации и классификации.
 */
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

/**
 * Время пересчета.
 * Используется для пересчета данных в базе данных.
 */
export const REVALIDATE_TIME = 60;

/**
 * Список слагов для коллекций.
 * Используется для фильтрации и классификации.
 */
export const COLLECTION_SLUGS = {
  users: 'users',
  media: 'media',
  pages: 'pages',
  mediaContents: 'media-contents',
  collections: 'collections',
  posts: 'posts',
} as const;

/**
 * Список слагов для страниц.
 * Используется для фильтрации и классификации.
 */
export const PAGE_SLUGS = {
  about: 'about',
  reviews: 'reviews',
  home: 'home',
  collections: 'collections',
  blog: 'blog',
} as const;

/**
 * Типы блоков.
 * Используется для фильтрации и классификации.
 */
export const BLOCK_TYPES = {
  hero: 'hero',
  about: 'about',
} as const;

/**
 * Типы медиа-контента.
 * Используется для фильтрации и классификации.
 */
export const MEDIA_CONTENT_TYPES = {
  slug: {
    film: 'film',
    series: 'series',
    cartoon: 'cartoon',
  },
  select: [
    { label: 'Фильм', value: 'film' },
    { label: 'Сериал', value: 'series' },
    { label: 'Мультфильм', value: 'cartoon' },
  ],
} as const;

/**
 * Статусы просмотра.
 * Используется для фильтрации и классификации.
 */
export const MEDIA_CONTENT_STATUS = {
  slug: {
    planned: 'planned',
    watching: 'watching',
    watched: 'watched',
    abandoned: 'abandoned',
  },
  select: [
    { label: 'Планирую посмотреть', value: 'planned' },
    { label: 'Смотрю', value: 'watching' },
    { label: 'Просмотрено', value: 'watched' },
    { label: 'Заброшено', value: 'abandoned' },
  ],
} as const;

export const MEDIA_CONTENT_PERSONAL_OPINION = {
  slug: {
    like: 'like',
    neutral: 'neutral',
    dislike: 'dislike',
  },
  select: [
    { label: 'Понравилось (7-10)', value: 'like' },
    { label: 'Пойдет (5-6)', value: 'neutral' },
    { label: 'Потрачено (1-4)', value: 'dislike' },
  ],
} as const;

/**
 * Список жанров для медиа-контента.
 * Используется для фильтрации и классификации.
 */
export const GENRES = [
  { label: 'Биография', value: 'biography' },
  { label: 'Боевик', value: 'action' },
  { label: 'Вестерн', value: 'western' },
  { label: 'Военный', value: 'war' },
  { label: 'Детектив', value: 'mystery' },
  { label: 'Документальный', value: 'documentary' },
  { label: 'Драма', value: 'drama' },
  { label: 'История', value: 'history' },
  { label: 'Комедия', value: 'comedy' },
  { label: 'Короткометражка', value: 'short' },
  { label: 'Криминал', value: 'crime' },
  { label: 'Мелодрама', value: 'romance' },
  { label: 'Мистика', value: 'mystic' },
  { label: 'Музыка', value: 'music' },
  { label: 'Мюзикл', value: 'musical' },
  { label: 'Приключения', value: 'adventure' },
  { label: 'Семейный', value: 'family' },
  { label: 'Спорт', value: 'sport' },
  { label: 'Триллер', value: 'thriller' },
  { label: 'Ужасы', value: 'horror' },
  { label: 'Фантастика', value: 'sci-fi' },
  { label: 'Фэнтези', value: 'fantasy' },
  { label: 'Анимация', value: 'animation' },
] as const;

/**
 * Список жанров для медиа-контента.
 * Используется для фильтрации и классификации TMDB.
 */
export const GENRE_MAPPING_TMDB: Record<string, string> = {
  боевик: 'action',
  приключения: 'adventure',
  мультфильм: 'animation',
  комедия: 'comedy',
  криминал: 'crime',
  документальный: 'documentary',
  драма: 'drama',
  семейный: 'family',
  фэнтези: 'fantasy',
  история: 'history',
  ужасы: 'horror',
  музыка: 'music',
  мюзикл: 'musical',
  детектив: 'mystery',
  мелодрама: 'romance',
  фантастика: 'sci-fi',
  триллер: 'thriller',
  военный: 'war',
  вестерн: 'western',
  биография: 'biography',
  мистика: 'mystic',
  спорт: 'sport',
  короткометражка: 'short',
};

// ============================================================================
// Константы для коллекций - Collections
// ============================================================================

// Фильтры для коллекций.
export const FILTERS_COLLECTIONS = [
  {
    label: 'Тип контента',
    placeholder: 'Все',
    options: [
      { value: 'all_type', label: 'Все' },
      ...MEDIA_CONTENT_TYPES.select,
    ],
  },
];

// Конфигурация отображения типов контента в карточках.
export const TYPE_CONFIG: Record<
  string,
  { label: string; icon: LucideIcon; bg: string; color: string }
> = {
  film: {
    label: 'Фильм',
    icon: Film,
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    color: 'text-blue-500',
  },
  series: {
    label: 'Сериал',
    icon: Tv,
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    color: 'text-purple-500',
  },
  cartoon: {
    label: 'Мультфильм',
    icon: Palette,
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    color: 'text-rose-500',
  },
};

// ============================================================================
// Константы для коллекций - AboutBlock
// ============================================================================
