'use client';

import { FC, JSX, useMemo, useState, useCallback } from 'react';

import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Film, Search, X, Layers } from 'lucide-react';

import { MovieCard, PaginationControls } from '@/components/shared';
import { ALL_VALUE, TYPE_TABS, PAGINATION_CONFIG } from '@/lib/constants';
import { Input, Tabs, TabsList, TabsTrigger } from '@/components/ui';

import type { Title } from '@/payload-types';

type FranchisePageClientProps = {
  franchise: string;
  items: Title[];
};

/**
 * Клиентский компонент страницы франшизы
 */
export const FranchisePageClient: FC<FranchisePageClientProps> = ({
  franchise,
  items,
}): JSX.Element => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeType = searchParams.get('type') || ALL_VALUE;
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = PAGINATION_CONFIG.pageSizeOptions.includes(
    Number(searchParams.get('size'))
  )
    ? Number(searchParams.get('size'))
    : PAGINATION_CONFIG.defaultPageSize;

  const [searchQuery, setSearchQuery] = useState('');

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
      router.replace(
        `/reviews/franchises/${encodeURIComponent(franchise)}${qs ? `?${qs}` : ''}`,
        { scroll: false }
      );
    },
    [searchParams, router, franchise]
  );

  const handlePageChange = useCallback(
    (page: number) => updateUrlParams(page, pageSize, activeType),
    [updateUrlParams, pageSize, activeType]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      updateUrlParams(1, pageSize, activeType);
    },
    [updateUrlParams, pageSize, activeType]
  );

  const handleTypeChange = useCallback(
    (value: string) => updateUrlParams(1, pageSize, value),
    [updateUrlParams, pageSize]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => updateUrlParams(1, size, activeType),
    [updateUrlParams, activeType]
  );

  const handleReset = useCallback(() => {
    setSearchQuery('');
    router.replace(`/reviews/franchises/${encodeURIComponent(franchise)}`, {
      scroll: false,
    });
  }, [router, franchise]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeType !== ALL_VALUE && item.type !== activeType) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = item.title?.toLowerCase().includes(q);
        const originalMatch = item.originalTitle?.toLowerCase().includes(q);
        if (!titleMatch && !originalMatch) return false;
      }

      return true;
    });
  }, [items, activeType, searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  return (
    <section className="container mx-auto px-4 py-8 pt-24">
      {/* Заголовок и кнопка назад */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Назад
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-none border border-orange-500/25 bg-orange-500/10">
            <Layers size={20} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {franchise}
            </h1>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">
              {items.length}{' '}
              {items.length === 1
                ? 'запись'
                : items.length < 5
                  ? 'записи'
                  : 'записей'}{' '}
              во франшизе
            </p>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={activeType}
          onValueChange={handleTypeChange}
          className="flex justify-center"
        >
          <TabsList className="flex h-auto max-w-max justify-center">
            {TYPE_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:max-w-[290px]">
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
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {paginatedItems.map((item) => (
            <div key={item.id}>
              <MovieCard item={item} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <Film size={48} className="mb-4 opacity-40" />
          <p className="text-lg font-medium">Ничего не найдено</p>
          <p className="mt-1 text-sm">
            {searchQuery
              ? 'Попробуйте изменить поисковый запрос'
              : 'В этой франшизе пока нет записей'}
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

