import { COLLECTION_SLUGS, METADATA, PAGE_SLUGS } from '@/utilities/constants';
import { Metadata } from 'next';
import { getPageBySlug } from '@/utilities/getPageBySlug';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { RenderBlocks } from '@/blocks/RenderBlocks';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import BlogPageClient from './page.client';
import { Post } from '@/payload-types';

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

  const posts = postsResult.docs as Post[];

  return (
    <>
      <Suspense fallback={<LoadingSpinner />} />
      <RenderBlocks blocks={page.layout} />
      <BlogPageClient posts={posts} />
    </>
  );
};

export default BlogPage;
