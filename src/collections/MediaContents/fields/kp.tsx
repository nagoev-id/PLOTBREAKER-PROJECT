'use client';

import { useField } from '@payloadcms/ui';
import { ChangeEvent, useState, useCallback } from 'react';
import axios from 'axios';
import Image from 'next/image';

/**
 * Результат поиска из KP API v2.2 films (keyword search)
 */
type KPSearchResult = {
  kinopoiskId: number;
  nameRu: string | null;
  nameEn: string | null;
  nameOriginal?: string | null;
  type: string; // FILM, TV_SERIES, TV_SHOW, MINI_SERIES, VIDEO
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

/**
 * Детальная информация о фильме из KP API v2.2 films/{id}
 */
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
  shortDescription: string | null;
  type: string;
  genres: { genre: string }[];
  countries: { country: string }[];
  imdbId: string | null;
  serial: boolean;
  completed: boolean;
};

/**
 * Сезон из KP API v2.2 films/{id}/seasons
 */
type KPSeason = {
  number: number;
  episodes: {
    seasonNumber: number;
    episodeNumber: number;
    nameRu: string | null;
    nameEn: string | null;
    synopsis: string | null;
    releaseDate: string | null;
  }[];
};

type KPSeasonsResponse = {
  total: number;
  items: KPSeason[];
};

/**
 * Участник съёмочной группы из KP API v1/staff
 */
type KPStaffMember = {
  staffId: number;
  nameRu: string | null;
  nameEn: string | null;
  professionKey: string; // DIRECTOR, ACTOR, PRODUCER, ...
};

/**
 * Фильтр по типу контента при поиске.
 */
type SearchTypeFilter = 'ALL' | 'FILM' | 'TV_SERIES';

/**
 * Состояние компонента поиска.
 */
type State = {
  query: string;
  results: KPSearchResult[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  typeFilter: SearchTypeFilter;
};

/**
 * Маппинг русских названий жанров из KP в ключи приложения.
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
 * Маппинг типов контента из KP API в значения приложения.
 */
const mapKpType = (
  kpType: string,
  genres: { genre: string }[]
): 'film' | 'series' | 'cartoon' => {
  const isCartoon = genres.some((g) => g.genre.toLowerCase() === 'мультфильм');
  if (isCartoon) return 'cartoon';

  const seriesTypes = ['TV_SERIES', 'TV_SHOW', 'MINI_SERIES'];
  if (seriesTypes.includes(kpType)) return 'series';

  return 'film';
};

/**
 * Компонент KpSearch — кастомное поле для Payload CMS.
 * Предназначено для поиска контента в базе Kinopoisk
 * и автоматического заполнения полей статьи/обзора.
 */
export const KpSearch = () => {
  const { setValue: setTitle } = useField<string>({ path: 'title' });
  const { value: originalTitleValue, setValue: setOriginalTitle } =
    useField<string>({
      path: 'originalTitle',
    });
  const { setValue: setPosterUrl } = useField<string>({ path: 'posterUrl' });
  const { setValue: setReleaseYear } = useField<number>({
    path: 'releaseYear',
  });
  const { setValue: setSynopsis } = useField<string>({ path: 'synopsis' });
  const { setValue: setDuration } = useField<number>({ path: 'duration' });
  const { setValue: setDirector } = useField<string>({ path: 'director' });
  const { setValue: setGenres } = useField<string[]>({ path: 'genres' });
  const { setValue: setContentType } = useField<string>({
    path: 'type',
  });
  const { setValue: setKinopoiskId } = useField<string>({
    path: 'kinopoiskId',
  });
  const { setValue: setKpRating } = useField<number>({ path: 'kpRating' });
  const { setValue: setTmdbRating } = useField<number>({
    path: 'tmdbRating',
  });
  const { setValue: setSlug } = useField<string>({ path: 'slug' });
  const { setValue: setSeasonCount } = useField<number>({
    path: 'seasonCount',
  });
  const { setValue: setEpisodeCount } = useField<number>({
    path: 'episodeCount',
  });
  const { setValue: setSeasons } = useField<
    { seasonNumber: number; id?: string }[]
  >({ path: 'seasons' });

  const [state, setState] = useState<State>({
    query: '',
    results: [],
    status: 'idle',
    error: null,
    typeFilter: 'ALL',
  });

  const { error, status, results, query, typeFilter } = state;

  /**
   * Выполняет поиск фильмов/сериалов через прокси-API.
   * @param queryOverride - Опциональный текст запроса (используется при автозаполнении)
   */
  const handleSearch = useCallback(
    async (queryOverride?: string) => {
      const searchQuery = queryOverride ?? query;
      if (!searchQuery.trim()) return;
      setState((prev) => ({ ...prev, status: 'loading', error: null }));
      try {
        const response = await axios.get<{ items: KPSearchResult[] }>(
          `/api/kp?query=${encodeURIComponent(searchQuery)}&type=${typeFilter}`
        );
        setState((prev) => ({
          ...prev,
          results: response.data.items || [],
          status: 'success',
        }));
      } catch (e) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error:
            'Ошибка при поиске в Кинопоиск. Проверьте соединение или API ключ.',
        }));
        console.error('[KpSearch] Search error:', e);
      } finally {
        setState((prev) => ({ ...prev, status: 'idle' }));
      }
    },
    [query, typeFilter]
  );

  /**
   * Заполняет поле поиска значением из originalTitle и запускает поиск.
   */
  const handleFillFromOriginalTitle = useCallback(() => {
    if (!originalTitleValue?.trim()) return;
    setState((prev) => ({ ...prev, query: originalTitleValue }));
    handleSearch(originalTitleValue);
  }, [originalTitleValue, handleSearch]);

  /**
   * Заполняет поля формы данными выбранного объекта.
   * Дозапрашивает расширенные сведения, сезоны и режиссёра.
   */
  const handleFill = async (item: KPSearchResult) => {
    try {
      setState((prev) => ({
        ...prev,
        status: 'loading',
        error: null,
      }));

      const filmId = item.kinopoiskId;

      // Базовые поля
      setTitle(item.nameRu || item.nameEn || '');
      setOriginalTitle(item.nameEn || item.nameOriginal || '');

      if (item.posterUrl) setPosterUrl(item.posterUrl);

      if (item.year) setReleaseYear(item.year);

      // Тип контента
      const contentType = mapKpType(item.type, item.genres);
      setContentType(contentType);

      // KP ID и slug
      setKinopoiskId(String(filmId));
      setSlug(String(filmId));

      // Жанры
      const mappedGenres = item.genres
        .map((g) => genreMapping[g.genre.toLowerCase()])
        .filter((v): v is string => !!v);
      if (mappedGenres.length > 0) setGenres(mappedGenres);

      // Параллельно запрашиваем детали, staff и (для сериалов) сезоны
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

      // Детали
      const details = detailsRes.data;
      if (details) {
        if (details.ratingKinopoisk) setKpRating(details.ratingKinopoisk);
        if (details.ratingImdb) setTmdbRating(details.ratingImdb);
        if (details.filmLength) setDuration(details.filmLength);
        if (details.description) setSynopsis(details.description);
        if (details.nameOriginal) setOriginalTitle(details.nameOriginal);
        if (details.year) setReleaseYear(details.year);
        if (details.posterUrl) setPosterUrl(details.posterUrl);
      }

      // Режиссёр из staff
      const staff = staffRes.data;
      if (Array.isArray(staff)) {
        const director = staff.find((s) => s.professionKey === 'DIRECTOR');
        if (director) {
          setDirector(director.nameRu || director.nameEn || '');
        }
      }

      // Сезоны для сериалов
      if (isSeries && seasonsRes?.data) {
        const seasonsData = seasonsRes.data;

        // Общее количество сезонов
        if (seasonsData.total) setSeasonCount(seasonsData.total);

        // Общее количество серий
        const totalEpisodes = seasonsData.items.reduce(
          (acc, s) => acc + (s.episodes?.length || 0),
          0
        );
        if (totalEpisodes > 0) setEpisodeCount(totalEpisodes);

        // Заполняем массив сезонов
        const seasonRows = seasonsData.items.map((s) => ({
          seasonNumber: s.number,
        }));
        if (seasonRows.length > 0) setSeasons(seasonRows);
      }

      setState((prev) => ({
        ...prev,
        status: 'success',
        query: '',
        results: [],
      }));
    } catch (e) {
      console.error('[KpSearch] Detail fetch error:', e);
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: 'Ошибка при получении деталей из Кинопоиск.',
      }));
    } finally {
      setState((prev) => ({ ...prev, status: 'idle' }));
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

  const handleTypeFilterChange = (value: SearchTypeFilter) => {
    setState((prev) => ({ ...prev, typeFilter: value }));
  };

  const typeFilters: { label: string; value: SearchTypeFilter }[] = [
    { label: 'Все', value: 'ALL' },
    { label: 'Фильмы', value: 'FILM' },
    { label: 'Сериалы', value: 'TV_SERIES' },
  ];

  return (
    <div
      className="field-type kp-search-component"
      style={{ marginBottom: '20px' }}
    >
      <label
        className="field-label"
        style={{ marginBottom: '8px', display: 'block' }}
      >
        🎬 Поиск в Кинопоиск
      </label>

      {/* Фильтр по типу */}
      <div
        style={{
          marginBottom: '10px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        {typeFilters.map((f) => (
          <label
            key={f.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              color: 'var(--theme-text)',
            }}
          >
            <input
              type="radio"
              name="kp-type-filter"
              value={f.value}
              checked={typeFilter === f.value}
              onChange={() => handleTypeFilterChange(f.value)}
              style={{ cursor: 'pointer' }}
            />
            {f.label}
          </label>
        ))}
      </div>

      {/* Поле ввода и кнопка */}
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
          onKeyDown={handleKeyDownChange}
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
        {originalTitleValue?.trim() && (
          <button
            type="button"
            onClick={handleFillFromOriginalTitle}
            title={`Искать: ${originalTitleValue}`}
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
            ⬆ Из оригинала
          </button>
        )}
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
          {results.map((film) => (
            <div
              key={film.kinopoiskId}
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
                {film.posterUrlPreview ? (
                  <Image
                    src={film.posterUrlPreview}
                    alt={film.nameRu || film.nameEn || 'Постер'}
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
                {film.nameRu || film.nameEn}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'var(--theme-text-400)',
                }}
              >
                <span>{film.year || 'Год не указан'}</span>
                {film.ratingKinopoisk && (
                  <span style={{ fontWeight: '600' }}>
                    ★ {film.ratingKinopoisk}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleFill(film)}
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

export default KpSearch;
