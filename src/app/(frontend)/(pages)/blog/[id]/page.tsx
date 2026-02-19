import { COLLECTION_SLUGS, METADATA } from '@/utilities/constants';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import BlogDetailClient from './page.client';
import { Post } from '@/payload-types';

// Настройки кэширования
export const revalidate = 60;

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Генерация метаданных для страницы поста
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const payload = await getPayload({ config: configPromise });

  try {
    const post = (await payload.findByID({
      collection: COLLECTION_SLUGS.posts,
      id: Number(id),
      depth: 1,
    })) as Post;

    return {
      title: `${post.title} — ${METADATA.blogPage.title}`,
    };
  } catch {
    return { title: METADATA.blogPage.title };
  }
}

/**
 * Серверный компонент детальной страницы поста.
 */
const BlogDetailPage = async ({ params }: Props) => {
  const { id } = await params;
  const payload = await getPayload({ config: configPromise });

  let post: Post;

  try {
    post = (await payload.findByID({
      collection: COLLECTION_SLUGS.posts,
      id: Number(id),
      depth: 1,
    })) as Post;
  } catch {
    return notFound();
  }

  if (!post) {
    return notFound();
  }

  return <BlogDetailClient post={post} />;
};

export default BlogDetailPage;
