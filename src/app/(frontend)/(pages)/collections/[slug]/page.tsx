import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { LoadingSpinner } from '@/components/shared';
import CollectionDetailClient from '@/app/(frontend)/(pages)/collections/[slug]/page.client';
import {
  getCachedListBySlug,
  getCachedLists,
  getAuthUser,
  getTitlesByListId,
} from '@/lib/helpers';
import { PAGINATION_CONFIG } from '@/lib/constants';

// Настройки кэширования страницы коллекции.
export const revalidate = 60;

/**
 * Генерация статических параметров для всех коллекций
 */
export async function generateStaticParams() {
  const lists = await getCachedLists()();
  return lists
    .filter((l) => l.slug)
    .map((l) => ({ slug: l.slug! }));
}

// Описание типов пропсов
type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{
    page?: string;
    size?: string;
  }>;
};

const normalizePaginationParams = (searchParams?: {
  page?: string;
  size?: string;
}) => {
  const requestedPage = Number(searchParams?.page);
  const requestedSize = Number(searchParams?.size);

  return {
    currentPage:
      Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
    pageSize: PAGINATION_CONFIG.pageSizeOptions.includes(requestedSize)
      ? requestedSize
      : PAGINATION_CONFIG.defaultPageSize,
  };
};

/**
 * Генерирует метаданные для страницы коллекции (Title, Description).
 */
export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { slug } = await params;
  const collection = await getCachedListBySlug(slug)();

  if (!collection) {
    return { title: 'Коллекция не найдена' };
  }

  return {
    title: collection.title,
    description: `Коллекция: ${collection.title}`,
  };
};

/**
 * Серверный компонент страницы детальной информации о коллекции.
 * Загружает данные коллекции и передаёт в клиентский компонент.
 */
const CollectionDetailPage = async ({ params, searchParams }: Props) => {
  const { slug } = await params;
  const { currentPage, pageSize } = normalizePaginationParams(
    await searchParams
  );

  const plannedSlugs = ['planned-animation', 'planned-series', 'planned-film'];
  if (plannedSlugs.includes(slug)) {
    const user = await getAuthUser();
    if (!user) {
      return notFound();
    }
  }

  const collection = await getCachedListBySlug(slug)();

  if (!collection) {
    return notFound();
  }

  const paginatedItems = await getTitlesByListId({
    listId: collection.id,
    limit: pageSize,
    page: currentPage,
  });

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CollectionDetailClient
        collection={collection}
        currentPage={currentPage}
        items={paginatedItems.docs}
        pageSize={pageSize}
        totalDocs={paginatedItems.totalDocs}
        totalPages={paginatedItems.totalPages}
      />
    </Suspense>
  );
};

export default CollectionDetailPage;
