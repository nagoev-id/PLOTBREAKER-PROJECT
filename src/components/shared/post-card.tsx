import { Card } from '@/components/ui/card';
import { FC, JSX } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Tag } from 'lucide-react';
import { Post, Media } from '@/payload-types';
import { Badge } from '@/components/ui';

// Маппинг тегов на русские названия
const TAG_LABELS: Record<string, string> = {
  review: 'Обзор',
  news: 'Новости',
  collection: 'Подборка',
  opinion: 'Мнение',
  guide: 'Гайд',
};

/**
 * Форматирует дату в читаемый вид
 */
const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

type Props = {
  post: Post;
};

/**
 * Карточка поста в стиле MovieCard.
 * Вертикальная карточка с изображением, заголовком, тегами и датой.
 */
export const PostCard: FC<Props> = ({ post }): JSX.Element => {
  const heroImage =
    post.heroImage && typeof post.heroImage === 'object'
      ? (post.heroImage as Media)
      : null;

  return (
    <Link href={`/blog/${post.id}`} className="block h-full">
      <Card className="group flex h-full flex-col overflow-hidden rounded-none border shadow-none transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
        {/* Hero-изображение */}
        {heroImage?.url && (
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <Image
              src={heroImage.url}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/5 transition-colors group-hover:bg-black/10" />

            {/* Первый тег — overlay */}
            {post.tags && post.tags.length > 0 && (
              <div className="absolute top-1.5 right-1.5 rounded-sm bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                {TAG_LABELS[post.tags[0]] ?? post.tags[0]}
              </div>
            )}
          </div>
        )}

        {/* Контент карточки */}
        <div className="flex flex-1 flex-col gap-2 p-2 md:p-3">
          {/* Заголовок */}
          <h3 className="line-clamp-2 text-xs font-medium leading-tight md:text-sm xl:text-base">
            {post.title}
          </h3>

          {/* Теги */}
          {post.tags && post.tags.length > 1 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(1).map((tag) => (
                <Badge
                  key={tag}
                  variant="default"
                  className="rounded-sm px-1.5 py-0 text-[10px] font-normal"
                >
                  <Tag size={8} className="mr-0.5" />
                  {TAG_LABELS[tag] ?? tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Дата — прижата к низу */}
          <div className="mt-auto flex items-center gap-1 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            <Calendar size={11} className="opacity-60" />
            {formatDate(post.publishedAt || post.createdAt)}
          </div>
        </div>
      </Card>
    </Link>
  );
};
