'use client';

import { FC, ChangeEvent, useState, useCallback } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { Search, Loader2, Film, Tv } from 'lucide-react';
import { Button, Input } from '@/components/ui';

// ============================================================================
// Общие типы
// ============================================================================

/**
 * Данные, которые передаются в форму при выборе результата поиска.
 */
export type SearchFillData = {
  title?: string;
  originalTitle?: string;
  posterUrl?: string;
  releaseYear?: number;
  synopsis?: string;
  duration?: number;
  director?: string;
  genres?: string[];
  type?: 'film' | 'series' | 'cartoon';
  kinopoiskId?: string;
  kpRating?: number;
  tmdbRating?: number;
  seasonCount?: number;
  episodeCount?: number;
};

interface ExternalSearchProps {
  onFill: (data: SearchFillData) => void;
  originalTitle?: string;
}

/**
 * Маппинг русских жанров в ключи приложения.
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

// ============================================================================
// Кинопоиск
// ============================================================================

type KPSearchResult = {
  kinopoiskId: number;
  nameRu: string | null;
  nameEn: string | null;
  nameOriginal?: string | null;
  type: string;
  year: number | null;
  description: string | null;
  filmLength: number | null;
  ratingKinopoisk: number | null;
  ratingImdb: number | null;
  posterUrl: string;
  posterUrlPreview: string;
  genres: { genre: string }[];
  countries: { country: string }[];
};

type KPDetails = {
  kinopoiskId: number;
  nameRu: string | null;
  nameEn: string | null;
  nameOriginal: string | null;
  posterUrl: string | null;
  ratingKinopoisk: number | null;
  ratingImdb: number | null;
  year: number | null;
  filmLength: number | null;
  description: string | null;
  type: string;
  genres: { genre: string }[];
};

type KPStaffMember = {
  staffId: number;
  nameRu: string | null;
  nameEn: string | null;
  professionKey: string;
};

type KPSeasonsResponse = {
  total: number;
  items: { number: number; episodes: unknown[] }[];
};

type SearchTypeFilter = 'ALL' | 'FILM' | 'TV_SERIES';

const mapKpType = (
  kpType: string,
  genres: { genre: string }[]
): 'film' | 'series' | 'cartoon' => {
  const isCartoon = genres.some((g) => g.genre.toLowerCase() === 'мультфильм');
  if (isCartoon) return 'cartoon';
  if (['TV_SERIES', 'TV_SHOW', 'MINI_SERIES'].includes(kpType)) return 'series';
  return 'film';
};

/**
 * Компонент поиска в Кинопоиск для dashboard.
 */
export const KpSearchDashboard: FC<ExternalSearchProps> = ({
  onFill,
  originalTitle,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<KPSearchResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<SearchTypeFilter>('ALL');
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = useCallback(
    async (queryOverride?: string) => {
      const searchQuery = queryOverride ?? query;
      if (!searchQuery.trim()) return;
      setStatus('loading');
      setError(null);
      try {
        const response = await axios.get<{ items: KPSearchResult[] }>(
          `/api/kp?query=${encodeURIComponent(searchQuery)}&type=${typeFilter}`
        );
        setResults(response.data.items || []);
      } catch {
        setError('Ошибка при поиске в Кинопоиск');
      } finally {
        setStatus('idle');
      }
    },
    [query, typeFilter]
  );

  const handleFill = async (item: KPSearchResult) => {
    setStatus('loading');
    setError(null);
    try {
      const filmId = item.kinopoiskId;
      const contentType = mapKpType(item.type, item.genres);
      const mappedGenres = item.genres
        .map((g) => genreMapping[g.genre.toLowerCase()])
        .filter((v): v is string => !!v);

      const isSeries = ['TV_SERIES', 'TV_SHOW', 'MINI_SERIES'].includes(
        item.type
      );

      const [detailsRes, staffRes, seasonsRes] = await Promise.all([
        axios.get<KPDetails>(`/api/kp?id=${filmId}`),
        axios.get<KPStaffMember[]>(`/api/kp?id=${filmId}&endpoint=staff`),
        isSeries
          ? axios.get<KPSeasonsResponse>(
              `/api/kp?id=${filmId}&endpoint=seasons`
            )
          : null,
      ]);

      const details = detailsRes.data;
      const staff = staffRes.data;

      const director = Array.isArray(staff)
        ? staff.find((s) => s.professionKey === 'DIRECTOR')
        : undefined;

      const fillData: SearchFillData = {
        title: item.nameRu || item.nameEn || undefined,
        originalTitle:
          details?.nameOriginal ||
          item.nameEn ||
          item.nameOriginal ||
          undefined,
        posterUrl: details?.posterUrl || item.posterUrl || undefined,
        releaseYear: details?.year || item.year || undefined,
        synopsis: details?.description || undefined,
        duration: details?.filmLength || undefined,
        director: director
          ? director.nameRu || director.nameEn || undefined
          : undefined,
        genres: mappedGenres.length > 0 ? mappedGenres : undefined,
        type: contentType,
        kinopoiskId: String(filmId),
        kpRating: details?.ratingKinopoisk || undefined,
        tmdbRating: details?.ratingImdb || undefined,
      };

      if (isSeries && seasonsRes?.data) {
        fillData.seasonCount = seasonsRes.data.total || undefined;
        const totalEpisodes = seasonsRes.data.items.reduce(
          (acc, s) => acc + (s.episodes?.length || 0),
          0
        );
        if (totalEpisodes > 0) fillData.episodeCount = totalEpisodes;
      }

      onFill(fillData);
      setResults([]);
      setQuery('');
      setIsOpen(false);
    } catch {
      setError('Ошибка при получении деталей из Кинопоиск');
    } finally {
      setStatus('idle');
    }
  };

  const handleFillFromOriginalTitle = () => {
    if (!originalTitle?.trim()) return;
    setQuery(originalTitle);
    handleSearch(originalTitle);
  };

  const typeFilters: { label: string; value: SearchTypeFilter }[] = [
    { label: 'Все', value: 'ALL' },
    { label: 'Фильмы', value: 'FILM' },
    { label: 'Сериалы', value: 'TV_SERIES' },
  ];

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        🎬 Поиск в Кинопоиск
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">🎬 Поиск в Кинопоиск</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(false);
            setResults([]);
          }}
        >
          ✕
        </Button>
      </div>

      {/* Фильтр по типу */}
      <div className="flex gap-3">
        {typeFilters.map((f) => (
          <label
            key={f.value}
            className="flex cursor-pointer items-center gap-1.5 text-sm"
          >
            <input
              type="radio"
              name="kp-dash-filter"
              value={f.value}
              checked={typeFilter === f.value}
              onChange={() => setTypeFilter(f.value)}
              className="cursor-pointer"
            />
            {f.label}
          </label>
        ))}
      </div>

      {/* Поиск */}
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          onKeyDown={(e) =>
            e.key === 'Enter' && (e.preventDefault(), handleSearch())
          }
          placeholder="Название фильма или сериала..."
          className="flex-1"
        />
        <Button
          type="button"
          onClick={() => handleSearch()}
          disabled={status === 'loading'}
          size="sm"
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
        {originalTitle?.trim() && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFillFromOriginalTitle}
            disabled={status === 'loading'}
          >
            ⬆ Из оригинала
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Результаты */}
      {results.length > 0 && (
        <div className="grid max-h-[400px] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
          {results.map((film) => (
            <button
              key={film.kinopoiskId}
              type="button"
              onClick={() => handleFill(film)}
              className="flex flex-col gap-1.5 rounded-lg border p-2 text-left transition-colors hover:bg-accent"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded bg-muted">
                {film.posterUrlPreview ? (
                  <Image
                    src={film.posterUrlPreview}
                    alt={film.nameRu || ''}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    Нет постера
                  </div>
                )}
              </div>
              <div className="line-clamp-2 text-xs font-medium">
                {film.nameRu || film.nameEn}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{film.year || '—'}</span>
                {film.ratingKinopoisk && <span>★ {film.ratingKinopoisk}</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// TMDB
// ============================================================================

type TMDBMovie = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
  original_title?: string;
  original_name?: string;
};

type TMDBDetails = TMDBMovie & {
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  genres: { id: number; name: string }[];
  external_ids?: { imdb_id?: string | null };
  credits: { crew: { job: string; name: string }[] };
};

/**
 * Компонент поиска в TMDB для dashboard.
 */
export const TmdbSearchDashboard: FC<ExternalSearchProps> = ({ onFill }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<'movie' | 'tv'>('movie');
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setStatus('loading');
    setError(null);
    try {
      const response = await axios.get<{ results: TMDBMovie[] }>(
        `/api/tmdb?query=${encodeURIComponent(query)}&type=${contentType}`
      );
      setResults(response.data.results || []);
    } catch {
      setError('Ошибка при поиске в TMDB');
    } finally {
      setStatus('idle');
    }
  }, [query, contentType]);

  const handleFill = async (item: TMDBMovie) => {
    setStatus('loading');
    setError(null);
    try {
      const title = item.title || item.name || '';
      const releaseDate = item.release_date || item.first_air_date || '';
      const originalTitle = item.original_title || item.original_name || '';
      const typeValue =
        contentType === 'movie' ? ('film' as const) : ('series' as const);

      const { data: details } = await axios.get<TMDBDetails>(
        `/api/tmdb?id=${item.id}&type=${contentType}`
      );

      const director = details?.credits?.crew?.find(
        (p) => p.job === 'Director'
      )?.name;
      const mappedGenres = details?.genres
        ?.map((g) => genreMapping[g.name.toLowerCase()])
        .filter((v): v is string => !!v);

      const fillData: SearchFillData = {
        title: title || undefined,
        originalTitle: originalTitle || undefined,
        posterUrl: item.poster_path
          ? `https://image.tmdb.org/t/p/original${item.poster_path}`
          : undefined,
        releaseYear: releaseDate
          ? parseInt(releaseDate.split('-')[0])
          : undefined,
        synopsis: item.overview || undefined,
        duration:
          details?.runtime || details?.episode_run_time?.[0] || undefined,
        director: director || undefined,
        genres:
          mappedGenres && mappedGenres.length > 0 ? mappedGenres : undefined,
        type: typeValue,
        tmdbRating: item.vote_average || undefined,
      };

      if (contentType === 'tv') {
        fillData.seasonCount = details?.number_of_seasons || undefined;
        fillData.episodeCount = details?.number_of_episodes || undefined;
      }

      onFill(fillData);
      setResults([]);
      setQuery('');
      setIsOpen(false);
    } catch {
      setError('Ошибка при получении деталей из TMDB');
    } finally {
      setStatus('idle');
    }
  };

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        🌐 Поиск в TMDB
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">🌐 Поиск в TMDB</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(false);
            setResults([]);
          }}
        >
          ✕
        </Button>
      </div>

      {/* Тип */}
      <div className="flex gap-4">
        <label className="flex cursor-pointer items-center gap-1.5 text-sm">
          <input
            type="radio"
            name="tmdb-dash-type"
            checked={contentType === 'movie'}
            onChange={() => {
              setContentType('movie');
              setResults([]);
            }}
          />
          <Film className="h-3.5 w-3.5" /> Фильмы
        </label>
        <label className="flex cursor-pointer items-center gap-1.5 text-sm">
          <input
            type="radio"
            name="tmdb-dash-type"
            checked={contentType === 'tv'}
            onChange={() => {
              setContentType('tv');
              setResults([]);
            }}
          />
          <Tv className="h-3.5 w-3.5" /> Сериалы
        </label>
      </div>

      {/* Поиск */}
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          onKeyDown={(e) =>
            e.key === 'Enter' && (e.preventDefault(), handleSearch())
          }
          placeholder="Название на русском или оригинале..."
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleSearch}
          disabled={status === 'loading'}
          size="sm"
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Результаты */}
      {results.length > 0 && (
        <div className="grid max-h-[400px] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
          {results.map((movie) => (
            <button
              key={movie.id}
              type="button"
              onClick={() => handleFill(movie)}
              className="flex flex-col gap-1.5 rounded-lg border p-2 text-left transition-colors hover:bg-accent"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded bg-muted">
                {movie.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                    alt={movie.title || movie.name || ''}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    Нет постера
                  </div>
                )}
              </div>
              <div className="line-clamp-2 text-xs font-medium">
                {movie.title || movie.name}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>
                  {(movie.release_date || movie.first_air_date || '').split(
                    '-'
                  )[0] || '—'}
                </span>
                {movie.vote_average > 0 && (
                  <span>★ {movie.vote_average.toFixed(1)}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
