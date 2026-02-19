import { Variants } from 'framer-motion';
import {
  Film,
  LucideIcon,
  Palette,
  Tv,
  ListIcon,
  ThumbsUp,
  Minus,
  ThumbsDown,
} from 'lucide-react';

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
// Метаданные
// ============================================================================

// Метаданные сайта.
export const METADATA = {
  siteName: 'ПРОСМОТРЕНО',
  siteUrl: 'https://plotbreakers.vercel.app/',
  siteDescription:
    'Пересказы сюжетов и оценки просмотренных мной фильмов и сериалов, чтобы вы тратили время только на действительно стоящие истории.',
  siteKeywords:
    'фильмы, сериалы, аниме, пересказы, сюжеты, оценки, просмотренные фильмы, просмотренные сериалы, просмотренные аниме',
  siteKey: 'plotbreakers',
  homePage: {
    title: 'ПРОСМОТРЕНО | ГЛАВНАЯ',
    description:
      'Пересказы сюжетов и оценки просмотренных мной фильмов и сериалов, чтобы вы тратили время только на действительно стоящие истории.',
  },
  aboutPage: {
    title: 'ПРОСМОТРЕНО | О ПРОЕКТЕ',
    description: 'Минималистичный журнал о визуальном повествовании в кино.',
  },
  reviewsPage: {
    title: 'ПРОСМОТРЕНО | ОТЗЫВЫ',
    description: 'Описание страницы отзывов',
  },
  collectionsPage: {
    title: 'ПРОСМОТРЕНО | КУРАТОРСКИЕ ПОДБОРКИ',
    description: 'Кураторские подборки фильмов, сериалов и анимации.',
  },
  blogPage: {
    title: 'ПРОСМОТРЕНО | БЛОГ',
    description: 'Статьи и заметки о кино, сериалах и анимации.',
  },
};

// ============================================================================
// Коллекции / Блоки / Страницы
// ============================================================================

// Список слагов для коллекций.
export const COLLECTION_SLUGS = {
  users: 'users',
  media: 'media',
  pages: 'pages',
  mediaContents: 'media-contents',
  collections: 'collections',
  posts: 'posts',
} as const;

// Список слагов для страниц.
export const PAGE_SLUGS = {
  about: 'about',
  reviews: 'reviews',
  home: 'home',
  collections: 'collections',
  blog: 'blog',
} as const;

// Список типов блоков.
export const BLOCK_TYPES = {
  hero: 'hero',
  about: 'about',
} as const;

// Конфигурация пагинации.
export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50],
};

// Значение "Все".
export const ALL_VALUE = '__all__';

// ============================================================================
// Коллекция - MediaContents
// ============================================================================

// Список типов медиа-контента.
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

// Список статусов просмотра.
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

// Список жанров для медиа-контента.
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

// Список жанров для медиа-контента.
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
  { label: string; icon: LucideIcon; bg: string; color: string; border: string }
> = {
  film: {
    label: 'Фильм',
    icon: Film,
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    color: 'text-blue-500',
    border: 'border-blue-500',
  },
  series: {
    label: 'Сериал',
    icon: Tv,
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    color: 'text-purple-500',
    border: 'border-purple-500',
  },
  cartoon: {
    label: 'Мультфильм',
    icon: Palette,
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    color: 'text-rose-500',
    border: 'border-rose-500',
  },
};

// Конфигурация отображения впечатлений.
export const OPINION_CONFIG: Record<
  string,
  { icon: typeof ThumbsUp; label: string; color: string }
> = {
  like: { icon: ThumbsUp, label: 'Понравилось', color: 'text-green-500' },
  neutral: { icon: Minus, label: 'Пойдет', color: 'text-yellow-500' },
  dislike: { icon: ThumbsDown, label: 'Потрачено', color: 'text-red-500' },
};

// Конфигурация отображения фильтров.
export const FALLBACK_CINFIG = {
  label: 'Контент',
  icon: ListIcon,
  bg: 'bg-zinc-100',
  color: 'text-zinc-500',
  border: 'border-zinc-200',
};

// ============================================================================
// Константы - Фильтры
// ============================================================================

// Фильтры для главной страницы
export const HOMEPAGE_FILTERS = {
  // Вкладки по типу контента
  types: [
    { label: 'Все', value: ALL_VALUE },
    ...MEDIA_CONTENT_TYPES.select.map((t) => ({
      label: t.label,
      value: t.value,
    })),
  ],
  // Опции для фильтра впечатления
  opinions: [
    { label: 'Все', value: ALL_VALUE },
    ...MEDIA_CONTENT_PERSONAL_OPINION.select.map((o) => ({
      label: o.label,
      value: o.value,
    })),
  ],
  // Диапазоны рейтинга
  ratings: [
    { label: 'Все', value: ALL_VALUE },
    { label: '9–10', value: '9-10' },
    { label: '7–8.9', value: '7-8.9' },
    { label: '5–6.9', value: '5-6.9' },
    { label: '< 5', value: '0-4.9' },
  ],
};
