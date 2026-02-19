import { CollectionAfterChangeHook } from 'payload';

import { MediaContentCollection } from '@/utilities/types';
import { COLLECTION_SLUGS } from '@/utilities/constants';

/**
 * Хук для синхронизации itemCount между медиа-контентом и коллекциями.
 * При изменении поля "collections" у медиа-контента пересчитывает
 * количество элементов в затронутых коллекциях.
 */
export const populateList: CollectionAfterChangeHook<
  MediaContentCollection
> = async ({ doc, previousDoc, req: { payload } }) => {
  // Получаем массивы ID коллекций из текущего и предыдущего состояния
  const previousCollections = (previousDoc?.collections || []).map((col) =>
    typeof col === 'number' ? col : col.id
  );
  const currentCollections = (doc.collections || []).map((col) =>
    typeof col === 'number' ? col : col.id
  );

  // Собираем все затронутые коллекции (добавленные + удалённые)
  const affectedCollections = new Set([
    ...currentCollections.filter((id) => !previousCollections.includes(id)),
    ...previousCollections.filter((id) => !currentCollections.includes(id)),
  ]);

  // Пересчитываем itemCount для каждой затронутой коллекции
  for (const collectionId of affectedCollections) {
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
      // Коллекция не найдена или ошибка, пропускаем
    }
  }

  return doc;
};
