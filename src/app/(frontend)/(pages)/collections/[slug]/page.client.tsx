'use client';

import { FC, JSX, useCallback, useMemo } from 'react';
import {
  CollectionCollection,
  MediaContentCollection,
} from '@/utilities/types';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { cn, configCollection } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

import { Badge } from '@/components/ui';
import { MovieCard } from '@/components/shared/movie-card';
import { PaginationControls } from '@/components/shared/pagination-controls';

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50];

import { User } from '@/payload-types';

// Типы пропсов компонента
type CollectionDetailClientProps = {
  collection: CollectionCollection;
  user: User | null;
};

/**
 * Клиентский компонент страницы детальной коллекции.
 * Отображает заголовок коллекции и карточки медиа-контента с пагинацией.
 */
const CollectionDetailClient: FC<CollectionDetailClientProps> = ({
  collection,
  user,
}): JSX.Element => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { type, TypeIcon } = configCollection(collection.title);

  // Читаем состояние пагинации из URL
  const currentPage = Number(searchParams.get('page')) || 1;
  const pageSize = PAGE_SIZE_OPTIONS.includes(Number(searchParams.get('size')))
    ? Number(searchParams.get('size'))
    : DEFAULT_PAGE_SIZE;

  // Обновление URL с новыми параметрами пагинации
  const updateParams = useCallback(
    (page: number, size: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete('page');
      } else {
        params.set('page', String(page));
      }
      if (size === DEFAULT_PAGE_SIZE) {
        params.delete('size');
      } else {
        params.set('size', String(size));
      }
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : '?', { scroll: false });
    },
    [router, searchParams]
  );

  // Получаем медиа-контент из коллекции
  const allItems: MediaContentCollection[] =
    collection.items?.docs?.filter(
      (item): item is MediaContentCollection => typeof item !== 'number'
    ) ?? [];

  // Подсчёт общего количества страниц
  const totalPages = Math.ceil(allItems.length / pageSize);

  // Записи для текущей страницы
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allItems.slice(start, start + pageSize);
  }, [allItems, currentPage, pageSize]);

  // Обработчики пагинации
  const handlePageChange = useCallback(
    (page: number) => updateParams(page, pageSize),
    [updateParams, pageSize]
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => updateParams(1, newSize),
    [updateParams]
  );

  return (
    <section className="space-y-4 py-8 lg:py-11">
      {/* Навигация назад */}
      <div className="container mx-auto px-2 sm:px-4">
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
        className="space-y-4 container mx-auto px-2 sm:px-4"
      >
        <div className="space-y-1">
          {/* Иконка */}
          <div
            className={cn(
              'flex h-10 w-10 grid place-items-center rounded-none border shrink-0',
              type.bg
            )}
          >
            <TypeIcon size={20} className={type.color} />
          </div>
          <h1 className="text-xl font-bold lg:text-2xl">{collection.title}</h1>
          <Badge className="text-xs sm:text-sm font-medium">
            {allItems.length}{' '}
            {allItems.length === 1
              ? 'запись'
              : allItems.length < 5
                ? 'записи'
                : 'записей'}
          </Badge>
        </div>
      </motion.div>

      <Separator />

      {/* Пагинация */}
      {allItems.length > 10 && (
        <div className="container mx-auto px-2 sm:px-4">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            scrollToTop
          />
        </div>
      )}

      {/* Карточки контента */}
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-2 sm:px-4">
        {paginatedItems.length > 0 ? (
          paginatedItems.map((item, index) => {
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.4 }}
              >
                <MovieCard item={item} user={user} />
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
      {/* Пагинация */}
      {allItems.length > 10 && (
        <div className="container mx-auto px-2 sm:px-4">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            scrollToTop
          />
        </div>
      )}
    </section>
  );
};

export default CollectionDetailClient;
