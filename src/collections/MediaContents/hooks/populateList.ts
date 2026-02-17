import { CollectionAfterChangeHook } from 'payload';
import { MediaContentCollection } from '@/utilities/types';
import { COLLECTION_SLUGS } from '@/utilities/constants';

/**
 * Хук для синхронизации связей между медиа-контентом и коллекциями.
 * При изменении поля "collections" у медиа-контента обновляет
 * соответствующие коллекции (добавляет/убирает элемент).
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

  const addedCollections = currentCollections.filter(
    (id) => !previousCollections.includes(id)
  );
  const removedCollections = previousCollections.filter(
    (id) => !currentCollections.includes(id)
  );

  // Добавляем в новые коллекции
  if (addedCollections.length > 0) {
    for (const collectionId of addedCollections) {
      try {
        await payload.findByID({
          collection: COLLECTION_SLUGS.collections,
          id: collectionId,
        });
      } catch {
        // Коллекция не найдена, пропускаем
      }
    }
  }

  // Убираем из старых коллекций
  if (removedCollections.length > 0) {
    for (const collectionId of removedCollections) {
      try {
        await payload.findByID({
          collection: COLLECTION_SLUGS.collections,
          id: collectionId,
        });
      } catch {
        // Коллекция не найдена, пропускаем
      }
    }
  }

  return doc;
};
