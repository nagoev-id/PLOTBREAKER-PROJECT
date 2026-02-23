import { METADATA, PAGE_SLUGS } from '@/utilities/constants';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { RenderBlocks } from '@/blocks/RenderBlocks';
import { LoadingSpinner } from '@/components/shared';
import { getPageBySlug, getCachedCollectionsLists } from '@/utilities/helpers';
import CollectionsPageClient from '@/app/(frontend)/(pages)/collections/page.client';
import { CollectionCollection } from '@/utilities/types';

// Настройки кэширования главной страницы.
export const revalidate = 60;

/**
 * Генерация метаданных для страницы
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: METADATA.collectionsPage.title,
    description: METADATA.collectionsPage.description,
  };
}

/**
 * Основной компонент страницы (Server Component).
 * Загружает коллекции на сервере и передаёт в клиентский компонент.
 */
const CollectionsPage = async () => {
  const page = await getPageBySlug(PAGE_SLUGS.collections);

  if (!page || !page.layout) {
    return notFound();
  }

  const collections = await getCachedCollectionsLists()();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RenderBlocks blocks={page.layout} />
      <CollectionsPageClient
        collections={collections as CollectionCollection[]}
      />
    </Suspense>
  );
};

export default CollectionsPage;
