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

export const getTitles = async (): Promise<Title[]> => {
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

export const getMultipleGlobals = async (
  slugs: Global[],
  depth: number = 0
): Promise<Record<string, unknown>> => {
  try {
    const results = await Promise.all(
      slugs.map((slug) => getGlobal(slug, depth))
    );
    return slugs.reduce(
      (acc, slug, index) => {
        acc[slug] = results[index];
        return acc;
      },
      {} as Record<string, unknown>
    );
  } catch (error) {
    console.error(
      'Ошибка при получении множественных глобальных настроек:',
      error
    );
    throw new Error('Не удалось загрузить глобальные настройки');
  }
};

export const getCachedMultipleGlobals = (
  slugs: Global[],
  depth: number = 0
): (() => Promise<Record<string, unknown>>) =>
  unstable_cache(
    async (): Promise<Record<string, unknown>> =>
      getMultipleGlobals(slugs, depth),
    ['globals_multiple', ...slugs],
    { tags: slugs.map((slug) => `global_${slug}`), revalidate: 60 }
  );

// ============================================================================
// Lists (бывш. Collections)
// ============================================================================

export const getLists = async (): Promise<List[]> => {
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

export const getListBySlug = async (slug: string): Promise<List | null> => {
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

export const getCachedListBySlug = (
  slug: string
): (() => Promise<List | null>) =>
  unstable_cache(async () => getListBySlug(slug), [`list_${slug}`], {
    tags: ['lists', `list_${slug}`],
    revalidate: 60,
  });

// ============================================================================
// Titles по тегу / жанру / slug
// ============================================================================

export const getTitlesByTag = async (tagSlug: string): Promise<Title[]> => {
  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.find({
      collection: COLLECTION_SLUGS.titles,
      sort: '-createdAt',
      limit: 0,
      depth: 1,
      where: {
        and: [
          { visualTags: { exists: true } },
          // { isPublished: { equals: true } },
        ],
      },
    });
    const docs = result.docs as Title[];
    return docs.filter((item) => {
      if (!item.visualTags) return false;
      const tags = item.visualTags
        .split(',')
        .map((t: string) => formatSlug(t.trim()));
      return tags.includes(tagSlug);
    });
  } catch (error) {
    console.error(`Ошибка при получении записей по тегу "${tagSlug}":`, error);
    throw new Error(`Не удалось загрузить записи по тегу "${tagSlug}"`);
  }
};

export const getCachedTitlesByTag = (tag: string): (() => Promise<Title[]>) =>
  unstable_cache(
    async (): Promise<Title[]> => getTitlesByTag(tag),
    [`titles_tag_${tag}`],
    { tags: ['titles'], revalidate: 60 }
  );

export const getTitlesByGenre = async (genre: string): Promise<Title[]> => {
  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.find({
      collection: COLLECTION_SLUGS.titles,
      sort: '-createdAt',
      limit: 0,
      depth: 1,
      where: {
        and: [
          { genres: { contains: genre } },
          // { isPublished: { equals: true } },
        ],
      },
    });
    return result.docs as Title[];
  } catch (error) {
    console.error(`Ошибка при получении записей по жанру "${genre}":`, error);
    throw new Error(`Не удалось загрузить записи по жанру "${genre}"`);
  }
};

export const getCachedTitlesByGenre = (
  genre: string
): (() => Promise<Title[]>) =>
  unstable_cache(
    async (): Promise<Title[]> => getTitlesByGenre(genre),
    [`titles_genre_${genre}`],
    { tags: ['titles'], revalidate: 60 }
  );

export const getTitleBySlug = async (slug: string): Promise<Title | null> => {
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

export const getTitleMetadata = async (
  slug: string
): Promise<{ title: string; description: string | null } | null> => {
  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.find({
      collection: COLLECTION_SLUGS.titles,
      where: {
        and: [
          { slug: { equals: slug } } /* { isPublished: { equals: true } } */,
        ],
      },
      limit: 1,
      depth: 1,
      select: { title: true, synopsis: true },
    });
    const item = result.docs[0] as Title | undefined;
    if (!item) return null;
    return { title: item.title, description: item.synopsis || null };
  } catch (error) {
    console.error(`Ошибка при получении метаданных для "${slug}":`, error);
    return null;
  }
};

export const getCachedTitleMetadata = (
  slug: string
): (() => Promise<{ title: string; description: string | null } | null>) =>
  unstable_cache(
    async () => getTitleMetadata(slug),
    [`title_metadata_${slug}`],
    { tags: ['titles'], revalidate: 60 }
  );

// ============================================================================
// Posts
// ============================================================================

export const getPosts = async (): Promise<Post[]> => {
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
