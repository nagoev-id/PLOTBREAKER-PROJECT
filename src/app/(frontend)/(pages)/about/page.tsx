import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { METADATA, PAGE_SLUGS } from '@/utilities/constants';
import { getPageBySlug } from '@/utilities/helpers';
import { RenderBlocks } from '@/blocks/RenderBlocks';
import { LoadingSpinner } from '@/components/shared';

// Настройки кэширования главной страницы.
export const revalidate = 60;

/**
 * Генерация метаданных для страницы
 * @returns Заголовок и описание страницы для SEO.
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: METADATA.aboutPage.title,
    description: METADATA.aboutPage.description,
  };
}

/**
 * Основной компонент страницы (Server Component).
 * @returns Орендеренная клиентская страница с данными.
 */
const AboutPage = async () => {
  // Запрашиваем данные разметки с главной страницы
  const page = await getPageBySlug(PAGE_SLUGS.about);

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
    </>
  );
};

export default AboutPage;
