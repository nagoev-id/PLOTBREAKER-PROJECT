import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  ALL_VALUE,
  METADATA,
  PAGE_SLUGS,
  PAGINATION_CONFIG,
} from '@/lib/constants';
import {
  getCachedPageBySlug,
  getReviewsFilterOptions,
  getReviewsStats,
  getReviewsTitles,
  type ReviewsFilters,
} from '@/lib/helpers';
import { RenderBlocks } from '@/features/blocks/RenderBlocks';
import { LoadingSpinner } from '@/components/shared';
import ReviewsPageClient from '@/app/(frontend)/(pages)/reviews/page.client';

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
type Props = {
  searchParams?: Promise<ReviewsFilters & {
    page?: string;
    size?: string;
  }>;
};

const normalizeReviewsParams = (
  searchParams?: ReviewsFilters & {
    page?: string;
    size?: string;
  }
) => {
  const requestedPage = Number(searchParams?.page);
  const requestedSize = Number(searchParams?.size);

  return {
    currentPage:
      Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
    filters: {
      genre: searchParams?.genre || ALL_VALUE,
      opinion: searchParams?.opinion || ALL_VALUE,
      q: searchParams?.q || '',
      rating: searchParams?.rating || ALL_VALUE,
      status: searchParams?.status || 'watched',
      type: searchParams?.type || ALL_VALUE,
      watchYear: searchParams?.watchYear || ALL_VALUE,
      year: searchParams?.year || ALL_VALUE,
    } satisfies ReviewsFilters,
    pageSize: PAGINATION_CONFIG.pageSizeOptions.includes(requestedSize)
      ? requestedSize
      : PAGINATION_CONFIG.defaultPageSize,
  };
};

const ReviewsPage = async ({ searchParams }: Props) => {
  const { currentPage, filters, pageSize } = normalizeReviewsParams(
    await searchParams
  );

  const [page, mediaContents, filterOptions, stats] = await Promise.all([
    getCachedPageBySlug(PAGE_SLUGS.reviews)(),
    getReviewsTitles({
      filters,
      limit: pageSize,
      page: currentPage,
    }),
    getReviewsFilterOptions(),
    getReviewsStats(),
  ]);

  // Проверяем, что данные получены
  if (!page || !page.layout) {
    return notFound();
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RenderBlocks blocks={page.layout} />
      <ReviewsPageClient
        currentPage={currentPage}
        filterOptions={filterOptions}
        filters={filters}
        items={mediaContents.docs}
        pageSize={pageSize}
        stats={stats}
        totalDocs={mediaContents.totalDocs}
        totalPages={mediaContents.totalPages}
      />
    </Suspense>
  );
};

export default ReviewsPage;
