import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import localFont from 'next/font/local';
import {
  ALL_VALUE,
  FALLBACK_CINFIG,
  GENRES,
  TYPE_CONFIG,
} from '@/utilities/constants';
import { MediaContentCollection } from '@/utilities/types';

/**
 * Объединяет CSS классы с помощью Tailwind CSS.
 * @param inputs - CSS классы для объединения.
 * @returns Объединенные CSS классы.
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/**
 * Конфигурация локального шрифта Euclid Circular B.
 * Поддерживает веса 300, 400, 500, 600, 700.
 * Использует variable-шрифт для интеграции с Tailwind CSS (--font-euclid).
 */
export const euclid = localFont({
  src: [
    {
      path: '../../public/fonts/EuclidCircularB-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/EuclidCircularB-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/EuclidCircularB-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/EuclidCircularB-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/EuclidCircularB-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-euclid',
});

/**
 * Форматирует дату.
 * @param date - Дата в формате строки.
 * @returns Отформатированная дата.
 */
export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

// ============================================================================
// Collections
// ============================================================================

/**
 * Определяет тип контента по заголовку коллекции.
 * @param title - Заголовок коллекции.
 * @returns Тип контента ('film', 'series', 'cartoon').
 */
export const getTypeKey = (title: string): string => {
  const lower = title.toLowerCase();
  if (lower.includes('мультфильм')) return 'cartoon';
  if (lower.includes('сериал')) return 'series';
  return 'film';
};

/**
 * Получить label жанра по его value.
 * @param value - Значение жанра.
 * @returns Label жанра.
 */
export const getGenreLabel = (value: string): string => {
  const genre = GENRES.find((g) => g.value === value);
  return genre?.label ?? value;
};

/**
 * Конфигурация коллекции.
 * @param title - Заголовок коллекции.
 * @returns Конфигурация коллекции.
 */
export const configCollection = (title: string) => {
  const typeKey = getTypeKey(title);
  const type = TYPE_CONFIG[typeKey] ?? FALLBACK_CINFIG;
  const TypeIcon = type.icon;

  return { type, TypeIcon };
};

/**
 * Извлекает уникальные годы из записей, сортирует по убыванию
 * @param items - Массив записей
 * @param getter - Функция для получения года
 * @returns Массив уникальных годов
 */
export const extractYears = (
  items: MediaContentCollection[],
  getter: (item: MediaContentCollection) => number | null | undefined
): number[] => {
  const years = new Set<number>();
  items.forEach((item) => {
    const y = getter(item);
    if (y) years.add(y);
  });
  return Array.from(years).sort((a, b) => b - a);
};

/**
 * Проверяет, попадает ли рейтинг в указанный диапазон
 * @param rating - Рейтинг
 * @param range - Диапазон (например, '9-10')
 * @returns true, если рейтинг попадает в диапазон
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
 * Форматирует длительность из минут в «Xч Yм»
 * @param minutes - Длительность в минутах
 * @returns Форматированная длительность
 */
export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}м`;
  if (m === 0) return `${h}ч`;
  return `${h}ч ${m}м`;
};

/**
 * Получает URL постера из объекта изображения
 * @param item - Объект MediaContentCollection
 * @returns URL постера или null
 */
export const getPosterUrl = (item: MediaContentCollection) => {
  const posterSrc =
    item.poster && typeof item.poster === 'object'
      ? item.poster.url
      : item.posterUrl;

  return posterSrc || null;
};
