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
  const [searchState, setSearchState] = useState<{
    results: Title[];
    isLoading: boolean;
  }>({ results: [], isLoading: false });

  // Debounce поиска
  useEffect(() => {
    if (!query.trim()) {
      setSearchState({ results: [], isLoading: false });
      return;
    }

    setSearchState((prev) => ({ ...prev, isLoading: true }));

    const timer = setTimeout(async () => {
      try {
        const data = await searchMedia(query);
        setSearchState({ results: data, isLoading: false });
      } catch (error) {
        console.error('Search error:', error);
        setSearchState({ results: [], isLoading: false });
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      setSearchState((prev) => ({ ...prev, isLoading: false }));
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
    setSearchState({ results: [], isLoading: false });
    setIsSearchOpen(false);
  }, [setIsSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onClick={handleClose}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClose();
      }}
      role="presentation"
    >
      <div
        className="h-full w-full sm:mt-20 sm:h-auto sm:max-w-2xl sm:px-4"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="presentation"
      >
        <div className="bg-background sm:border-border flex h-full flex-col overflow-hidden rounded-none border-0 shadow-2xl sm:rounded-lg sm:border">
          <SearchForm
            query={query}
            onQueryChange={setQuery}
            isLoading={searchState.isLoading}
            onClose={handleClose}
          />
          <SearchResults
            results={searchState.results}
            query={query}
            isLoading={searchState.isLoading}
            onClose={handleClose}
          />
        </div>
      </div>
    </div>
  );
};
