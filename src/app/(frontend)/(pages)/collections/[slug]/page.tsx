import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { LoadingSpinner } from '@/components/shared';
import CollectionDetailClient from '@/app/(frontend)/(pages)/collections/[slug]/page.client';
import { getCachedCollectionBySlug } from '@/utilities/helpers';

// Настройки кэширования страницы коллекции.
export const revalidate = 60;

// Описание типов пропсов
type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Генерирует метаданные для страницы коллекции (Title, Description).
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
 * Серверный компонент страницы детальной информации о коллекции.
 * Загружает данные коллекции и передаёт в клиентский компонент.
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
