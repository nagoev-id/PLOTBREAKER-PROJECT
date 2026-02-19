import { METADATA, PAGE_SLUGS } from '@/utilities/constants';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

import { RenderBlocks } from '@/blocks/RenderBlocks';
import { LoadingSpinner } from '@/components/shared';
import CollectionsPageClient from '@/app/(frontend)/(pages)/collections/page.client';
import { getCachedCollectionsLists, getPageBySlug } from '@/utilities/helpers';

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
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: await headers() });
  const page = await getPageBySlug(PAGE_SLUGS.collections);
  const collectionsLists = await getCachedCollectionsLists()();

  if (!page || !page.layout) {
    return notFound();
  }

  return (
    <>
      <Suspense fallback={<LoadingSpinner />} />
      <RenderBlocks blocks={page.layout} />
      <CollectionsPageClient data={collectionsLists} user={user} />
    </>
  );
};

export default CollectionsPage;
