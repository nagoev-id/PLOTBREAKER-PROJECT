import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

import { COLLECTION_SLUGS, METADATA, PAGE_SLUGS } from '@/utilities/constants';
import { RenderBlocks } from '@/blocks/RenderBlocks';
import { LoadingSpinner } from '@/components/shared';
import BlogPageClient from '@/app/(frontend)/(pages)/blog/page.client';
import { getPageBySlug } from '@/utilities/helpers';
import { PostCollection } from '@/utilities/types';

// Настройки кэширования
export const revalidate = 60;

/**
 * Генерация метаданных для страницы блога
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: METADATA.blogPage.title,
    description: METADATA.blogPage.description,
  };
}

/**
 * Серверный компонент страницы блога.
 * Загружает layout и список постов, передаёт в клиентский компонент.
 */
const BlogPage = async () => {
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: await headers() });

  const [page, postsResult] = await Promise.all([
    getPageBySlug(PAGE_SLUGS.blog),
    payload.find({
      collection: COLLECTION_SLUGS.posts,
      sort: '-publishedAt',
      limit: 0,
      depth: 1,
    }),
  ]);

  if (!page || !page.layout) {
    return notFound();
  }

  const posts = postsResult.docs as PostCollection[];

  return (
    <>
      <Suspense fallback={<LoadingSpinner />} />
      <RenderBlocks blocks={page.layout} />
      <BlogPageClient posts={posts} user={user} />
    </>
  );
};

export default BlogPage;
