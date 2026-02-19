import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { unstable_cache } from 'next/cache';

import { COLLECTION_SLUGS } from '@/utilities/constants';
import { MediaContentCollection } from '@/utilities/types';

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
