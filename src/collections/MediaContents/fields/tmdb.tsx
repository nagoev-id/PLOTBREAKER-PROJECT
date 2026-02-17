'use client';

import { useField } from '@payloadcms/ui';
import { ChangeEvent, useState, useCallback } from 'react';
import axios from 'axios';
import Image from 'next/image';

/**
 * Базовые данные о фильме/сериале из TMDB.
 */
type TMDBMovie = {
  id: number;
  title?: string;
  name?: string; // для сериалов
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string; // для сериалов
  vote_average: number;
  overview: string;
  genre_ids: number[];
  original_title?: string;
  original_name?: string; // для сериалов
};

/**
 * Расширенные детали о фильме/сериале из TMDB.
 */
type TMDBDetails = TMDBMovie & {
  runtime?: number; // для фильмов
  episode_run_time?: number[]; // для сериалов
  number_of_seasons?: number; // для сериалов
  number_of_episodes?: number; // для сериалов
  genres: { id: number; name: string }[];
  external_ids?: {
    imdb_id?: string | null;
  };
  credits: {
    crew: { job: string; name: string }[];
  };
};

/**
 * Состояние компонента поиска.
 */
type State = {
  query: string;
  results: TMDBMovie[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  contentType: 'movie' | 'tv';
};

/**
 * Маппинг русских названий жанров из TMDB в программные ключи приложения.
 */
const genreMapping: Record<string, string> = {
  боевик: 'action',
  приключения: 'adventure',
  мультфильм: 'animation',
  комедия: 'comedy',
  криминал: 'crime',
  документальный: 'documentary',
  драма: 'drama',
  семейный: 'family',
  фэнтези: 'fantasy',
  история: 'history',
  ужасы: 'horror',
  музыка: 'music',
  мюзикл: 'musical',
  детектив: 'mystery',
  мелодрама: 'romance',
  фантастика: 'sci-fi',
  триллер: 'thriller',
  военный: 'war',
  вестерн: 'western',
  биография: 'biography',
  мистика: 'mystic',
  спорт: 'sport',
  короткометражка: 'short',
};

/**
 * Компонент TmdbSearch - кастомное поле для Payload CMS.
 * Предназначено для поиска контента в базе TMDB и автоматического заполнения полей статьи/обзора.
 */
export const TmdbSearch = () => {
  const { setValue: setTitle } = useField<string>({ path: 'title' });
  const { setValue: setPosterUrl } = useField<string>({ path: 'posterUrl' });
  const { setValue: setReleaseDate } = useField<string>({
    path: 'releaseDate',
  });
  const { setValue: setTmdbRating } = useField<number>({ path: 'tmdbRating' });
  const { setValue: setDuration } = useField<number>({ path: 'duration' });
  const { setValue: setDirector } = useField<string>({ path: 'director' });
  const { setValue: setGenres } = useField<string[]>({ path: 'genres' });
  const { setValue: setOriginalTitle } = useField<string>({
    path: 'originalTitle',
  });
  const { setValue: setReleaseYear } = useField<number>({
    path: 'releaseYear',
  });
  const { setValue: setSynopsis } = useField<string>({
    path: 'synopsis',
  });
  const { setValue: setSeasonCount } = useField<number>({
    path: 'seasonCount',
  });
  const { setValue: setEpisodeCount } = useField<number>({
    path: 'episodeCount',
  });
  const { setValue: setContentType } = useField<string>({
    path: 'type',
  });
  const { setValue: setImdbId } = useField<string | null>({ path: 'imdbId' });

  const [state, setState] = useState<State>({
    query: '',
    results: [],
    status: 'idle',
    error: null,
    contentType: 'movie',
  });

  const { error, status, results, query, contentType } = state;

  /**
   * Выполняет поиск фильмов или сериалов в TMDB через прокси-API.
   */
  const handleSearch = useCallback(async () => {
    if (!query) return;
    setState((prevState) => ({ ...prevState, status: 'loading', error: null }));
    try {
      const response = await axios.get<{ results: TMDBMovie[] }>(
        `/api/tmdb?query=${encodeURIComponent(query)}&type=${contentType}`
      );
      setState((prevState) => ({
        ...prevState,
        results: response.data.results,
        status: 'success',
      }));
    } catch (e) {
      setState((prevState) => ({
        ...prevState,
        status: 'error',
        error: 'Ошибка при поиске в TMDB. Проверьте соединение или API ключ.',
      }));
      console.error('[TmdbSearch] Search error:', e);
    } finally {
      setState((prevState) => ({ ...prevState, status: 'idle' }));
    }
  }, [query, contentType]);

  /**
   * Заполняет поля формы данными выбранного объекта.
   * Дозапрашивает расширенные сведения (режиссер, длительность, внешние ID).
   */
  const handleFill = async (item: TMDBMovie) => {
    try {
      setState((prevState) => ({
        ...prevState,
        status: 'loading',
        error: null,
      }));

      const title = item.title || item.name || '';
      const releaseDate = item.release_date || item.first_air_date || '';
      const originalTitle = item.original_title || item.original_name || '';

      setTitle(title);
      if (item.poster_path) {
        setPosterUrl(`https://image.tmdb.org/t/p/original${item.poster_path}`);
      }
      setReleaseDate(releaseDate);
      setTmdbRating(item.vote_average);
      setOriginalTitle(originalTitle);

      const typeValue = contentType === 'movie' ? 'film' : 'series';
      setContentType(typeValue);

      if (releaseDate) {
        const year = parseInt(releaseDate.split('-')[0]);
        if (!isNaN(year)) {
          setReleaseYear(year);
        }
      }

      if (item.overview) {
        setSynopsis(item.overview);
      }

      // Получаем детальную информацию
      const { data: details } = await axios.get<TMDBDetails>(
        `/api/tmdb?id=${item.id}&type=${contentType}`
      );

      if (details) {
        // Длительность
        if (details.runtime) {
          setDuration(details.runtime);
        } else if (
          details.episode_run_time &&
          details.episode_run_time.length > 0
        ) {
          setDuration(details.episode_run_time[0]);
        }

        // Данные для сериалов
        if (contentType === 'tv') {
          if (details.number_of_seasons)
            setSeasonCount(details.number_of_seasons);
          if (details.number_of_episodes)
            setEpisodeCount(details.number_of_episodes);
        }

        // Режиссер (только для фильмов)
        const director = details.credits?.crew?.find(
          (person) => person.job === 'Director'
        )?.name;
        if (director) setDirector(director);

        // IMDB ID
        if (details.external_ids?.imdb_id) {
          setImdbId(details.external_ids.imdb_id);
        }

        // Жанры
        if (details.genres) {
          const mappedGenres = details.genres
            .map((g) => genreMapping[g.name.toLowerCase()])
            .filter((v): v is string => !!v);
          setGenres(mappedGenres);
        }
      }
      setState((prevState) => ({
        ...prevState,
        status: 'success',
        query: '',
        results: [],
      }));
    } catch (e) {
      console.error('[TmdbSearch] Detail fetch error:', e);
      setState((prevState) => ({
        ...prevState,
        status: 'error',
        error: 'Ошибка при получении деталей объекта.',
      }));
    } finally {
      setState((prevState) => ({ ...prevState, status: 'idle' }));
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, query: e.target.value }));
  };

  const handleKeyDownChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div
      className="field-type tmdb-search-component"
      style={{ marginBottom: '20px' }}
    >
      <label
        className="field-label"
        style={{ marginBottom: '8px', display: 'block' }}
      >
        Поиск в TMDB
      </label>

      {/* Выбор типа контента */}
      <div
        style={{
          marginBottom: '12px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          <input
            type="radio"
            name="tmdbSearchContentType"
            value="movie"
            checked={contentType === 'movie'}
            onChange={() =>
              setState((prev) => ({
                ...prev,
                contentType: 'movie',
                results: [],
              }))
            }
            style={{ cursor: 'pointer' }}
          />
          Фильмы
        </label>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          <input
            type="radio"
            name="tmdbSearchContentType"
            value="tv"
            checked={contentType === 'tv'}
            onChange={() =>
              setState((prev) => ({
                ...prev,
                contentType: 'tv',
                results: [],
              }))
            }
            style={{ cursor: 'pointer' }}
          />
          Сериалы
        </label>
      </div>

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
          placeholder="Название на русском или языке оригинала..."
          onKeyDown={handleKeyDownChange}
        />
        <button
          type="button"
          onClick={handleSearch}
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
      </div>

      {error && (
        <div
          style={{ marginBottom: '10px', color: '#ef4444', fontSize: '0.9rem' }}
        >
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div
          style={{
            display: 'grid',
            maxHeight: '450px',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '15px',
            overflowY: 'auto',
            borderRadius: '4px',
            border: '1px solid var(--theme-elevation-200)',
            padding: '12px',
            backgroundColor: 'var(--theme-elevation-50)',
          }}
        >
          {results.map((movie) => (
            <div
              key={movie.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: 'var(--theme-bg)',
                border: '1px solid var(--theme-elevation-100)',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '2/3',
                  overflow: 'hidden',
                  borderRadius: '2px',
                  backgroundColor: 'var(--theme-elevation-200)',
                }}
              >
                {movie.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                    alt={movie.title || movie.name || 'Movie poster'}
                    fill
                    sizes="200px"
                    style={{
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      height: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--theme-text-400)',
                      fontSize: '0.8rem',
                    }}
                  >
                    Нет постера
                  </div>
                )}
              </div>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  lineHeight: '1.25',
                  minHeight: '2.5em',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {movie.title || movie.name}
              </div>
              <div
                style={{ fontSize: '0.75rem', color: 'var(--theme-text-400)' }}
              >
                {movie.release_date || movie.first_air_date
                  ? (movie.release_date || movie.first_air_date)!.split('-')[0]
                  : 'Год не указан'}
              </div>
              <button
                type="button"
                onClick={() => handleFill(movie)}
                style={{
                  marginTop: 'auto',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: 'var(--theme-elevation-200)',
                  padding: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: 'var(--theme-text)',
                  transition: 'background-color 0.2s',
                }}
              >
                Заполнить
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TmdbSearch;
