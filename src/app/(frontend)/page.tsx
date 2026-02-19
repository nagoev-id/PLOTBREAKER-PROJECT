import { METADATA, PAGE_SLUGS } from '@/utilities/constants';
import { Metadata } from 'next';
import { getPageBySlug } from '@/utilities/getPageBySlug';
import { getMediaContents } from '@/utilities/getMediaContents';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { RenderBlocks } from '@/blocks/RenderBlocks';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import HomePageClient from './page.client';

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
  // Параллельная загрузка данных страницы и медиа-контента
  const [page, items] = await Promise.all([
    getPageBySlug(PAGE_SLUGS.home),
    getMediaContents(),
  ]);

  // Проверяем, что данные получены
  if (!page || !page.layout) {
    return notFound();
  }

  return (
    <>
      {/* Отображаем динамические блоки из макета Payload CMS */}
      <RenderBlocks blocks={page.layout} />
      {/* Отображаем список записей с фильтрами и пагинацией */}
      <Suspense fallback={<LoadingSpinner />}>
        <HomePageClient items={items} />
      </Suspense>
    </>
  );
};

export default HomePage;
