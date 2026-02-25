'use client';

import { FC, JSX, useMemo, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Film, Search, X, Tag } from 'lucide-react';

import { MovieCard, PaginationControls } from '@/components/shared';
import { ALL_VALUE, TYPE_TABS, PAGINATION_CONFIG } from '@/utilities/constants';
import { Input, Tabs, TabsList, TabsTrigger } from '@/components/ui';
import { formatSlugString } from '@/utilities/utils';

import { MediaContentCollection } from '@/utilities/types';

// Тип пропсов компонента
type TagPageClientProps = {
  tagSlug: string;
  items: MediaContentCollection[];
};

/**
 * Клиентский компонент страницы тега
 * @param tagSlug - Slug визуального тега из URL
 * @returns {JSX.Element}
 */
export const TagPageClient: FC<TagPageClientProps> = ({
  tagSlug,
  items,
}): JSX.Element => {
  // Роутер
  const router = useRouter();
  // Параметры поиска
  const searchParams = useSearchParams();

  // Находим оригинальное название тега из данных
  const originalTag = useMemo(() => {
    for (const item of items) {
      if (item.visualTags && typeof item.visualTags === 'string') {
        const tags = item.visualTags.split(',').map((t) => t.trim());
        const found = tags.find((t) => formatSlugString(t) === tagSlug);
        if (found) return found;
      }
    }
    return tagSlug;
  }, [items, tagSlug]);

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
      router.replace(`/reviews/tags/${tagSlug}${qs ? `?${qs}` : ''}`, {
        scroll: false,
      });
    },
    [searchParams, router, tagSlug]
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
    router.replace(`/reviews/tags/${tagSlug}`, { scroll: false });
  }, [router, tagSlug]);

  // Сброс при смене тега
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
  }, [tagSlug, searchParams]);

  // Фильтрация (данные уже по тегу, фильтруем по типу/поиску)
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
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
  }, [items, activeType, searchQuery]);

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
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Каталог
        </button>

        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Tag size={20} className="text-muted-foreground" />
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              #{originalTag}
            </h1>
          </div>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            {items.length}{' '}
            {items.length === 1
              ? 'запись'
              : items.length < 5
                ? 'записи'
                : 'записей'}{' '}
            с тегом «{originalTag}»
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
              : 'С этим тегом пока нет записей'}
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

export default TagPageClient;
