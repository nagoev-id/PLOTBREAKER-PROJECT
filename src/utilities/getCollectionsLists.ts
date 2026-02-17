import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { unstable_cache } from 'next/cache';

import { COLLECTION_SLUGS } from '@/utilities/constants';
import { CollectionCollection } from '@/utilities/types';

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
