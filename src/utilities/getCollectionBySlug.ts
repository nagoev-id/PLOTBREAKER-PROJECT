import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { unstable_cache } from 'next/cache';

import { COLLECTION_SLUGS } from '@/utilities/constants';
import { CollectionCollection } from '@/utilities/types';

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
