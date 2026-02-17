import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getCachedCollectionBySlug } from '@/utilities/getCollectionBySlug';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import CollectionDetailClient from './page.client';

// Настройки кэширования страницы коллекции.
export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Генерация метаданных для страницы коллекции.
 */
export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { slug } = await params;
  const collection = await getCachedCollectionBySlug(slug)();

  if (!collection) {
    return { title: 'Коллекция не найдена' };
  }

  return {
    title: collection.title,
    description: `Коллекция: ${collection.title}`,
  };
};

/**
 * Страница детальной информации о коллекции.
 */
const CollectionDetailPage = async ({ params }: Props) => {
  const { slug } = await params;
  const collection = await getCachedCollectionBySlug(slug)();

  if (!collection) {
    return notFound();
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CollectionDetailClient collection={collection} />
    </Suspense>
  );
};

export default CollectionDetailPage;
