import { JSX, Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { METADATA } from '@/lib/constants';
import { LoadingSpinner } from '@/components/shared';
import { FranchisePageClient } from '@/app/(frontend)/(pages)/reviews/franchises/[name]/page.client';
import { getCachedTitlesByFranchiseSlug } from '@/lib/helpers';

export const revalidate = 60;

type Props = {
  params: Promise<{ name: string }>;
};

/**
 * Динамическая генерация метаданных для SEO
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name: slug } = await params;
  const result = await getCachedTitlesByFranchiseSlug(slug)();
  const franchise = result?.franchiseName ?? slug;

  return {
    title: `${franchise} — ${METADATA.siteName}`,
    description: `Все фильмы и сериалы франшизы «${franchise}» на ${METADATA.siteName}`,
    openGraph: {
      title: `${franchise} — ${METADATA.siteName}`,
      description: `Все фильмы и сериалы франшизы «${franchise}»`,
    },
  };
}

/**
 * Страница франшизы — отображает все записи с указанной франшизой.
 * URL содержит транслитерированный slug, данные ищутся по совпадению.
 */
const FranchisePage = async ({ params }: Props): Promise<JSX.Element> => {
  const { name: slug } = await params;
  const result = await getCachedTitlesByFranchiseSlug(slug)();

  if (!result || result.items.length === 0) {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <FranchisePageClient
        franchise={result.franchiseName}
        items={result.items}
      />
    </Suspense>
  );
};

export default FranchisePage;
