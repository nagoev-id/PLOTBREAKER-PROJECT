import { METADATA, PAGE_SLUGS } from '@/utilities/constants';
import { Metadata } from 'next';
import { getPageBySlug } from '@/utilities/getPageBySlug';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { RenderBlocks } from '@/blocks/RenderBlocks';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { getCachedCollectionsLists } from '@/utilities/getCollectionsLists';
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
  // Запрашиваем данные разметки с главной страницы
  const page = await getPageBySlug(PAGE_SLUGS.collections);
  const collectionsLists = await getCachedCollectionsLists()();

  // Проверяем, что данные получены
  if (!page || !page.layout) {
    return notFound();
  }

  return (
    <>
      {/* Отображаем спиннер загрузки */}
      <Suspense fallback={<LoadingSpinner />} />
      {/* Отображаем динамические блоки из макета Payload CMS */}
      <RenderBlocks blocks={page.layout} />
      {/* Отображаем список коллекций */}
      <CollectionsPageClient data={collectionsLists} />
    </>
  );
};

export default CollectionsPage;
