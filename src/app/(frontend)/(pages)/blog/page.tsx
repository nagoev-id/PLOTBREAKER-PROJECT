import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { METADATA, PAGE_SLUGS } from '@/utilities/constants';
import { RenderBlocks } from '@/blocks/RenderBlocks';
import { LoadingSpinner } from '@/components/shared';
import BlogPageClient from '@/app/(frontend)/(pages)/blog/page.client';
import { getPageBySlug } from '@/utilities/helpers';

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
  const page = await getPageBySlug(PAGE_SLUGS.blog);

  if (!page || !page.layout) {
    return notFound();
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RenderBlocks blocks={page.layout} />
      <BlogPageClient />
    </Suspense>
  );
};

export default BlogPage;
