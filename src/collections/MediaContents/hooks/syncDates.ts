import { CollectionBeforeChangeHook } from 'payload';

import { MediaContentCollection } from '@/utilities/types';

/**
 * Хук для синхронизации годов с датами.
 * - releaseYear заполняется из releaseDate
 * - watchYear заполняется из watchDate
 */
export const syncDates: CollectionBeforeChangeHook<
  MediaContentCollection
> = async ({ data }) => {
  // Синхронизация года выхода с датой релиза
  if (data.releaseDate && !data.releaseYear) {
    data.releaseYear = new Date(data.releaseDate).getFullYear();
  }

  // Синхронизация года просмотра с датой просмотра
  if (data.watchDate && !data.watchYear) {
    data.watchYear = new Date(data.watchDate).getFullYear();
  }

  return data;
};
