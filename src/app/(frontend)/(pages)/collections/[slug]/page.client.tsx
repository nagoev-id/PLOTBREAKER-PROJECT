'use client';

import { FC, JSX } from 'react';
import {
  CollectionCollection,
  MediaContentCollection,
} from '@/utilities/types';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { cn, configCollection } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

import { Badge } from '@/components/ui';
import { MovieCard } from '@/components/shared/movie-card';

// Типы пропсов компонента
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
  const { type, TypeIcon } = configCollection(collection.title);

  // Получаем медиа-контент из коллекции
  const items: MediaContentCollection[] =
    collection.items?.docs?.filter(
      (item): item is MediaContentCollection => typeof item !== 'number'
    ) ?? [];

  return (
    <section className="space-y-4 py-8 lg:py-11">
      {/* Навигация назад */}
      <div className="container mx-auto">
        <Link
          href="/collections"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          Все коллекции
        </Link>
      </div>

      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4 container mx-auto"
      >
        <div className="flex items-center gap-3">
          {/* Иконка */}
          <div
            className={cn(
              'flex h-10 w-10 grid place-items-center rounded-none border shrink-0',
              type.bg
            )}
          >
            <TypeIcon size={20} className={type.color} />
          </div>

          {/* Заголовок */}
          <div className="space-y-1">
            <h1 className="text-xl font-bold lg:text-2xl">
              {collection.title}
            </h1>
            <Badge className="text-sm font-medium">
              {items.length}{' '}
              {items.length === 1
                ? 'запись'
                : items.length < 5
                  ? 'записи'
                  : 'записей'}
            </Badge>
          </div>
        </div>
      </motion.div>

      <Separator />

      {/* Карточки контента */}
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.length > 0 ? (
          items.map((item, index) => {
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.4 }}
              >
                <MovieCard item={item} />
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
