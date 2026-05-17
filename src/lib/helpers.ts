import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { unstable_cache } from 'next/cache';
import { headers } from 'next/headers';
import { COLLECTION_SLUGS } from '@/lib/constants';
import type { PaginatedDocs, Where } from 'payload';
import type { Page, Title, List, Post } from '@/payload-types';
import { formatSlug } from '@/payload/utilities/utils';
import type { Config } from '@/payload-types';

// ============================================================================
// Pages
// ============================================================================

export const getPageBySlug = async (slug: string): Promise<Page | null> => {
  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
    });
    return result.docs?.[0] || null;
  } catch (error) {
    console.error(`Ошибка при получении страницы со slug "${slug}":`, error);
    throw new Error(`Не удалось загрузить страницу "${slug}"`);
  }
};

export const getCachedPageBySlug = (
  slug: string
): (() => Promise<Page | null>) =>
  unstable_cache(
    async (): Promise<Page | null> => getPageBySlug(slug),
    [slug],
    { tags: [`pages_${slug}`], revalidate: 60 }
  );

// ============================================================================
// Titles (бывш. MediaContents)
// ============================================================================

const getTitles = async (): Promise<Title[]> => {
  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.find({
      collection: COLLECTION_SLUGS.titles,
      sort: '-createdAt',
      limit: 0,
      depth: 1,
      where: {
        // isPublished: { equals: true },
      },
      select: {
        title: true,
        originalTitle: true,
        slug: true,
        type: true,
        poster: true,
        posterUrl: true,
        genres: true,
        releaseYear: true,
        watchYear: true,
        duration: true,
        kpRating: true,
        personalOpinion: true,
        director: true,
        status: true,
        collections: true,
        visualTags: true,
        franchise: true,
        isPublished: true,
      },
    });
    return result.docs as Title[];
  } catch (error) {
    console.error('Ошибка при получении контента:', error);
    throw new Error('Не удалось загрузить контент');
  }
};

export const getCachedTitles = (): (() => Promise<Title[]>) =>
  unstable_cache(async (): Promise<Title[]> => getTitles(), ['titles_all'], {
    tags: ['titles'],
    revalidate: 60,
  });

// ============================================================================
// Globals
// ============================================================================

type Global = keyof Config['globals'];

const getGlobal = async (slug: Global, depth: number = 0): Promise<unknown> => {
  try {
    const payload = await getPayload({ config: configPromise });
    return await payload.findGlobal({ slug, depth });
  } catch (error) {
    console.error(
      `Ошибка при получении глобальной настройки "${slug}":`,
      error
    );
    throw new Error(`Не удалось загрузить глобальную настройку "${slug}"`);
  }
};

export const getCachedGlobal = (
  slug: Global,
  depth: number = 0
): (() => Promise<unknown>) =>
  unstable_cache(async (): Promise<unknown> => getGlobal(slug, depth), [slug], {
    tags: [`global_${slug}`],
    revalidate: 60,
  });

// getMultipleGlobals removed to fix lint.

// ============================================================================
// Lists (бывш. Collections)
// ============================================================================

const getLists = async (isAdmin: boolean = false): Promise<List[]> => {
  try {
    const payload = await getPayload({ config: configPromise });

    // Базовый запрос
    const query: any = {
      collection: COLLECTION_SLUGS.lists,
      sort: 'title',
      limit: 0,
      depth: 0,
      select: {
        id: true,
        title: true,
        slug: true,
        isPublic: true,
        itemCount: true,
        createdAt: true,
        updatedAt: true,
        description: true,
        isTheme: true,
      },
    };

    // Скрываем "запланированные" подборки для обычных пользователей
    if (!isAdmin) {
      query.where = {
        slug: {
          not_in: ['planned-animation', 'planned-series', 'planned-film'],
        },
      };
    }

    const result = await payload.find(query);
    return result.docs as List[];
  } catch (error) {
    console.error('Ошибка при получении списков:', error);
    throw new Error('Не удалось загрузить списки');
  }
};

export const getCachedLists = (
  isAdmin: boolean = false
): (() => Promise<List[]>) =>
  unstable_cache(
    async (): Promise<List[]> => getLists(isAdmin),
    ['lists_all', isAdmin ? 'admin' : 'public'],
    {
      tags: ['lists'],
      revalidate: 60,
    }
  );

const listSelect = {
  id: true,
  title: true,
  slug: true,
  isPublic: true,
  itemCount: true,
  createdAt: true,
  updatedAt: true,
  description: true,
  isTheme: true,
} as const;

const titleCardSelect = {
  title: true,
  originalTitle: true,
  slug: true,
  type: true,
  poster: true,
  posterUrl: true,
  genres: true,
  releaseYear: true,
  watchYear: true,
  kpRating: true,
  personalOpinion: true,
  director: true,
  status: true,
  collections: true,
  franchise: true,
  isPublished: true,
} as const;

const getListBySlug = async (slug: string): Promise<List | null> => {
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: COLLECTION_SLUGS.lists,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    select: listSelect,
  });
  return (result.docs[0] as List) ?? null;
};

/**
 * Для больших коллекций результат может превышать лимит кэша Next.js (2MB).
 * Вместо unstable_cache полагаемся на `revalidate` страницы.
 */
export const getCachedListBySlug =
  (slug: string): (() => Promise<List | null>) =>
  () =>
    getListBySlug(slug);

export const getTitlesByListId = async ({
  listId,
  limit,
  page,
}: {
  listId: number;
  limit: number;
  page: number;
}): Promise<PaginatedDocs<Title>> => {
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: COLLECTION_SLUGS.titles,
    where: {
      collections: { equals: listId },
    },
    sort: '-createdAt',
    limit,
    page,
    depth: 1,
    select: titleCardSelect,
  });

  return result as PaginatedDocs<Title>;
};

export type ReviewsFilters = {
  genre?: string;
  opinion?: string;
  q?: string;
  rating?: string;
  status?: string;
  type?: string;
  watchYear?: string;
  year?: string;
};

export type ReviewsStats = {
  liked: number;
  planned: number;
  total: number;
};

export type ReviewsFilterOptions = {
  releaseYears: number[];
  watchYears: number[];
};

const isActiveFilter = (value?: string): value is string =>
  Boolean(value && value !== '__all__');

const buildReviewsWhere = (filters: ReviewsFilters): Where => {
  const and: Where[] = [];

  if (isActiveFilter(filters.type)) {
    and.push({ type: { equals: filters.type } });
  }

  if (isActiveFilter(filters.genre)) {
    and.push({ genres: { contains: filters.genre } });
  }

  if (isActiveFilter(filters.year)) {
    and.push({ releaseYear: { equals: Number(filters.year) } });
  }

  if (isActiveFilter(filters.opinion)) {
    and.push({ personalOpinion: { equals: filters.opinion } });
  }

  if (isActiveFilter(filters.status)) {
    and.push({ status: { equals: filters.status } });
  }

  if (isActiveFilter(filters.rating)) {
    const [min, max] = filters.rating.split('-').map(Number);
    if (Number.isFinite(min) && Number.isFinite(max)) {
      and.push({
        kpRating: {
          greater_than_equal: min,
          less_than_equal: max,
        },
      });
    }
  }

  if (isActiveFilter(filters.watchYear)) {
    and.push({ watchYear: { equals: Number(filters.watchYear) } });
  }

  const query = filters.q?.trim();
  if (query) {
    and.push({
      or: [
        { title: { contains: query } },
        { originalTitle: { contains: query } },
        { director: { contains: query } },
      ],
    });
  }

  return and.length > 0 ? { and } : {};
};

const uniqueSortedYears = (
  docs: Pick<Title, 'releaseYear' | 'watchYear'>[],
  key: 'releaseYear' | 'watchYear'
) =>
  Array.from(
    new Set(
      docs
        .map((doc) => doc[key])
        .filter((year): year is number => typeof year === 'number')
    )
  ).sort((a, b) => b - a);

export const getReviewsFilterOptions =
  async (): Promise<ReviewsFilterOptions> => {
    const payload = await getPayload({ config: configPromise });
    const { docs } = await payload.find({
      collection: COLLECTION_SLUGS.titles,
      limit: 0,
      depth: 0,
      select: {
        releaseYear: true,
        watchYear: true,
      },
    });

    const yearDocs = docs as Pick<Title, 'releaseYear' | 'watchYear'>[];

    return {
      releaseYears: uniqueSortedYears(yearDocs, 'releaseYear'),
      watchYears: uniqueSortedYears(yearDocs, 'watchYear'),
    };
  };

export const getReviewsStats = async (): Promise<ReviewsStats> => {
  const payload = await getPayload({ config: configPromise });
  const [total, planned, liked] = await Promise.all([
    payload.count({ collection: COLLECTION_SLUGS.titles }),
    payload.count({
      collection: COLLECTION_SLUGS.titles,
      where: { status: { equals: 'planned' } },
    }),
    payload.count({
      collection: COLLECTION_SLUGS.titles,
      where: { personalOpinion: { equals: 'like' } },
    }),
  ]);

  return {
    total: total.totalDocs,
    planned: planned.totalDocs,
    liked: liked.totalDocs,
  };
};

export const getReviewsTitles = async ({
  filters,
  limit,
  page,
}: {
  filters: ReviewsFilters;
  limit: number;
  page: number;
}): Promise<PaginatedDocs<Title>> => {
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: COLLECTION_SLUGS.titles,
    where: buildReviewsWhere(filters),
    sort: '-createdAt',
    limit,
    page,
    depth: 1,
    select: titleCardSelect,
  });

  return result as PaginatedDocs<Title>;
};

// ============================================================================
// Titles по тегу / жанру / slug
// ============================================================================

export const getCachedTitlesByTag =
  (tagSlug: string): (() => Promise<Title[]>) =>
  async () => {
    const titles = await getCachedTitles()();
    return titles.filter((item) => {
      if (!item.visualTags) return false;
      const tags = item.visualTags
        .split(',')
        .map((t: string) => formatSlug(t.trim()));
      return tags.includes(tagSlug);
    });
  };

export const getCachedTitlesByGenre =
  (genre: string): (() => Promise<Title[]>) =>
  async () => {
    const titles = await getCachedTitles()();
    return titles.filter((item) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return item.genres?.includes(genre as any);
    });
  };

type FranchiseResult = {
  franchiseName: string;
  items: Title[];
};

export const getCachedTitlesByFranchiseSlug =
  (slug: string): (() => Promise<FranchiseResult | null>) =>
  async () => {
    const payload = await getPayload({ config: configPromise });
    // Загружаем все записи, у которых franchise заполнено
    const result = await payload.find({
      collection: COLLECTION_SLUGS.titles,
      where: {
        franchise: { exists: true },
      },
      sort: '-createdAt',
      limit: 0,
      depth: 1,
    });

    const allTitles = result.docs as Title[];
    const matched = allTitles.filter(
      (item) => item.franchise && formatSlug(item.franchise) === slug
    );

    if (matched.length === 0) return null;
    return {
      franchiseName: matched[0].franchise!,
      items: matched,
    };
  };

const getTitleBySlug = async (slug: string): Promise<Title | null> => {
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: COLLECTION_SLUGS.titles,
    where: {
      and: [{ slug: { equals: slug } }],
    },
    limit: 1,
    depth: 1,
  });
  return (result.docs[0] as Title) ?? null;
};

export const getCachedTitleBySlug = (
  slug: string
): (() => Promise<Title | null>) =>
  unstable_cache(async () => getTitleBySlug(slug), [`title_${slug}`], {
    tags: ['titles', `title_${slug}`],
    revalidate: 60,
  });

// ============================================================================
// Posts
// ============================================================================

const getPosts = async (): Promise<Post[]> => {
  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.find({
      collection: COLLECTION_SLUGS.posts,
      sort: '-publishedAt',
      limit: 0,
      depth: 1,
      where: { isPublished: { equals: true } },
    });
    return result.docs as Post[];
  } catch (error) {
    console.error('Ошибка при получении списка постов:', error);
    throw new Error('Не удалось загрузить список постов');
  }
};

export const getCachedPosts = (): (() => Promise<Post[]>) =>
  unstable_cache(async (): Promise<Post[]> => getPosts(), ['posts_lists'], {
    tags: ['posts'],
    revalidate: 60,
  });

// ============================================================================
// Auth
// ============================================================================

/**
 * Получить текущего авторизованного пользователя из заголовков запроса
 *
 * @returns {Promise<any | null>} Объект пользователя или null, если не авторизован
 */
export const getAuthUser = async () => {
  try {
    const payload = await getPayload({ config: configPromise });
    const { user } = await payload.auth({ headers: await headers() });
    return user;
  } catch (error) {
    // При SSG headers() недоступен — это ожидаемое поведение, не логируем
    const isDynamic =
      error instanceof Error && error.message.includes('headers');
    if (!isDynamic) {
      console.error('Ошибка при получении текущего пользователя:', error);
    }
    return null;
  }
};
