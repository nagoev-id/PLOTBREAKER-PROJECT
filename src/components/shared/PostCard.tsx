'use client';

import { Card } from '@/components/ui/card';
import { FC, JSX, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Badge } from '@/components/ui';

import { AdminActions } from '@/components/shared';
import { formatDate } from '@/utilities/utils';
import { MediaCollection, PostCollection } from '@/utilities/types';
import axios from 'axios';

// Маппинг тегов на русские названия
const TAG_LABELS: Record<string, string> = {
  review: 'Обзор',
  news: 'Новости',
  collection: 'Подборка',
  opinion: 'Мнение',
  guide: 'Гайд',
};

type Props = {
  post: PostCollection;
};

/**
 * Карточка поста в стиле MovieCard.
 * Вертикальная карточка с изображением, заголовком, тегами и датой.
 */
export const PostCard: FC<Props> = ({ post }): JSX.Element => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  console.log(post);
  const heroImage =
    post.heroImage && typeof post.heroImage === 'object'
      ? (post.heroImage as MediaCollection)
      : null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const {
        data: { success },
      } = await axios.delete(`/api/posts/${post.id}`);

      if (!success) {
        throw new Error('Failed to delete');
      }

      toast.success('Пост удален');
      router.refresh();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Ошибка при удалении');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative h-full group/card">
      <Card className="group flex h-full flex-col overflow-hidden rounded-none border shadow-none transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
        {/* Hero-изображение */}
        <div className="relative aspect-[16/10] w-full h-[200px] lg:h-[300px] overflow-hidden bg-muted">
          <Link href={`/blog/${post.id}`} className="block h-full w-full">
            {heroImage?.url ? (
              <Image
                src={heroImage.url}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground/20">
                <Tag size={48} />
              </div>
            )}
            <div className="absolute inset-0 bg-black/5 transition-colors group-hover:bg-black/10" />

            {/* Первый тег — overlay */}
            {post.tags && post.tags.length > 0 && (
              <div className="absolute top-1.5 right-1.5 rounded-sm bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                {TAG_LABELS[post.tags[0]] ?? post.tags[0]}
              </div>
            )}
          </Link>
          <AdminActions
            editUrl={`/admin/collections/posts/${post.id}`}
            onDelete={handleDelete}
            isDeleting={isDeleting}
            title={post.title}
            typeName="Пост"
            classNames="absolute top-1 left-1 z-10"
          />
        </div>

        {/* Контент карточки */}
        <div className="flex flex-1 flex-col gap-2 p-2 md:p-3">
          <Link href={`/blog/${post.id}`} className="flex flex-col flex-1">
            {/* Заголовок */}
            <h3 className="line-clamp-2 text-xs font-medium leading-tight md:text-sm xl:text-base group-hover:text-primary transition-colors">
              {post.title}
            </h3>

            {/* Теги */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/blog/tags/${tag}`}>
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1.5 py-0 text-[10px] font-normal cursor-pointer hover:bg-accent transition-colors"
                    >
                      <Tag size={8} className="mr-0.5" />
                      {TAG_LABELS[tag] ?? tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Дата — прижата к низу */}
            <div className="mt-auto flex items-center gap-1 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <Calendar size={11} className="opacity-60" />
              {formatDate(post.publishedAt || post.createdAt)}
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
};
