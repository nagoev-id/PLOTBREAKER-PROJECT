import { COLLECTION_SLUGS, METADATA } from '@/utilities/constants';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import ReviewDetailClient from '@/app/(frontend)/(pages)/reviews/[id]/page.client';
import { MediaContentCollection } from '@/utilities/types';

// Настройки кэширования страницы
export const revalidate = 60;

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Генерация метаданных для страницы детальной записи.
 * @param params - Промис с ID записи.
 * @returns Метаданные страницы.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const payload = await getPayload({ config: configPromise });

  const item = await payload.findByID({
    collection: COLLECTION_SLUGS.mediaContents,
    id: Number(id),
    depth: 1,
  });

  if (!item) {
    return { title: METADATA.reviewsPage.title };
  }

  const mediaItem = item as MediaContentCollection;

  return {
    title: `${mediaItem.title} — ${METADATA.reviewsPage.title}`,
    description: mediaItem.synopsis || METADATA.reviewsPage.description,
  };
}

/**
 * Серверный компонент детальной страницы записи.
 * Загружает MediaContent по ID и передаёт данные в клиентский компонент.
 * @param params - Промис с ID записи.
 * @returns Страница детальной записи.
 */
const ReviewDetailPage = async ({ params }: Props) => {
  const { id } = await params;
  const payload = await getPayload({ config: configPromise });

  let item: MediaContentCollection;

  try {
    item = (await payload.findByID({
      collection: COLLECTION_SLUGS.mediaContents,
      id: Number(id),
      depth: 1,
    })) as MediaContentCollection;
  } catch {
    return notFound();
  }

  if (!item) {
    return notFound();
  }

  return <ReviewDetailClient item={item} />;
};

export default ReviewDetailPage;
