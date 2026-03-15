import { JSX, Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { METADATA } from '@/lib/constants';
import { LoadingSpinner } from '@/components/shared';
import { TagPageClient } from '@/app/(frontend)/(pages)/reviews/tags/[tag]/page.client';
import { getCachedTitles, getCachedTitlesByTag } from '@/lib/helpers';
import { formatSlug } from '@/payload/utilities/utils';

/**
 * Генерация статических параметров для всех тегов
 */
export async function generateStaticParams() {
  const titles = await getCachedTitles()();
  const tagSet = new Set<string>();
  for (const t of titles) {
    if (t.visualTags) {
      t.visualTags.split(',').forEach((tag: string) => {
        const slug = formatSlug(tag.trim());
        if (slug) tagSet.add(slug);
      });
    }
  }
  return Array.from(tagSet).map((tag) => ({ tag }));
}

// Описание типов пропсов
type Props = {
  params: Promise<{ tag: string }>;
};

/**
 * Динамическая генерация метаданных для SEO
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;

  return {
    title: `#${tag} — ${METADATA.siteName}`,
    description: `Все фильмы и сериалы с тегом «${tag}» на ${METADATA.siteName}`,
    openGraph: {
      title: `#${tag} — ${METADATA.siteName}`,
      description: `Все фильмы и сериалы с тегом «${tag}»`,
    },
  };
}

/**
 * Страница тега — отображает все записи с указанным визуальным тегом.
 * Данные загружаются на сервере и передаются в клиентский компонент.
 */
const TagPage = async ({ params }: Props): Promise<JSX.Element> => {
  const { tag } = await params;

  if (!tag.trim()) {
    notFound();
  }

  const items = await getCachedTitlesByTag(tag)();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TagPageClient tagSlug={tag} items={items} />
    </Suspense>
  );
};

export default TagPage;
