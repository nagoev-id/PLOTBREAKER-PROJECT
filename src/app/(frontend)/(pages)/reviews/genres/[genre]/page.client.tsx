'use client';

import { FC, JSX, useMemo, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Film, Search, X } from 'lucide-react';

import {
  MovieCard,
  PaginationControls,
  useMediaContents,
} from '@/components/shared';
import { getGenreLabel } from '@/utilities/utils';
import { ALL_VALUE, TYPE_TABS, PAGINATION_CONFIG } from '@/utilities/constants';
import { Input, Tabs, TabsList, TabsTrigger } from '@/components/ui';

// Тип пропсов компонента
type GenrePageClientProps = {
  genre: string;
};

/**
 * Клиентский компонент страницы жанра
 * @param genre - Значение жанра
 * @returns {JSX.Element}
 */
export const GenrePageClient: FC<GenrePageClientProps> = ({
  genre,
}): JSX.Element => {
  // Роутер
  const router = useRouter();
  // Параметры поиска
  const searchParams = useSearchParams();
  // Список фильмов
  const { mediaContents } = useMediaContents();
  const items = mediaContents || [];
  // Текст жанра
  const label = getGenreLabel(genre);
  // Тип фильма
  const [activeType, setActiveType] = useState(() => {
    const typeParam = searchParams.get('type');
    return typeParam || ALL_VALUE;
  });
  // Поисковый запрос
  const [searchQuery, setSearchQuery] = useState('');
  // Текущая страница
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
  });
  // Размер страницы
  const [pageSize, setPageSize] = useState(() => {
    const sizeParam = searchParams.get('size');
    return sizeParam
      ? Math.max(
          1,
          parseInt(sizeParam, 10) || PAGINATION_CONFIG.defaultPageSize
        )
      : PAGINATION_CONFIG.defaultPageSize;
  });

  /**
   * Обновление параметров в URL
   * @param page - Номер страницы
   * @param size - Размер страницы
   * @param type - Тип фильма
   */
  const updateUrlParams = useCallback(
    (page: number, size: number, type: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete('page');
      } else {
        params.set('page', String(page));
      }
      if (size === PAGINATION_CONFIG.defaultPageSize) {
        params.delete('size');
      } else {
        params.set('size', String(size));
      }
      if (type === ALL_VALUE) {
        params.delete('type');
      } else {
        params.set('type', type);
      }
      const qs = params.toString();
      router.replace(`/reviews/genres/${genre}${qs ? `?${qs}` : ''}`, {
        scroll: false,
      });
    },
    [searchParams, router, genre]
  );

  /**
   * Обработка изменения страницы
   * @param page - Номер страницы
   */
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      updateUrlParams(page, pageSize, activeType);
    },
    [updateUrlParams, pageSize, activeType]
  );

  /**
   * Обработка изменения поискового запроса
   * @param value - Значение поискового запроса
   */
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      setCurrentPage(1);
      updateUrlParams(1, pageSize, activeType);
    },
    [updateUrlParams, pageSize, activeType]
  );

  /**
   * Обработка изменения типа фильма
   * @param value - Значение типа фильма
   */
  const handleTypeChange = useCallback(
    (value: string) => {
      setActiveType(value);
      setCurrentPage(1);
      updateUrlParams(1, pageSize, value);
    },
    [updateUrlParams, pageSize]
  );

  /**
   * Обработка изменения размера страницы
   * @param size - Размер страницы
   */
  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
      setCurrentPage(1);
      updateUrlParams(1, size, activeType);
    },
    [updateUrlParams, activeType]
  );

  /**
   * Сброс всех фильтров и параметров URL
   */
  const handleReset = useCallback(() => {
    setActiveType(ALL_VALUE);
    setSearchQuery('');
    setCurrentPage(1);
    setPageSize(PAGINATION_CONFIG.defaultPageSize);
    router.replace(`/reviews/genres/${genre}`, { scroll: false });
  }, [router, genre]);

  // Сброс при смене жанра
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const sizeParam = searchParams.get('size');
    const typeParam = searchParams.get('type');
    const initialPage = pageParam
      ? Math.max(1, parseInt(pageParam, 10) || 1)
      : 1;
    const initialSize = sizeParam
      ? Math.max(
          1,
          parseInt(sizeParam, 10) || PAGINATION_CONFIG.defaultPageSize
        )
      : PAGINATION_CONFIG.defaultPageSize;
    setCurrentPage(initialPage);
    setPageSize(initialSize);
    setActiveType(typeParam || ALL_VALUE);
    setSearchQuery('');
  }, [genre, searchParams]);

  // Фильтрация по жанру
  const genreItems = useMemo(() => {
    return items.filter(
      (item) => item.genres && (item.genres as string[]).includes(genre)
    );
  }, [items, genre]);

  // Фильтрация фильмов
  const filteredItems = useMemo(() => {
    return genreItems.filter((item) => {
      // Фильтр по типу
      if (activeType !== ALL_VALUE && item.type !== activeType) return false;

      // Поиск по названию
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = item.title?.toLowerCase().includes(q);
        const originalMatch = item.originalTitle?.toLowerCase().includes(q);
        if (!titleMatch && !originalMatch) return false;
      }

      return true;
    });
  }, [genreItems, activeType, searchQuery]);

  // Пагинация
  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  return (
    <section className="container mx-auto px-4 py-8">
      {/* Заголовок и кнопка назад */}
      <div className="mb-8">
        {/* Кнопка назад */}
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Каталог
        </Link>

        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {label}
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            {genreItems.length}{' '}
            {genreItems.length === 1
              ? 'запись'
              : genreItems.length < 5
                ? 'записи'
                : 'записей'}{' '}
            в жанре «{label}»
          </p>
        </motion.div>
      </div>

      {/* Фильтры */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Табы по типу */}
        <Tabs
          value={activeType}
          onValueChange={handleTypeChange}
          className="flex justify-center"
        >
          <TabsList className="flex h-auto justify-center max-w-max">
            {TYPE_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Поиск и кнопка сброса */}
        <div className="flex items-center gap-2">
          <div className="relative sm:max-w-[290px] w-full">
            <Search
              size={14}
              className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
            />
            <Input
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSearchChange(e.target.value)
              }
              className="pl-8 text-sm"
            />
          </div>
          {(activeType !== ALL_VALUE ||
            searchQuery ||
            currentPage > 1 ||
            pageSize !== PAGINATION_CONFIG.defaultPageSize) && (
            <button
              onClick={handleReset}
              className="flex cursor-pointer items-center gap-1 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X size={12} />
              Сбросить
            </button>
          )}
        </div>
      </div>

      {/* Грид карточек */}
      {paginatedItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {paginatedItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.4 }}
            >
              <MovieCard item={item} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <Film size={48} className="mb-4 opacity-40" />
          <p className="text-lg font-medium">Ничего не найдено</p>
          <p className="mt-1 text-sm">
            {searchQuery
              ? 'Попробуйте изменить поисковый запрос'
              : 'В этом жанре пока нет записей'}
          </p>
        </div>
      )}

      {/* Пагинация */}
      {filteredItems.length > PAGINATION_CONFIG.defaultPageSize && (
        <div className="mt-8">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            scrollToTop={false}
          />
        </div>
      )}
    </section>
  );
};

export default GenrePageClient;
