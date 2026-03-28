import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { unstable_cache } from 'next/cache';
import { headers } from 'next/headers';
import { COLLECTION_SLUGS } from '@/lib/constants';
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

const getLists = async (): Promise<List[]> => {
  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.find({
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
    });
    return result.docs as List[];
  } catch (error) {
    console.error('Ошибка при получении списков:', error);
    throw new Error('Не удалось загрузить списки');
  }
};

export const getCachedLists = (): (() => Promise<List[]>) =>
  unstable_cache(async (): Promise<List[]> => getLists(), ['lists_all'], {
    tags: ['lists'],
    revalidate: 60,
  });

const getListBySlug = async (slug: string): Promise<List | null> => {
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: COLLECTION_SLUGS.lists,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    joins: {
      items: {
        limit: 0,
        // where: { isPublished: { equals: true } },
      },
    },
  });
  return (result.docs[0] as List) ?? null;
};

/**
 * Для больших коллекций результат может превышать лимит кэша Next.js (2MB).
 * Вместо unstable_cache полагаемся на `revalidate` страницы.
 */
export const getCachedListBySlug = (
  slug: string
): (() => Promise<List | null>) =>
  () => getListBySlug(slug);

// ============================================================================
// Titles по тегу / жанру / slug
// ============================================================================

export const getCachedTitlesByTag = (
  tagSlug: string
): (() => Promise<Title[]>) => async () => {
  const titles = await getCachedTitles()();
  return titles.filter((item) => {
    if (!item.visualTags) return false;
    const tags = item.visualTags
      .split(',')
      .map((t: string) => formatSlug(t.trim()));
    return tags.includes(tagSlug);
  });
};

export const getCachedTitlesByGenre = (
  genre: string
): (() => Promise<Title[]>) => async () => {
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

export const getCachedTitlesByFranchiseSlug = (
  slug: string
): (() => Promise<FranchiseResult | null>) => async () => {
  const titles = await getCachedTitles()();
  const matched = titles.filter(
    (item) => item.franchise && formatSlug(item.franchise) === slug
  );
  if (matched.length === 0) return null;
  // Make sure we return the exact franchise string casing from the first item
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
      and: [{ slug: { equals: slug } } /* { isPublished: { equals: true } } */],
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

// Title metadata cache removed to fix lint.

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
