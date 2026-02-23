import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { METADATA, PAGE_SLUGS } from '@/utilities/constants';
import { RenderBlocks } from '@/blocks/RenderBlocks';
import { LoadingSpinner } from '@/components/shared';
import BlogPageClient from '@/app/(frontend)/(pages)/blog/page.client';
import { getPageBySlug, getCachedPostsLists } from '@/utilities/helpers';
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
 * Загружает layout и список постов на сервере.
 */
const BlogPage = async () => {
  const page = await getPageBySlug(PAGE_SLUGS.blog);

  if (!page || !page.layout) {
    return notFound();
  }

  const posts = await getCachedPostsLists()();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RenderBlocks blocks={page.layout} />
      <BlogPageClient posts={posts as PostCollection[]} />
    </Suspense>
  );
};

export default BlogPage;
