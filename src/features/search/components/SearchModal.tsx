'use client';

import { FC, JSX, useCallback, useEffect, useState } from 'react';
import type { Title } from '@/payload-types';

import { searchMedia } from '@/features/search/actions';
import { SearchForm } from './SearchForm';
import { SearchResults } from './SearchResults';

type SearchModalProps = {
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
};

/**
 * Модальное окно поиска медиа-контента
 */
export const SearchModal: FC<SearchModalProps> = ({
  isSearchOpen,
  setIsSearchOpen,
}): JSX.Element | null => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Title[]>([]);
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
    <div
      className="fixed inset-0 z-100 flex items-start justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onClick={handleClose}
    >
      <div
        className="h-full w-full sm:mt-20 sm:h-auto sm:max-w-2xl sm:px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-background sm:border-border flex h-full flex-col overflow-hidden rounded-none border-0 shadow-2xl sm:rounded-lg sm:border">
          <SearchForm
            query={query}
            onQueryChange={setQuery}
            isLoading={isLoading}
            onClose={handleClose}
          />
          <SearchResults
            results={results}
            query={query}
            isLoading={isLoading}
            onClose={handleClose}
          />
        </div>
      </div>
    </div>
  );
};
