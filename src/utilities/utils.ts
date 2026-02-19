import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { slugify } from 'transliteration';
import type { FieldHook } from 'payload';
import {
  ALL_VALUE,
  FALLBACK_CINFIG,
  GENRES,
  TYPE_CONFIG,
} from '@/utilities/constants';
import { MediaContentCollection } from '@/utilities/types';

/**
 * Получает URL на основе типа ссылки и ссылки
 * @param type Тип ссылки
 * @param url URL
 * @param reference Ссылка
 * @returns URL
 */
export const getURL = (
  type?: 'custom' | 'reference' | null,
  url?: string | null,
  reference?: {
    relationTo: string;
    value: string | number | { slug?: string | null };
  } | null
): string | null => {
  if (type === 'custom') {
    return url || null;
  }

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
};

/**
 * Форматирует строку в slug-идентификатор.
 *
 * Выполняет транслитерацию кириллицы в латиницу, приводит к нижнему регистру,
 * заменяет пробелы на дефисы и удаляет лишние пробелы по краям.
 *
 * @param val - Исходная строка для форматирования
 * @returns Отформатированный slug-идентификатор
 *
 */
export const formatSlugString = (val: string): string =>
  slugify(val, {
    lowercase: true,
    separator: '-',
    trim: true,
  });

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Утилита для глубокого слияния объектов.
 *
 * Предоставляет функции для безопасной проверки типов и рекурсивного
 * слияния объектов без изменения исходных данных.
 */

/**
 * Проверяет, является ли переданное значение объектом.
 *
 * @param item - Значение для проверки
 * @returns true, если значение является объектом (не массивом и не null)
 */
export function isObject(item: unknown): boolean {
  return Boolean(item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Выполняет глубокое слияние двух объектов.
 *
 * Рекурсивно объединяет свойства исходного объекта (source) в целевой объект (target).
 * В случае конфликтов для вложенных объектов выполняется рекурсивное слияние.
 * Для примитивных значений и массивов значения из source перезаписывают значения в target.
 *
 * @param target - Целевой объект, в который будут добавлены свойства
 * @param source - Исходный объект, свойства которого будут добавлены в target
 * @returns Новый объект с объединенными свойствами
 */
export const deepMerge = <T, R>(target: T, source: R): T => {
  // Создаем копию целевого объекта для иммутабельности
  const output = { ...target } as any;

  if (isObject(target) && isObject(source)) {
    Object.keys(source as any).forEach((key) => {
      const sourceValue = (source as any)[key];
      const targetValue = output[key];

      if (isObject(sourceValue)) {
        // Если свойство в source - объект
        if (!(key in output)) {
          // Если свойства нет в target, добавляем его
          Object.assign(output, { [key]: sourceValue });
        } else {
          // Если свойство есть в обоих объектах, рекурсивно сливаем
          output[key] = deepMerge(targetValue, sourceValue);
        }
      } else {
        // Для примитивов и массивов просто перезаписываем значение
        Object.assign(output, { [key]: sourceValue });
      }
    });
  }

  return output;
};

/**
 * Объединяет CSS классы с помощью Tailwind CSS.
 * @param inputs - CSS классы для объединения.
 * @returns Объединенные CSS классы.
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

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

/**
 * Извлекает уникальные годы из массива медиа-контента
 * @param items - Массив медиа-контента
 * @param getter - Функция для извлечения года
 * @returns number[] - Массив уникальных годов
 */
export const releaseYears = (items: MediaContentCollection[]) => {
  return extractYears(items, (i) => i.releaseYear);
};

/**
 * Извлекает уникальные годы из массива медиа-контента
 * @param items - Массив медиа-контента
 * @param getter - Функция для извлечения года
 * @returns number[] - Массив уникальных годов
 */
export const watchYears = (items: MediaContentCollection[]) => {
  return extractYears(items, (i) => i.watchYear);
};

/**
 * Создает массив опций для года просмотра
 * @returns Array<{ label: string; value: string }> - Массив опций
 */
export const watchYearOptions = (items: MediaContentCollection[]) => [
  { label: 'Все годы', value: ALL_VALUE },
  ...watchYears(items).map((y) => ({ label: String(y), value: String(y) })),
];

/**
 * Создает массив опций для года выхода
 * @returns Array<{ label: string; value: string }> - Массив опций
 */
export const releaseYearOptions = (items: MediaContentCollection[]) => [
  { label: 'Все годы', value: ALL_VALUE },
  ...releaseYears(items).map((y) => ({ label: String(y), value: String(y) })),
];

/**
 * Создает массив опций для жанров
 * @returns Array<{ label: string; value: string }> - Массив опций
 */
export const genreOptions = () => [
  { label: 'Все жанры', value: ALL_VALUE },
  ...GENRES.map((g) => ({ label: g.label, value: g.value })),
];

/**
 * Создает hook для автоматического форматирования slug-полей в Payload CMS.
 *
 * Hook выполняет следующие задачи:
 * - Если в slug-поле уже есть значение, форматирует его
 * - При создании новой записи использует значение из fallback-поля
 * - Сохраняет существующее значение при редактировании, если slug не изменен
 *
 * @param fallback - Имя поля, из которого брать значение для slug при создании
 * @returns FieldHook для использования в конфигурации полей Payload CMS
 */
export const formatSlug =
  (fallback: string): FieldHook =>
  ({ data, operation, originalDoc, value }) => {
    if (typeof value === 'string') {
      return formatSlugString(value);
    }

    if (operation === 'create' || operation === 'update') {
      const fallbackData = data?.[fallback] || originalDoc?.[fallback];

      if (fallbackData && typeof fallbackData === 'string') {
        if (operation === 'create' || !originalDoc?.slug) {
          return formatSlugString(fallbackData);
        }
      }
    }

    return value;
  };
