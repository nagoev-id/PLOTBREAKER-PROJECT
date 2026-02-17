import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { unstable_cache } from 'next/cache';
import { PageCollection } from '@/types';

/**
 * Получает страницу из базы данных по указанному slug.
 *
 * Функция выполняет запрос к коллекции "pages" для поиска страницы
 * по уникальному идентификатору slug. Возвращает первый найденный результат.
 *
 * @param slug - Человекопонятный URL-идентификатор страницы
 * @returns Promise с данными страницы или null, если страница не найдена
 * @throws {Error} В случае ошибки подключения к базе данных
 */
export const getPageBySlug = async (
  slug: string
): Promise<PageCollection | null> => {
  try {
    const payload = await getPayload({ config: configPromise });

    const result = await payload.find({
      collection: 'pages',
      where: {
        slug: {
          equals: slug,
        },
      },
    });

    return result.docs?.[0] || null;
  } catch (error) {
    console.error(`Ошибка при получении страницы со slug "${slug}":`, error);
    throw new Error(`Не удалось загрузить страницу "${slug}"`);
  }
};

/**
 * Создает кэшированную версию функции получения страницы по slug.
 *
 * Использует Next.js unstable_cache для кэширования результатов запросов.
 * Кэш автоматически инвалидируется при изменении тега страницы.
 *
 * @param slug - Человекопонятный URL-идентификатор страницы
 * @returns Кэшированная функция, возвращающая Promise с данными страницы
 */
export const getCachedPageBySlug = (
  slug: string
): (() => Promise<PageCollection | null>) =>
  unstable_cache(
    async (): Promise<PageCollection | null> => getPageBySlug(slug),
    [slug],
    {
      tags: [`pages_${slug}`],
      revalidate: 3600, // Кэш на 1 час
    }
  );
