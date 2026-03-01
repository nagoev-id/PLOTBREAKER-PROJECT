'use client';

import { useField } from '@payloadcms/ui';
import { ChangeEvent, useState, useCallback } from 'react';

/**
 * Результат поиска HDRezka
 */
type RezkaSearchResult = {
  title: string;
  url: string;
  rating: number | null;
};

/**
 * Состояние компонента поиска
 */
type State = {
  query: string;
  results: RezkaSearchResult[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
};

/**
 * Компонент HdRezkaSearch — кастомное поле для Payload CMS.
 * Поиск контента на HDRezka и автозаполнение поля hdrezkaUrl.
 */
export const HdRezkaSearch = () => {
  const { value: originalTitleValue } = useField<string>({
    path: 'originalTitle',
  });
  const { value: titleValue } = useField<string>({ path: 'title' });
  const { setValue: setHdrezkaUrl } = useField<string>({
    path: 'hdrezkaUrl',
  });

  const [state, setState] = useState<State>({
    query: '',
    results: [],
    status: 'idle',
    error: null,
  });

  const { error, status, results, query } = state;

  /**
   * Выполняет поиск через API микросервиса
   */
  const handleSearch = useCallback(
    async (queryOverride?: string) => {
      const searchQuery = queryOverride ?? query;
      if (!searchQuery.trim()) return;
      setState((prev) => ({ ...prev, status: 'loading', error: null }));
      try {
        const res = await fetch(
          `/api/rezka/search?q=${encodeURIComponent(searchQuery)}`
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || `Ошибка ${res.status}`);
        }
        const data = await res.json();
        setState((prev) => ({
          ...prev,
          results: data.results || [],
          status: 'success',
        }));
      } catch (e) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error:
            e instanceof Error
              ? e.message
              : 'Ошибка при поиске на HDRezka. Проверьте, запущен ли микросервис.',
        }));
        console.error('[HdRezkaSearch] Search error:', e);
      }
    },
    [query]
  );

  /**
   * Выбирает фильм и заполняет поле hdrezkaUrl
   */
  const handleSelect = (item: RezkaSearchResult) => {
    setHdrezkaUrl(item.url);
    setState((prev) => ({
      ...prev,
      query: '',
      results: [],
      status: 'idle',
    }));
  };

  /**
   * Автозаполнение из оригинального названия
   */
  const handleFillFromOriginalTitle = useCallback(() => {
    const searchValue = originalTitleValue?.trim() || titleValue?.trim();
    if (!searchValue) return;
    setState((prev) => ({ ...prev, query: searchValue }));
    handleSearch(searchValue);
  }, [originalTitleValue, titleValue, handleSearch]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, query: e.target.value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div
      className="field-type hdrezka-search-component"
      style={{ marginBottom: '20px' }}
    >
      <label
        className="field-label"
        style={{ marginBottom: '8px', display: 'block' }}
      >
        🎥 Поиск на HDRezka
      </label>

      {/* Поле ввода и кнопки */}
      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          className="payload-text-input"
          style={{
            flex: 1,
            borderRadius: '4px',
            border: '1px solid var(--theme-elevation-200)',
            backgroundColor: 'var(--theme-bg)',
            padding: '10px 12px',
            fontSize: '1rem',
            color: 'var(--theme-text)',
          }}
          value={query}
          onChange={handleInputChange}
          placeholder="Название фильма или сериала..."
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          onClick={() => handleSearch()}
          style={{
            cursor: 'pointer',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: 'var(--theme-text)',
            padding: '10px 20px',
            fontWeight: '600',
            color: 'var(--theme-bg)',
            opacity: status === 'loading' ? 0.5 : 1,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.2s, background-color 0.2s',
          }}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? '...' : 'Найти'}
        </button>
        {(originalTitleValue?.trim() || titleValue?.trim()) && (
          <button
            type="button"
            onClick={handleFillFromOriginalTitle}
            title={`Искать: ${originalTitleValue || titleValue}`}
            style={{
              cursor: 'pointer',
              borderRadius: '4px',
              border: '1px solid var(--theme-elevation-200)',
              backgroundColor: 'var(--theme-elevation-100)',
              padding: '10px 14px',
              fontWeight: '600',
              color: 'var(--theme-text)',
              opacity: status === 'loading' ? 0.5 : 1,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'opacity 0.2s, background-color 0.2s',
            }}
            disabled={status === 'loading'}
          >
            ⬆ Из названия
          </button>
        )}
      </div>

      {/* Ошибка */}
      {error && (
        <div
          style={{ marginBottom: '10px', color: '#ef4444', fontSize: '0.9rem' }}
        >
          {error}
        </div>
      )}

      {/* Результаты поиска */}
      {results.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            maxHeight: '350px',
            overflowY: 'auto',
            borderRadius: '4px',
            border: '1px solid var(--theme-elevation-200)',
            padding: '8px',
            backgroundColor: 'var(--theme-elevation-50)',
          }}
        >
          {results.map((film, idx) => (
            <div
              key={`${film.url}-${idx}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '4px',
                backgroundColor: 'var(--theme-bg)',
                border: '1px solid var(--theme-elevation-100)',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    lineHeight: '1.3',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {film.title}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--theme-text-400)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginTop: '2px',
                  }}
                >
                  {film.url.replace('https://hdrezka.ag/', '')}
                </div>
              </div>

              {film.rating && (
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    color:
                      film.rating >= 7
                        ? '#22c55e'
                        : film.rating >= 5
                          ? '#eab308'
                          : '#ef4444',
                    flexShrink: 0,
                  }}
                >
                  ★ {film.rating}
                </span>
              )}

              <button
                type="button"
                onClick={() => handleSelect(film)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#6366f1',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: '#fff',
                  flexShrink: 0,
                  transition: 'background-color 0.2s',
                }}
              >
                Выбрать
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HdRezkaSearch;
