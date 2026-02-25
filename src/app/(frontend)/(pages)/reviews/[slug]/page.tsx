import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { METADATA } from '@/utilities/constants';
import { getCachedMediaContentBySlug } from '@/utilities/helpers';
import { getPosterUrl } from '@/utilities/utils';
import ReviewDetailClient from '@/app/(frontend)/(pages)/reviews/[slug]/page.client';

// Настройка времени повторной валидации (ISR) — 60 секунд.
export const revalidate = 60;

// Описание типов пропсов
type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Функция для динамической генерации метаданных страницы (SEO).
 * Извлекает данные о фильме/сериале по slug для формирования title и description.
 *
 * @param params - Объект параметров маршрута.
 * @returns Метаданные (заголовок, описание и т.д.).
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (!slug) {
    return { title: METADATA.reviewsPage.title };
  }

  const item = await getCachedMediaContentBySlug(slug)();

  if (!item) {
    return { title: METADATA.reviewsPage.title };
  }

  let ogTitle = `«${item.title}»`;
  const extraInfo = [];
  if (item.originalTitle) extraInfo.push(item.originalTitle);
  if (item.releaseYear) extraInfo.push(item.releaseYear);
  if (extraInfo.length > 0) {
    ogTitle += ` (${extraInfo.join(', ')})`;
  }

  const description = item.synopsis || METADATA.reviewsPage.description;
  const posterSrc = getPosterUrl(item);
  const absolutePoster = posterSrc?.startsWith('http')
    ? posterSrc
    : posterSrc
      ? `${METADATA.siteUrl.replace(/\/$/, '')}${posterSrc}`
      : null;
  const images = absolutePoster ? [{ url: absolutePoster }] : [];

  return {
    title: `${ogTitle} — ${METADATA.siteName}`,
    description,
    openGraph: {
      title: ogTitle,
      description,
      siteName: METADATA.siteName,
      images,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images,
    },
  };
}

/**
 * Серверный компонент детальной страницы обзора (Media Content).
 * Получает данные на сервере и передаёт в клиентский компонент.
 *
 * @param params - Объект параметров маршрута.
 * @returns Контент страницы или вызов состояния 'не найдено'.
 */
const ReviewDetailPage = async ({ params }: Props) => {
  const { slug } = await params;

  if (!slug) {
    return notFound();
  }

  const item = await getCachedMediaContentBySlug(slug)();

  if (!item) {
    return notFound();
  }

  return <ReviewDetailClient item={item} />;
};

export default ReviewDetailPage;
