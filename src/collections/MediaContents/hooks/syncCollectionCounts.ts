import { CollectionAfterChangeHook } from 'payload';

import { COLLECTION_SLUGS } from '@/utilities/constants';
import { MediaContentCollection } from '@/utilities/types';

/**
 * Хук afterChange для MediaContents.
 * Пересчитывает itemCount во всех затронутых коллекциях
 * (как в новых, так и в старых, из которых запись была убрана).
 */
export const syncCollectionCounts: CollectionAfterChangeHook<
  MediaContentCollection
> = async ({ doc, previousDoc, req: { payload } }) => {
  const currentIds = extractIds(doc.collections);
  const previousIds = extractIds(previousDoc?.collections);

  // Объединяем все затронутые коллекции (добавленные + удалённые)
  const affectedIds = new Set([...currentIds, ...previousIds]);

  if (affectedIds.size === 0) return doc;

  const updatePromises = Array.from(affectedIds).map(async (collectionId) => {
    try {
      const { totalDocs } = await payload.count({
        collection: COLLECTION_SLUGS.mediaContents,
        where: {
          collections: { equals: collectionId },
        },
      });

      await payload.update({
        collection: COLLECTION_SLUGS.collections,
        id: collectionId,
        data: { itemCount: totalDocs },
      });
    } catch {
      // Ошибка обновления конкретной коллекции, продолжаем остальные
    }
  });

  await Promise.all(updatePromises);

  return doc;
};

/**
 * Извлекает массив ID коллекций из поля collections
 */
const extractIds = (
  collections: MediaContentCollection['collections'] | undefined
): number[] => {
  if (!collections || !Array.isArray(collections)) return [];
  return collections.map((c) => (typeof c === 'object' ? c.id : c));
};
