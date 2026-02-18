import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getCachedCollectionBySlug } from '@/utilities/getCollectionBySlug';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import CollectionDetailClient from '@/app/(frontend)/(pages)/collections/[slug]/page.client';

// Настройки кэширования страницы коллекции.
export const revalidate = 60;

// Типы параметров страницы коллекции.
type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Генерирует метаданные для страницы коллекции (Title, Description).
 * Данные загружаются на основе slug из параметров URL.
 *
 * @param args - Аргументы страницы, включая параметры маршрута.
 * @returns Объект метаданных для Next.js.
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
 * Загружает данные коллекции по slug и отображает клиентский компонент с Suspense.
 *
 * @param args - Пропсы компонента, содержащие параметры маршрута.
 * @returns JSX элемент страницы или 404, если коллекция не найдена.
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
