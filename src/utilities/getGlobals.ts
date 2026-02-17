import type { Config } from '@/payload-types';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { unstable_cache } from 'next/cache';

/**
 * Тип для представления slug глобальных настроек.
 * Является ключом объекта globals из конфигурации Payload.
 */
type Global = keyof Config['globals'];

/**
 * Получает глобальные настройки из базы данных по указанному slug.
 *
 * Функция выполняет запрос к глобальным настройкам Payload CMS.
 * Позволяет указать глубину вложенности для заполнения связанных данных.
 *
 * @param slug - Идентификатор глобальной настройки
 * @param depth - Глубина вложенности для populate (по умолчанию 0)
 * @returns Promise с данными глобальной настройки
 * @throws {Error} В случае ошибки подключения к базе данных
 */
const getGlobal = async (slug: Global, depth: number = 0): Promise<unknown> => {
  try {
    const payload = await getPayload({ config: configPromise });

    return await payload.findGlobal({
      slug,
      depth,
    });
  } catch (error) {
    console.error(
      `Ошибка при получении глобальной настройки "${slug}":`,
      error
    );
    throw new Error(`Не удалось загрузить глобальную настройку "${slug}"`);
  }
};

/**
 * Создает кэшированную версию функции получения глобальных настроек.
 *
 * Использует Next.js unstable_cache для кэширования результатов запросов.
 * Кэш автоматически инвалидируется при изменении соответствующего тега.
 *
 * @param slug - Идентификатор глобальной настройки
 * @param depth - Глубина вложенности для populate (по умолчанию 0)
 * @returns Кэшированная функция, возвращающая Promise с данными глобальной настройки
 */
export const getCachedGlobal = (
  slug: Global,
  depth: number = 0
): (() => Promise<unknown>) =>
  unstable_cache(async (): Promise<unknown> => getGlobal(slug, depth), [slug], {
    tags: [`global_${slug}`],
    revalidate: 3600, // Кэш на 1 час
  });

/**
 * Получает несколько глобальных настроек одновременно.
 *
 * Удобная функция для пакетного получения нескольких глобальных настроек.
 * Использует Promise.all для параллельного выполнения запросов.
 *
 * @param slugs - Массив идентификаторов глобальных настроек
 * @param depth - Глубина вложенности для populate (по умолчанию 0)
 * @returns Promise с объектом, где ключи - slug'и настроек, значения - данные настроек
 */
export const getMultipleGlobals = async (
  slugs: Global[],
  depth: number = 0
): Promise<Record<string, unknown>> => {
  try {
    const results = await Promise.all(
      slugs.map((slug) => getGlobal(slug, depth))
    );

    return slugs.reduce(
      (acc, slug, index) => {
        acc[slug] = results[index];
        return acc;
      },
      {} as Record<string, unknown>
    );
  } catch (error) {
    console.error(
      'Ошибка при получении множественных глобальных настроек:',
      error
    );
    throw new Error('Не удалось загрузить глобальные настройки');
  }
};

/**
 * Создает кэшированную версию функции для получения нескольких глобальных настроек.
 *
 * @param slugs - Массив идентификаторов глобальных настроек
 * @param depth - Глубина вложенности для populate (по умолчанию 0)
 * @returns Кэшированная функция, возвращающая Promise с объектом настроек
 */
export const getCachedMultipleGlobals = (
  slugs: Global[],
  depth: number = 0
): (() => Promise<Record<string, unknown>>) =>
  unstable_cache(
    async (): Promise<Record<string, unknown>> =>
      getMultipleGlobals(slugs, depth),
    ['globals_multiple', ...slugs],
    {
      tags: slugs.map((slug) => `global_${slug}`),
      revalidate: 3600, // Кэш на 1 час
    }
  );
