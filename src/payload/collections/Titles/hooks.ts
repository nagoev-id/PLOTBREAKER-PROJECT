import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
} from 'payload';
import { COLLECTION_SLUGS } from '@/lib/constants';
import type { Title } from '@/payload-types';

// ============================================================================
// syncDates
// ============================================================================

export const syncDates: CollectionBeforeChangeHook<Title> = async ({
  data,
}) => {
  if (data.watchDate && !data.watchYear) {
    data.watchYear = new Date(data.watchDate).getFullYear();
  }
  return data;
};

// ============================================================================
// syncWatchDate — для сериалов вычисляет watchDate из дат сезонов
// ============================================================================

interface SeasonData {
  startDate?: string | null;
  endDate?: string | null;
}

export const syncWatchDate: CollectionBeforeChangeHook<Title> = async ({
  data,
}) => {
  if (data.type !== 'series' || !data.seasons?.length) {
    return data;
  }

  const endDates = (data.seasons as SeasonData[])
    .map((s) => s.endDate)
    .filter((d): d is string => Boolean(d))
    .sort();

  if (endDates.length) {
    // Берём последнюю дату окончания сезона
    data.watchDate = endDates[endDates.length - 1];
    data.watchYear = new Date(data.watchDate).getFullYear();
  }

  return data;
};

// Маппинг type → slug списка "буду смотреть"
const PLANNED_LIST_SLUGS: Record<string, string> = {
  film: 'planned-film',
  series: 'planned-series',
  cartoon: 'planned-animation',
};

export const syncPersonalOpinion: CollectionBeforeChangeHook<Title> = async ({
  data,
  originalDoc,
  req,
}) => {
  if (data.status === 'planned') {
    data.personalOpinion = 'planned';

    // Авто-привязка к списку "буду смотреть" по типу контента
    const type = data.type || originalDoc?.type;
    const listSlug = type ? PLANNED_LIST_SLUGS[type] : undefined;

    if (listSlug && req.payload) {
      try {
        const { docs } = await req.payload.find({
          collection: COLLECTION_SLUGS.lists,
          where: { slug: { equals: listSlug } },
          limit: 1,
          req,
        });

        if (docs.length > 0) {
          const listId = docs[0].id;
          const currentCollections = (data.collections || []).map(
            (c: number | { id: number }) => (typeof c === 'number' ? c : c.id)
          );

          if (!currentCollections.includes(listId)) {
            data.collections = [...currentCollections, listId];
          }
        }
      } catch {
        // Список не найден — пропускаем
      }
    }
  } else if (
    originalDoc?.status === 'planned' &&
    data.personalOpinion === 'planned'
  ) {
    data.personalOpinion = 'neutral';
  }
  return data;
};

// ============================================================================
// populateList
// ============================================================================

export const populateList: CollectionAfterChangeHook<Title> = async ({
  doc,
  previousDoc,
  req: { payload },
}) => {
  const previousCollections = (previousDoc?.collections || []).map(
    (col: number | { id: number }) => (typeof col === 'number' ? col : col.id)
  );
  const currentCollections = (doc.collections || []).map(
    (col: number | { id: number }) => (typeof col === 'number' ? col : col.id)
  );

  const affectedCollections = new Set([
    ...currentCollections.filter(
      (id: number) => !previousCollections.includes(id)
    ),
    ...previousCollections.filter(
      (id: number) => !currentCollections.includes(id)
    ),
  ]);

  for (const collectionId of affectedCollections) {
    try {
      const { totalDocs } = await payload.count({
        collection: COLLECTION_SLUGS.titles,
        where: {
          collections: { equals: collectionId },
        },
      });

      await payload.update({
        collection: COLLECTION_SLUGS.lists,
        id: collectionId,
        data: { itemCount: totalDocs },
      });
    } catch {
      // Коллекция не найдена — пропускаем
    }
  }

  return doc;
};

// ============================================================================
// syncCollectionCounts
// ============================================================================

const extractIds = (
  collections: Title['collections'] | undefined
): number[] => {
  if (!collections || !Array.isArray(collections)) return [];
  return collections.map((c) => (typeof c === 'object' ? c.id : c));
};

export const syncCollectionCounts: CollectionAfterChangeHook<Title> = async ({
  doc,
  previousDoc,
  req,
}) => {
  const { payload } = req;
  const currentIds = extractIds(doc.collections);
  const previousIds = extractIds(previousDoc?.collections);

  const affectedIds = new Set([...currentIds, ...previousIds]);
  if (affectedIds.size === 0) return doc;

  const updatePromises = Array.from(affectedIds).map(async (collectionId) => {
    try {
      const { totalDocs } = await payload.count({
        collection: COLLECTION_SLUGS.titles,
        where: {
          collections: { equals: collectionId },
        },
        req,
      });

      await payload.update({
        collection: COLLECTION_SLUGS.lists,
        id: collectionId,
        data: { itemCount: totalDocs },
        req,
      });
    } catch {
      // Ошибка обновления — продолжаем
    }
  });

  await Promise.all(updatePromises);
  return doc;
};

// Removed formatVisualTags to use shared hook.
