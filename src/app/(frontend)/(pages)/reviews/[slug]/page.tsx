import { COLLECTION_SLUGS, METADATA } from '@/utilities/constants';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import ReviewDetailClient from '@/app/(frontend)/(pages)/reviews/[slug]/page.client';
import { MediaContentCollection } from '@/utilities/types';

// Настройки кэширования страницы
export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Генерация метаданных для страницы детальной записи.
 * @param params - Промис со slug записи.
 * @returns Метаданные страницы.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: COLLECTION_SLUGS.mediaContents,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  });

  const mediaItem = result.docs[0] as MediaContentCollection | undefined;

  if (!mediaItem) {
    return { title: METADATA.reviewsPage.title };
  }

  return {
    title: `${mediaItem.title} — ${METADATA.reviewsPage.title}`,
    description: mediaItem.synopsis || METADATA.reviewsPage.description,
  };
}

/**
 * Серверный компонент детальной страницы записи.
 * Загружает MediaContent по slug и передаёт данные в клиентский компонент.
 * @param params - Промис со slug записи.
 * @returns Страница детальной записи.
 */
const ReviewDetailPage = async ({ params }: Props) => {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: COLLECTION_SLUGS.mediaContents,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  });

  const item = result.docs[0] as MediaContentCollection | undefined;

  if (!item) {
    return notFound();
  }

  return <ReviewDetailClient item={item} />;
};

export default ReviewDetailPage;
