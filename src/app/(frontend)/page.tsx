import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { METADATA, PAGE_SLUGS } from '@/utilities/constants';
import { getPageBySlug } from '@/utilities/helpers';
import { RenderBlocks } from '@/blocks/RenderBlocks';
import { LoadingSpinner } from '@/components/shared';
import HomePageClient from '@/app/(frontend)/page.client';

// Настройки кэширования главной страницы.
export const revalidate = 60;

/**
 * Генерация метаданных для страницы
 * @returns Заголовок и описание страницы для SEO.
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: METADATA.homePage.title,
    description: METADATA.homePage.description,
  };
}

/**
 * Основной компонент страницы (Server Component).
 * Загружает layout-блоки и весь медиа-контент для клиентской фильтрации.
 * @returns Орендеренная клиентская страница с данными.
 */
const HomePage = async () => {
  const page = await getPageBySlug(PAGE_SLUGS.home);

  // Проверяем, что данные получены
  if (!page || !page.layout) {
    return notFound();
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RenderBlocks blocks={page.layout} />
      <HomePageClient />
    </Suspense>
  );
};

export default HomePage;
