'use client';

import { FC, JSX, useMemo, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Search, X, Tag } from 'lucide-react';

import { PostCard, PaginationControls, usePosts } from '@/components/shared';
import { PAGINATION_CONFIG } from '@/utilities/constants';
import { Input } from '@/components/ui';
import { PostCollection } from '@/utilities/types';

// Тип пропсов компонента
type BlogTagPageClientProps = {
  tag: string;
  tagLabel: string;
};

/**
 * Клиентский компонент страницы тега блога
 * @param tag - Значение тега (slug)
 * @param tagLabel - Отображаемое название тега
 * @returns {JSX.Element}
 */
export const BlogTagPageClient: FC<BlogTagPageClientProps> = ({
  tag,
  tagLabel,
}): JSX.Element => {
  // Роутер
  const router = useRouter();
  // Параметры поиска
  const searchParams = useSearchParams();
  // Список постов
  const { posts: allPosts } = usePosts();
  const posts = allPosts || [];

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
   */
  const updateUrlParams = useCallback(
    (page: number, size: number) => {
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
      const qs = params.toString();
      router.replace(`/blog/tags/${tag}${qs ? `?${qs}` : ''}`, {
        scroll: false,
      });
    },
    [searchParams, router, tag]
  );

  /**
   * Обработка изменения страницы
   * @param page - Номер страницы
   */
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      updateUrlParams(page, pageSize);
    },
    [updateUrlParams, pageSize]
  );

  /**
   * Обработка изменения поискового запроса
   * @param value - Значение поискового запроса
   */
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      setCurrentPage(1);
      updateUrlParams(1, pageSize);
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
      updateUrlParams(1, size);
    },
    [updateUrlParams]
  );

  /**
   * Сброс всех фильтров и параметров URL
   */
  const handleReset = useCallback(() => {
    setSearchQuery('');
    setCurrentPage(1);
    setPageSize(PAGINATION_CONFIG.defaultPageSize);
    router.replace(`/blog/tags/${tag}`, { scroll: false });
  }, [router, tag]);

  // Сброс при смене тега
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const sizeParam = searchParams.get('size');
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
    setSearchQuery('');
  }, [tag, searchParams]);

  // Фильтрация по тегу
  const tagPosts = useMemo(() => {
    return posts.filter(
      (post: PostCollection) =>
        post.tags && (post.tags as string[]).includes(tag)
    );
  }, [posts, tag]);

  // Фильтрация по поиску
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return tagPosts;

    const q = searchQuery.toLowerCase();
    return tagPosts.filter((post: PostCollection) =>
      post.title?.toLowerCase().includes(q)
    );
  }, [tagPosts, searchQuery]);

  // Пагинация
  const totalPages = Math.ceil(filteredPosts.length / pageSize);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPosts.slice(start, start + pageSize);
  }, [filteredPosts, currentPage, pageSize]);

  return (
    <section className="container mx-auto px-4 py-8">
      {/* Заголовок и кнопка назад */}
      <div className="mb-8">
        {/* Кнопка назад */}
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Назад
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
              {tagLabel}
            </h1>
          </div>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            {tagPosts.length}{' '}
            {tagPosts.length === 1
              ? 'статья'
              : tagPosts.length < 5
                ? 'статьи'
                : 'статей'}{' '}
            с тегом «{tagLabel}»
          </p>
        </motion.div>
      </div>

      {/* Поиск */}
      <div className="mb-6 flex items-center gap-2">
        <div className="relative sm:max-w-[290px] w-full">
          <Search
            size={14}
            className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
          />
          <Input
            placeholder="Поиск по заголовку..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleSearchChange(e.target.value)
            }
            className="pl-8 text-sm"
          />
        </div>
        {(searchQuery ||
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

      {/* Грид карточек */}
      {paginatedPosts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {paginatedPosts.map((post: PostCollection, index: number) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.4 }}
            >
              <PostCard post={post} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <FileText size={48} className="mb-4 opacity-40" />
          <p className="text-lg font-medium">Ничего не найдено</p>
          <p className="mt-1 text-sm">
            {searchQuery
              ? 'Попробуйте изменить поисковый запрос'
              : 'С этим тегом пока нет статей'}
          </p>
        </div>
      )}

      {/* Пагинация */}
      {filteredPosts.length > PAGINATION_CONFIG.defaultPageSize && (
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

export default BlogTagPageClient;
