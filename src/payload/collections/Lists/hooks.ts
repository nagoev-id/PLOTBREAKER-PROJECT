import type { CollectionBeforeChangeHook } from 'payload';
import { COLLECTION_SLUGS } from '@/lib/constants';
import type { List } from '@/payload-types';

/**
 * Хук Payload CMS, автоматически обновляющий поле `itemCount`
 * у документа коллекции `ListCollection` перед его сохранением.
 *
 * Выполняет подсчёт документов из коллекции `titles`, у которых
 * поле `collections` ссылается на текущий документ, и записывает
 * результат в `data.itemCount`.
 *
 * Если документ новый (отсутствует `originalDoc.id`) или в процессе
 * подсчёта возникла ошибка — поле `itemCount` остаётся без изменений.
 *
 * @param data - Входящие данные сохраняемого документа
 * @param originalDoc - Текущая версия документа в базе данных
 *                      (отсутствует при создании нового документа)
 * @param req - Объект запроса Payload с доступом к экземпляру `payload`
 * @returns Изменённый объект `data` с обновлённым полем `itemCount`
 */

export const updateItemCount: CollectionBeforeChangeHook<List> = async ({
  data,
  originalDoc,
  req,
}) => {
  const { payload } = req;
  const collectionId = originalDoc?.id;

  if (collectionId) {
    try {
      const { totalDocs } = await payload.count({
        collection: COLLECTION_SLUGS.titles,
        where: {
          collections: { equals: collectionId },
        },
        req,
      });
      data.itemCount = totalDocs;
    } catch {
      // Ошибка подсчёта — оставляем текущее значение
    }
  }
  return data;
};
