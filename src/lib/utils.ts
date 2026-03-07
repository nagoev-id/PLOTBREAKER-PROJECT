import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isValid, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

import { TYPE_CONFIG, GENRES, FALLBACK_CINFIG } from './constants';

/**
 * Утилита для объединения CSS классов (clsx + tailwind-merge).
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/**
 * Overloaded getURL:
 * - 0-1 args: builds full server URL from path
 * - 3 args: resolves CMS link type/url/reference into href
 */
export function getURL(path?: string): string;
export function getURL(
  type?: 'custom' | 'reference' | null,
  url?: string | null,
  reference?: {
    relationTo: string;
    value: string | number | { slug?: string | null };
  } | null
): string | null;
export function getURL(
  typeOrPath?: string | null,
  url?: string | null,
  reference?: {
    relationTo: string;
    value: string | number | { slug?: string | null };
  } | null
): string | null {
  // CMS-link resolver (3-arg or type='custom'/'reference')
  if (url !== undefined || reference !== undefined) {
    const type = typeOrPath as 'custom' | 'reference' | null | undefined;
    if (type === 'custom') return url || null;
    if (
      type === 'reference' &&
      reference &&
      typeof reference.value === 'object' &&
      reference.value.slug
    ) {
      if (reference.relationTo === 'pages' && reference.value.slug === 'home') {
        return '/';
      }
      const prefix =
        reference.relationTo !== 'pages' ? `/${reference.relationTo}` : '';
      return `${prefix}/${reference.value.slug}`;
    }
    return url || null;
  }

  // Simple base-URL builder (0-1 arg)
  const path = (typeOrPath as string) || '';
  const base =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    'http://localhost:3000';
  return `${base}${path}`;
}

/**
 * Форматирует дату в читабельный формат.
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '';
    return format(date, 'd MMMM yyyy', { locale: ru });
  } catch {
    return '';
  }
};

/**
 * Получает ключ типа контента из строки или объекта.
 */
export const getTypeKey = (type?: string | null): string => {
  if (!type) return 'film';
  return type;
};

/**
 * Получает локализованный label жанра по его value.
 */
export const getGenreLabel = (value: string): string => {
  const genre = GENRES.find((g) => g.value === value);
  return genre?.label ?? value;
};

/**
 * Получает конфигурацию типа контента.
 */
export const configCollection = (titleOrSlug: string, slug?: string | null) => {
  // Пробуем найти тип по прямому ключу (film, series, cartoon)
  if (TYPE_CONFIG[titleOrSlug]) {
    const config = TYPE_CONFIG[titleOrSlug];
    return { type: config, TypeIcon: config.icon };
  }

  // Извлекаем тип из slug: planned-film → film, liked-animation → cartoon
  const source = slug || titleOrSlug;
  const typeFromSlug = Object.keys(TYPE_CONFIG).find((key) =>
    source.includes(key === 'cartoon' ? 'animation' : key)
  );

  const config = typeFromSlug ? TYPE_CONFIG[typeFromSlug] : FALLBACK_CINFIG;
  return { type: config, TypeIcon: config.icon };
};

/**
 * Форматирует длительность в минутах в читабельный формат (1ч 30мин).
 */
export const formatDuration = (minutes: number | null | undefined): string => {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}мин`;
  if (mins === 0) return `${hours}ч`;
  return `${hours}ч ${mins}мин`;
};

/**
 * Получает URL постера с фоллбэком.
 */
export const getPosterUrl = (item: {
  posterUrl?: string | null;
  poster?: { url?: string | null } | string | number | null;
}): string | null => {
  const posterSrc =
    item.poster && typeof item.poster === 'object'
      ? item.poster.url
      : item.posterUrl;

  return posterSrc || null;
};

/**
 * Массив доступных годов фильтрации (от текущего года до 1990).
 */
export const getAvailableYears = (): number[] => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = currentYear; year >= 1990; year--) {
    years.push(year);
  }
  return years;
};

// ============================================================================
// Дополнительные утилиты
// ============================================================================

import type { Title } from '@/payload-types';

// Ре-экспорт из канонического источника для обратной совместимости
export { formatSlugString } from '@/payload/utilities/utils';

const ALL_VALUE = 'all';

/**
 * Проверяет, попадает ли рейтинг в указанный диапазон.
 */
export const matchesRating = (
  rating: number | null | undefined,
  range: string
): boolean => {
  if (range === ALL_VALUE || !rating) {
    return range === ALL_VALUE;
  }
  const [min, max] = range.split('-').map(Number);
  return rating >= min && rating <= max;
};

/**
 * Извлекает уникальные годы из записей, сортирует по убыванию.
 */
export const extractYears = (
  items: Title[],
  getter: (item: Title) => number | null | undefined
): number[] => {
  const years = new Set<number>();
  items.forEach((item) => {
    const y = getter(item);
    if (y) years.add(y);
  });
  return Array.from(years).sort((a, b) => b - a);
};

export const releaseYears = (items: Title[]) =>
  extractYears(items, (i) => i.releaseYear);

export const watchYears = (items: Title[]) =>
  extractYears(items, (i) => i.watchYear);

/**
 * Опции для фильтра года просмотра.
 */
export const watchYearOptions = (items: Title[]) => [
  { label: 'Все годы', value: ALL_VALUE },
  ...watchYears(items).map((y) => ({ label: String(y), value: String(y) })),
];

/**
 * Опции для фильтра года выхода.
 */
export const releaseYearOptions = (items: Title[]) => [
  { label: 'Все годы', value: ALL_VALUE },
  ...releaseYears(items).map((y) => ({ label: String(y), value: String(y) })),
];

/**
 * Опции для фильтра жанров.
 */
export const genreOptions = () => [
  { label: 'Все жанры', value: ALL_VALUE },
  ...GENRES.map((g) => ({ label: g.label, value: g.value })),
];
