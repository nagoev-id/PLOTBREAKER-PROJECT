import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { METADATA, PAGE_SLUGS } from '@/lib/constants';
import { getPageBySlug, getCachedTitles } from '@/lib/helpers';
import { RenderBlocks } from '@/features/blocks/RenderBlocks';
import { LoadingSpinner } from '@/components/shared';
import HomePageClient from '@/app/(frontend)/page.client';
import type { Title } from '@/payload-types';

// Настройки кэширования главной страницы.
export const revalidate = 60;

/**
 * Генерация метаданных для страницы
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: METADATA.homePage.title,
    description: METADATA.homePage.description,
  };
}

/**
 * Основной компонент страницы (Server Component).
 * Загружает layout-блоки и медиа-контент на сервере.
 */
const HomePage = async () => {
  const page = await getPageBySlug(PAGE_SLUGS.home);

  // Проверяем, что данные получены
  if (!page || !page.layout) {
    return notFound();
  }

  const mediaContents = await getCachedTitles()();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RenderBlocks blocks={page.layout} />
      <HomePageClient items={mediaContents as Title[]} />
    </Suspense>
  );
};

export default HomePage;
