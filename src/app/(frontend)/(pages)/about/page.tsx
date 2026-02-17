import { METADATA, PAGE_SLUGS, REVALIDATE_TIME } from '@/utilities/constants';
import { Metadata } from 'next';
import { getPageBySlug } from '@/utilities/getPageBySlug';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Spinner } from '@/components/ui';
import { RenderBlocks } from '@/blocks/RenderBlocks';

// Настройки кэширования главной страницы.
export const revalidate = REVALIDATE_TIME;

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
      {/* Отображаем динамические блоки из макета Payload CMS */}
      <RenderBlocks blocks={page.layout} />
      {/* Отображаем спиннер загрузки */}
      <Suspense
        fallback={
          <div className="flex min-h-[400px] items-center justify-center">
            <Spinner className="h-10 w-10" />
          </div>
        }
      />
    </>
  );
};

export default AboutPage;
