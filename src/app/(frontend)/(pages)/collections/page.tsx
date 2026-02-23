import { METADATA, PAGE_SLUGS } from '@/utilities/constants';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { RenderBlocks } from '@/blocks/RenderBlocks';
import { LoadingSpinner } from '@/components/shared';
import { getPageBySlug } from '@/utilities/helpers';
import CollectionsPageClient from '@/app/(frontend)/(pages)/collections/page.client';

// Настройки кэширования главной страницы.
export const revalidate = 60;

/**
 * Генерация метаданных для страницы
 * @returns Заголовок и описание страницы для SEO.
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: METADATA.collectionsPage.title,
    description: METADATA.collectionsPage.description,
  };
}

/**
 * Основной компонент страницы (Server Component).
 * @returns Орендеренная клиентская страница с данными.
 */
const CollectionsPage = async () => {
  const page = await getPageBySlug(PAGE_SLUGS.collections);

  if (!page || !page.layout) {
    return notFound();
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RenderBlocks blocks={page.layout} />
      <CollectionsPageClient />
    </Suspense>
  );
};

export default CollectionsPage;
