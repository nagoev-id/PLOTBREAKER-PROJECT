import { CollectionBeforeChangeHook } from 'payload';
import { CollectionCollection } from '@/utilities/types';
import { COLLECTION_SLUGS } from '@/utilities/constants';

/**
 * Хук для пересчёта itemCount при сохранении коллекции.
 * Считает количество media-contents, которые ссылаются на эту коллекцию.
 */
export const updateItemCount: CollectionBeforeChangeHook<
  CollectionCollection
> = async ({ data, originalDoc, req: { payload } }) => {
  const collectionId = originalDoc?.id;

  if (collectionId) {
    try {
      const { totalDocs } = await payload.count({
        collection: COLLECTION_SLUGS.mediaContents,
        where: {
          collections: { equals: collectionId },
        },
      });

      data.itemCount = totalDocs;
    } catch {
      // Ошибка подсчёта, оставляем текущее значение
    }
  }

  return data;
};
