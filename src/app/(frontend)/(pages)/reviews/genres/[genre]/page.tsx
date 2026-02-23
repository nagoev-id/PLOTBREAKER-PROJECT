import { JSX, Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { getGenreLabel } from '@/utilities/utils';
import { GENRES, METADATA } from '@/utilities/constants';
import { LoadingSpinner } from '@/components/shared';
import { GenrePageClient } from '@/app/(frontend)/(pages)/reviews/genres/[genre]/page.client';
import { getCachedMediaContentsByGenre } from '@/utilities/helpers';

/**
 * Генерация статических параметров для всех жанров
 */
export async function generateStaticParams() {
  return GENRES.map((g) => ({ genre: g.value }));
}

/**
 * Динамическая генерация метаданных для SEO
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ genre: string }>;
}): Promise<Metadata> {
  const { genre } = await params;
  // Текст жанра
  const label = getGenreLabel(genre);

  return {
    title: `${label} — ${METADATA.siteName}`,
    description: `Все фильмы и сериалы в жанре «${label}» на ${METADATA.siteName}`,
    openGraph: {
      title: `${label} — ${METADATA.siteName}`,
      description: `Все фильмы и сериалы в жанре «${label}»`,
    },
  };
}

/**
 * Страница жанра — отображает все записи с указанным жанром.
 * Данные загружаются на сервере и передаются в клиентский компонент.
 */
const GenrePage = async ({
  params,
}: {
  params: Promise<{ genre: string }>;
}): Promise<JSX.Element> => {
  const { genre } = await params;

  // Проверяем, что жанр существует
  if (!GENRES.some((g) => g.value === genre)) {
    notFound();
  }

  const items = await getCachedMediaContentsByGenre(genre)();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <GenrePageClient genre={genre} items={items} />
    </Suspense>
  );
};

export default GenrePage;
