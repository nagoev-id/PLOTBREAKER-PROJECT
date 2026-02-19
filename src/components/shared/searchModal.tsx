'use client';

import React, { FC, useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Film, Loader2, Palette, Search, Tv, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { MediaContentCollection } from '@/utilities/types';
import { searchMedia } from '@/actions/search';

const contentTypeIcons: Record<string, typeof Film> = {
  film: Film,
  series: Tv,
  cartoon: Palette,
};

// Описание пропсов
type SearchModalProps = {
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
};

/**
 * Модальное окно поиска медиа-контента.
 *
 * Функциональность:
 * - Поле ввода с дебаунсом (300мс)
 * - Отображение результатов с постерами и метаданными
 * - Навигация к странице обзора
 * - Закрытие по Esc и клику на фон
 */
export const SearchModal: FC<SearchModalProps> = ({
  isSearchOpen,
  setIsSearchOpen,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaContentCollection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce поиска
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const data = await searchMedia(query);
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      setIsLoading(false);
    };
  }, [query]);

  // Закрытие по Escape + блокировка скролла
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };

    if (isSearchOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isSearchOpen, setIsSearchOpen]);

  const handleClose = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsSearchOpen(false);
  }, [setIsSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 flex items-start justify-center bg-black/60 backdrop-blur-sm sm:items-center"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: 0.1 }}
          className="h-full w-full sm:mt-20 sm:h-auto sm:max-w-2xl sm:px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-background sm:border-border flex h-full flex-col overflow-hidden rounded-none border-0 shadow-2xl sm:rounded-lg sm:border">
            {/* Поисковое поле */}
            <div className="border-border flex items-center gap-2 border-b px-3 py-3 sm:gap-3 sm:px-6 sm:py-4">
              <Search
                size={18}
                className="text-muted-foreground shrink-0 sm:size-5"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по названию..."
                className="placeholder:text-muted-foreground flex-1 bg-transparent text-base outline-none sm:text-lg"
                autoFocus
              />
              {isLoading && (
                <Loader2
                  size={18}
                  className="text-muted-foreground animate-spin sm:size-5"
                />
              )}
              <button
                onClick={handleClose}
                className="hover:bg-accent cursor-pointer rounded-full p-1 transition-colors"
                aria-label="Закрыть"
              >
                <X size={18} className="sm:size-5" />
              </button>
            </div>

            {/* Результаты */}
            <div className="flex-1 overflow-y-auto sm:max-h-[60vh]">
              {results.length === 0 && query.trim() && !isLoading && (
                <div className="text-muted-foreground py-12 text-center text-sm sm:py-16 sm:text-base">
                  Ничего не найдено
                </div>
              )}

              {results.length === 0 && !query.trim() && (
                <div className="text-muted-foreground py-12 text-center text-sm sm:py-16 sm:text-base">
                  Начните вводить для поиска
                </div>
              )}

              {results.length > 0 && (
                <div className="divide-border divide-y">
                  {results.map((content) => {
                    const Icon = contentTypeIcons[content.type || 'film'];

                    const imageUrl =
                      content.poster &&
                      typeof content.poster === 'object' &&
                      'url' in content.poster &&
                      content.poster.url
                        ? content.poster.url
                        : content.posterUrl || '/images/cover.jpg';

                    return (
                      <Link
                        key={content.id}
                        href={`/reviews/${content.id}`}
                        onClick={handleClose}
                        className="group hover:bg-accent flex items-center justify-between gap-3 p-3 transition-colors sm:gap-4 sm:p-4"
                      >
                        <div className="flex items-center gap-3 overflow-hidden sm:gap-4">
                          {/* Постер */}
                          <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-md bg-zinc-100 sm:h-20 sm:w-14">
                            <Image
                              src={imageUrl}
                              alt={content.title}
                              fill
                              className="h-full w-full object-cover"
                              sizes="60px"
                            />
                          </div>

                          {/* Информация */}
                          <div className="flex min-w-0 flex-1 flex-col">
                            <h3 className="group-hover:text-primary line-clamp-1 text-sm font-bold transition-colors sm:text-base">
                              {content.title}
                            </h3>

                            {content.originalTitle &&
                              content.originalTitle !== content.title && (
                                <p className="text-muted-foreground line-clamp-1 text-xs">
                                  {content.originalTitle}
                                </p>
                              )}

                            <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-[11px] sm:mt-1 sm:text-xs">
                              {content.releaseYear && (
                                <span>{content.releaseYear}</span>
                              )}
                              {content.director && (
                                <>
                                  <span>•</span>
                                  <span className="line-clamp-1">
                                    {content.director}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Иконка типа контента */}
                        {Icon && (
                          <div className="bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 rounded-md p-2 transition-colors">
                            <Icon size={16} />
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
