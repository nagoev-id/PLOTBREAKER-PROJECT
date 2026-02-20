import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import { headers } from 'next/headers';
import configPromise from '@payload-config';

import { METADATA } from '@/utilities/constants';
import { getCachedMediaContentsByTag } from '@/utilities/helpers';
import TagPageClient from './page.client';

// Настройка ISR — 60 секунд.
export const revalidate = 60;

// Описание типов пропсов
type Props = {
  params: Promise<{ tag: string }>;
};

/**
 * Генерирует метаданные для страницы тега.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  return {
    title: `#${decodedTag} — ${METADATA.reviewsPage.title}`,
    description: `Все записи с тегом «${decodedTag}»`,
  };
}

/**
 * Серверный компонент страницы фильтрации по тегу.
 * Загружает все записи, у которых visualTags содержит данный тег.
 */
const TagPage = async ({ params }: Props) => {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: await headers() });

  const items = await getCachedMediaContentsByTag(decodedTag)();

  if (!items || items.length === 0) {
    return notFound();
  }

  return <TagPageClient items={items} tag={decodedTag} user={user} />;
};

export default TagPage;
