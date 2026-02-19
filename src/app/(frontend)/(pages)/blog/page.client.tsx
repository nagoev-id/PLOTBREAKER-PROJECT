'use client';

import { FC, JSX, useMemo, useState, useCallback } from 'react';
import { Post } from '@/payload-types';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Badge, Input } from '@/components/ui';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { PostCard } from '@/components/shared/post-card';
import { PAGINATION_CONFIG } from '@/utilities/constants';
import { User } from '@/payload-types';

// Тип пропсов
type BlogPageClientProps = {
  posts: Post[];
  user: User | null;
};

/**
 * Клиентский компонент страницы блога.
 * Поиск, грид карточек постов, пагинация.
 */
const BlogPageClient: FC<BlogPageClientProps> = ({
  posts,
  user,
}): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.defaultPageSize);

  // Фильтрация по поиску
  const filteredPosts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return posts;

    return posts.filter((post) => post.title?.toLowerCase().includes(query));
  }, [posts, searchQuery]);

  // Пагинация
  const totalPages = Math.ceil(filteredPosts.length / pageSize);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPosts.slice(start, start + pageSize);
  }, [filteredPosts, currentPage, pageSize]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return (
    <section className="px-4 py-8 border-t">
      <div className="container mx-auto">
        {/* Поиск */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            {/* Left side: Title + Count */}
            <div className="space-y-1">
              <h3 className="text-2xl font-bold lg:text-3xl md:mb-0">
                Последние посты
              </h3>
              <Badge className="rounded-sm font-medium">
                {filteredPosts.length}{' '}
                {filteredPosts.length === 1 ? 'статья' : 'статей'}
              </Badge>
            </div>

            {/* Right side: Search */}
            <div className="w-full max-w-sm">
              <p className="text-muted-foreground text-sm mb-1">Поиск</p>
              <div className="relative">
                <Search
                  size={16}
                  className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
                />
                <Input
                  placeholder="Поиск по заголовку..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 pr-9 text-xs sm:text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Грид карточек постов */}
        {paginatedPosts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5"
          >
            {paginatedPosts.map((post) => (
              <PostCard key={post.id} post={post} user={user} />
            ))}
          </motion.div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-muted-foreground text-lg">
              {searchQuery ? 'Ничего не найдено' : 'Пока нет статей'}
            </p>
          </div>
        )}

        {/* Пагинация */}
        {posts.length > PAGINATION_CONFIG.defaultPageSize && (
          <div className="mt-8">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              scrollToTop
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogPageClient;
