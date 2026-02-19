'use server';

import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { z } from 'zod';
import { COLLECTION_SLUGS } from '@/utilities/constants';
import { MediaContentCollection } from '@/utilities/types';

// Проверяет, что запрос является строкой и имеет длину от 1 до 100 символов.
const SearchSchema = z.string().min(1).max(100);

/**
 * Серверное действие для поиска медиа-контента.
 *
 * Выполняет полнотекстовый поиск по полям `title` (название RU) и `originalTitle` (оригинальное название).
 * Использует `contains` фильтр Payload CMS.
 *
 * @param query - Строка поискового запроса. Должна быть от 1 до 100 символов.
 * @returns Массив найденных документов `MediaContent` (максимум 10).
 *          Возвращает пустой массив, если запрос невалиден.
 */
export const searchMedia = async (
  query: string
): Promise<MediaContentCollection[]> => {
  // Валидирует поисковый запрос.
  const validated = SearchSchema.safeParse(query);
  if (!validated.success) return [];

  // Получает экземпляр Payload CMS.
  const payload = await getPayload({ config: configPromise });

  // Выполняет поиск по полям `title` (название RU) и `originalTitle` (оригинальное название).
  const results = await payload.find({
    collection: COLLECTION_SLUGS.mediaContents,
    where: {
      or: [
        {
          title: {
            contains: validated.data,
          },
        },
        {
          originalTitle: {
            contains: validated.data,
          },
        },
      ],
    },
    limit: 10,
    depth: 1,
  });

  return results.docs;
};
