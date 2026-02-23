import { JSX, Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { METADATA } from '@/utilities/constants';
import { LoadingSpinner } from '@/components/shared';
import { BlogTagPageClient } from '@/app/(frontend)/(pages)/blog/tags/[tag]/page.client';

// Допустимые теги блога
const BLOG_TAGS: Record<string, string> = {
  review: 'Обзор',
  news: 'Новости',
  collection: 'Подборка',
  opinion: 'Мнение',
  guide: 'Гайд',
};

// Описание типов пропсов
type Props = {
  params: Promise<{ tag: string }>;
};

/**
 * Генерация статических параметров для всех тегов блога
 */
export async function generateStaticParams() {
  return Object.keys(BLOG_TAGS).map((tag) => ({ tag }));
}

/**
 * Динамическая генерация метаданных для SEO
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const label = BLOG_TAGS[tag] || tag;

  return {
    title: `${label} — Блог — ${METADATA.siteName}`,
    description: `Все статьи с тегом «${label}» в блоге ${METADATA.siteName}`,
    openGraph: {
      title: `${label} — Блог — ${METADATA.siteName}`,
      description: `Все статьи с тегом «${label}»`,
    },
  };
}

/**
 * Страница тега блога — отображает все посты с указанным тегом
 * @param {{ params: Promise<{ tag: string }> }} - Параметры маршрута
 * @returns {JSX.Element}
 */
const BlogTagPage = async ({ params }: Props): Promise<JSX.Element> => {
  const { tag } = await params;

  if (!BLOG_TAGS[tag]) {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BlogTagPageClient tag={tag} tagLabel={BLOG_TAGS[tag]} />
    </Suspense>
  );
};

export default BlogTagPage;
