import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { unstable_cache } from 'next/cache';
import { PageCollection } from '@/utilities/types';
import { COLLECTION_SLUGS } from '@/utilities/constants';
import {
  MediaContentCollection,
  CollectionCollection,
} from '@/utilities/types';
import type { Config } from '@/payload-types';

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

/**
 * Получает все медиа-контент записи из базы данных.
 *
 * Загружает все записи без лимита (limit: 0) для клиентской фильтрации.
 * Включает depth: 1 для загрузки постеров.
 *
 * @returns Массив всех медиа-контент записей
 * @throws {Error} В случае ошибки подключения к базе данных
 */
export const getMediaContents = async (): Promise<MediaContentCollection[]> => {
  try {
    const payload = await getPayload({ config: configPromise });

    const result = await payload.find({
      collection: COLLECTION_SLUGS.mediaContents,
      sort: '-createdAt',
      limit: 0,
      depth: 1,
    });

    return result.docs as MediaContentCollection[];
  } catch (error) {
    console.error('Ошибка при получении медиа-контента:', error);
    throw new Error('Не удалось загрузить медиа-контент');
  }
};

/**
 * Кэшированная версия функции получения медиа-контента.
 *
 * Использует Next.js unstable_cache для кэширования результатов запросов.
 * Кэш автоматически инвалидируется при изменении тега "media-contents".
 *
 * @returns Кэшированная функция, возвращающая Promise с массивом записей
 */
export const getCachedMediaContents = (): (() => Promise<
  MediaContentCollection[]
>) =>
  unstable_cache(
    async (): Promise<MediaContentCollection[]> => getMediaContents(),
    ['media_contents_all'],
    {
      tags: ['media-contents'],
      revalidate: 3600,
    }
  );

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

/**
 * Получает список коллекций из базы данных.
 *
 * Функция выполняет запрос к коллекции "lists" с сортировкой по дате создания
 * в обратном порядке (новые сначала). Возвращает только необходимые поля
 * для оптимизации производительности, но сохраняет совместимость с типом List.
 *
 * @returns Массив элементов списка коллекций с полным типом List
 * @throws {Error} В случае ошибки подключения к базе данных
 */
export const getCollectionsLists = async (): Promise<
  CollectionCollection[]
> => {
  try {
    const payload = await getPayload({ config: configPromise });

    const result = await payload.find({
      collection: COLLECTION_SLUGS.collections,
      sort: '-createdAt',
      limit: 0,
      depth: 0,
      select: {
        id: true,
        title: true,
        slug: true,
        isPublic: true,
        itemCount: true,
        createdAt: true,
        updatedAt: true,
        description: true,
      },
    });

    return result.docs as CollectionCollection[];
  } catch (error) {
    console.error('Ошибка при получении списков коллекций:', error);
    throw new Error('Не удалось загрузить списки коллекций');
  }
};

/**
 * Создает кэшированную версию функции получения списков коллекций.
 *
 * Использует Next.js unstable_cache для кэширования результатов запросов.
 * Кэш автоматически инвалидируется при изменении тега "lists".
 *
 * @returns Кэшированная функция, возвращающая Promise с массивом элементов
 */
export const getCachedCollectionsLists = (): (() => Promise<
  CollectionCollection[]
>) =>
  unstable_cache(
    async (): Promise<CollectionCollection[]> => getCollectionsLists(),
    ['collections_lists'],
    {
      tags: ['lists'],
      revalidate: 3600, // Кэш на 1 час
    }
  );

/**
 * Получает коллекцию по slug из базы данных.
 * Использует join для подтягивания связанных MediaContent.
 *
 * @param slug - Уникальный slug коллекции
 * @returns Коллекция с элементами или null
 */
export const getCollectionBySlug = async (
  slug: string
): Promise<CollectionCollection | null> => {
  try {
    const payload = await getPayload({ config: configPromise });

    const result = await payload.find({
      collection: COLLECTION_SLUGS.collections,
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
      joins: {
        items: {
          limit: 100,
        },
      },
    });

    return (result.docs[0] as CollectionCollection) ?? null;
  } catch (error) {
    console.error(`Ошибка при получении коллекции "${slug}":`, error);
    return null;
  }
};

/**
 * Кэшированная версия getCollectionBySlug.
 */
export const getCachedCollectionBySlug = (
  slug: string
): (() => Promise<CollectionCollection | null>) =>
  unstable_cache(
    async () => getCollectionBySlug(slug),
    [`collection_${slug}`],
    {
      tags: ['lists', `collection_${slug}`],
      revalidate: 3600,
    }
  );
