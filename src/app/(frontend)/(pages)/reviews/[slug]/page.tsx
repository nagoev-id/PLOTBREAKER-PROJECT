import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { METADATA } from '@/utilities/constants';
import { getMediaContentMetadata } from '@/utilities/helpers';
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

  const mediaItem = await getMediaContentMetadata(slug);

  if (!mediaItem) {
    return { title: METADATA.reviewsPage.title };
  }

  return {
    title: `${mediaItem.title} — ${METADATA.reviewsPage.title}`,
    description: mediaItem.description || METADATA.reviewsPage.description,
  };
}

/**
 * Серверный компонент детальной страницы обзора (Media Content).
 * Отвечает за получение данных с сервера и их передачу в клиентский интерактивный компонент.
 *
 * @param params - Объект параметров маршрута.
 * @returns Контент страницы или вызов сотояния 'не найдено'.
 */
const ReviewDetailPage = async ({ params }: Props) => {
  const { slug } = await params;
  if (!slug) {
    return notFound();
  }
  return <ReviewDetailClient slug={slug} />;
};

export default ReviewDetailPage;
