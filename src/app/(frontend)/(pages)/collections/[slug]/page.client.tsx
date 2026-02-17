'use client';

import { FC, JSX } from 'react';
import {
  CollectionCollection,
  MediaContentCollection,
} from '@/utilities/types';
import { TYPE_CONFIG } from '@/utilities/constants';
import { GENRES } from '@/utilities/constants';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn, getTypeKey } from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ListIcon,
  Star,
  ThumbsDown,
  ThumbsUp,
  Minus,
} from 'lucide-react';
import Image from 'next/image';

/**
 * Маппинг впечатлений на иконки и цвета.
 */
const OPINION_CONFIG: Record<
  string,
  { icon: typeof ThumbsUp; label: string; color: string }
> = {
  like: { icon: ThumbsUp, label: 'Понравилось', color: 'text-green-500' },
  neutral: { icon: Minus, label: 'Пойдет', color: 'text-yellow-500' },
  dislike: { icon: ThumbsDown, label: 'Потрачено', color: 'text-red-500' },
};

/**
 * Получить label жанра по его value.
 */
const getGenreLabel = (value: string): string => {
  const genre = GENRES.find((g) => g.value === value);
  return genre?.label ?? value;
};

type CollectionDetailClientProps = {
  collection: CollectionCollection;
};

/**
 * Клиентский компонент страницы детальной коллекции.
 * Отображает заголовок коллекции и карточки медиа-контента.
 */
const CollectionDetailClient: FC<CollectionDetailClientProps> = ({
  collection,
}): JSX.Element => {
  const typeKey = getTypeKey(collection.title);
  const type = TYPE_CONFIG[typeKey] ?? {
    label: 'Контент',
    icon: ListIcon,
    bg: 'bg-zinc-100',
    color: 'text-zinc-500',
  };
  const TypeIcon = type.icon;

  // Join-поле items: { docs: MediaContent[] }
  const items: MediaContentCollection[] =
    collection.items?.docs?.filter(
      (item): item is MediaContentCollection => typeof item !== 'number'
    ) ?? [];

  return (
    <section className="container mx-auto space-y-8 px-4 py-8 lg:py-11">
      {/* Навигация назад */}
      <Link
        href="/collections"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft size={16} />
        Все коллекции
      </Link>

      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-lg',
              type.bg
            )}
          >
            <TypeIcon size={24} className={type.color} />
          </div>
          <div>
            <h1 className="text-2xl font-bold lg:text-3xl">
              {collection.title}
            </h1>
            <p className="text-muted-foreground text-sm">
              {items.length}{' '}
              {items.length === 1
                ? 'запись'
                : items.length < 5
                  ? 'записи'
                  : 'записей'}
            </p>
          </div>
        </div>
      </motion.div>

      <Separator />

      {/* Карточки контента */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.length > 0 ? (
          items.map((item, index) => {
            const opinion = item.personalOpinion
              ? OPINION_CONFIG[item.personalOpinion]
              : null;
            const OpinionIcon = opinion?.icon;

            // Получаем URL постера
            const posterSrc =
              item.poster && typeof item.poster === 'object'
                ? item.poster.url
                : item.posterUrl;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.4 }}
              >
                <Card className="group overflow-hidden rounded-sm border-2 shadow-none transition-all hover:shadow-md">
                  {/* Постер */}
                  {posterSrc && (
                    <div className="relative aspect-[2/3] w-full overflow-hidden">
                      <Image
                        src={posterSrc}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                  )}

                  {/* Контент карточки */}
                  <div className="space-y-2 p-3">
                    {/* Заголовок */}
                    <h3 className="line-clamp-2 text-sm font-bold leading-tight">
                      {item.title}
                    </h3>

                    {/* Оригинальное название */}
                    {item.originalTitle && (
                      <p className="text-muted-foreground line-clamp-1 text-xs">
                        {item.originalTitle}
                      </p>
                    )}

                    {/* Жанры */}
                    {item.genres && item.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.genres.slice(0, 3).map((genre) => (
                          <span
                            key={genre}
                            className="bg-muted rounded px-1.5 py-0.5 text-[10px]"
                          >
                            {getGenreLabel(genre)}
                          </span>
                        ))}
                      </div>
                    )}

                    <Separator />

                    {/* Метаданные */}
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        {/* Год */}
                        {item.releaseYear && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="opacity-60" />
                            {item.releaseYear}
                          </span>
                        )}
                        {/* Длительность */}
                        {item.duration && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="opacity-60" />
                            {item.duration} мин
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Рейтинг KP */}
                        {item.kpRating && (
                          <span className="flex items-center gap-1">
                            <Star
                              size={12}
                              className="fill-amber-400 text-amber-400"
                            />
                            {item.kpRating.toFixed(1)}
                          </span>
                        )}
                        {/* Впечатление */}
                        {OpinionIcon && opinion && (
                          <OpinionIcon size={14} className={opinion.color} />
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-20 text-center"
          >
            <div className="text-muted-foreground">
              В этой коллекции пока нет записей
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CollectionDetailClient;
