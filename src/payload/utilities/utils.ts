import { slugify } from 'transliteration';

/**
 * Форматирует строку в URL-friendly slug.
 * Транслитерация кириллицы → латиница, приведение к нижнему регистру.
 */
export const formatSlug = (val: string): string =>
  slugify(val, { lowercase: true, separator: '-' });

/**
 * Форматирует строку в slug для отображения.
 */
export const formatSlugString = (val: string): string =>
  slugify(val, { lowercase: true, separator: '-' });

/**
 * Проверяет, является ли значение объектом (не null, не массив).
 */
export const isObject = (item: unknown): item is Record<string, unknown> => {
  return Boolean(item && typeof item === 'object' && !Array.isArray(item));
};

/**
 * Глубокое слияние двух объектов.
 */
export const deepMerge = <T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>
): T => {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          (output as Record<string, unknown>)[key] = deepMerge(
            (target as Record<string, unknown>)[key] as Record<string, unknown>,
            source[key] as Record<string, unknown>
          );
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
};
