'use client';

import {
  FC,
  JSX,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Badge,
  Button,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import {
  Clapperboard,
  Library,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';

import {
  CustomSelect,
  MovieCard,
  PaginationControls,
} from '@/components/shared';
import {
  PAGINATION_CONFIG,
  ALL_VALUE,
  HOMEPAGE_FILTERS,
} from '@/lib/constants';
import type { Title } from '@/payload-types';
import {
  genreOptions,
  matchesRating,
  releaseYearOptions,
  watchYearOptions,
} from '@/lib/utils';

/**
 * Клиентский компонент главной страницы.
 * Отображает список медиа-контента с фильтрами, поиском и пагинацией.
 * @param items - Массив медиа-контента
 * @returns {JSX.Element}
 */
const HomePageClient: FC<{ items: Title[] }> = ({
  items: itemsProp,
}): JSX.Element => {
  const items = useMemo(() => itemsProp ?? [], [itemsProp]);
  const genreFilterOptions = useMemo(() => genreOptions(), []);
  const releaseYearFilterOptions = useMemo(
    () => releaseYearOptions(items),
    [items]
  );
  const watchYearFilterOptions = useMemo(
    () => watchYearOptions(items),
    [items]
  );

  // Ref для debounce поиска
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Инициализируем роутер и searchParams
  const router = useRouter();
  const searchParams = useSearchParams();

  // Состояния для фильтров
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get('q') || ''
  );
  const [activeType, setActiveType] = useState(
    () => searchParams.get('type') || ALL_VALUE
  );
  const [selectedGenre, setSelectedGenre] = useState(
    () => searchParams.get('genre') || ALL_VALUE
  );
  const [selectedReleaseYear, setSelectedReleaseYear] = useState(
    () => searchParams.get('year') || ALL_VALUE
  );
  const [selectedOpinion, setSelectedOpinion] = useState(
    () => searchParams.get('opinion') || ALL_VALUE
  );
  const [selectedStatus, setSelectedStatus] = useState(
    () => searchParams.get('status') || 'watched'
  );
  const [selectedRating, setSelectedRating] = useState(
    () => searchParams.get('rating') || ALL_VALUE
  );
  const [selectedWatchYear, setSelectedWatchYear] = useState(
    () => searchParams.get('watchYear') || ALL_VALUE
  );

  // Пагинация
  const currentPage = Number(searchParams.get('page')) || 1;
  const pageSize = PAGINATION_CONFIG.pageSizeOptions.includes(
    Number(searchParams.get('size'))
  )
    ? Number(searchParams.get('size'))
    : PAGINATION_CONFIG.defaultPageSize;

  // Синхронизация при изменении searchParams (back/forward браузера)
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setActiveType(searchParams.get('type') || ALL_VALUE);
    setSelectedGenre(searchParams.get('genre') || ALL_VALUE);
    setSelectedReleaseYear(searchParams.get('year') || ALL_VALUE);
    setSelectedOpinion(searchParams.get('opinion') || ALL_VALUE);
    setSelectedStatus(searchParams.get('status') || 'watched');
    setSelectedRating(searchParams.get('rating') || ALL_VALUE);
    setSelectedWatchYear(searchParams.get('watchYear') || ALL_VALUE);
  }, [searchParams]);

  useEffect(
    () => () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    },
    []
  );

  // Обновляет все параметры в URL
  const updateParams = useCallback(
    (
      overrides: {
        page?: number;
        size?: number;
        type?: string;
        genre?: string;
        year?: string;
        opinion?: string;
        status?: string;
        rating?: string;
        watchYear?: string;
        q?: string;
      } = {}
    ) => {
      const p = new URLSearchParams();
      const page = overrides.page ?? currentPage;
      const size = overrides.size ?? pageSize;
      const type = overrides.type ?? activeType;
      const genre = overrides.genre ?? selectedGenre;
      const year = overrides.year ?? selectedReleaseYear;
      const opinion = overrides.opinion ?? selectedOpinion;
      const status = overrides.status ?? selectedStatus;
      const rating = overrides.rating ?? selectedRating;
      const watchYear = overrides.watchYear ?? selectedWatchYear;
      const q = overrides.q ?? searchQuery;

      if (page > 1) p.set('page', String(page));
      if (size !== PAGINATION_CONFIG.defaultPageSize)
        p.set('size', String(size));
      if (type !== ALL_VALUE) p.set('type', type);
      if (genre !== ALL_VALUE) p.set('genre', genre);
      if (year !== ALL_VALUE) p.set('year', year);
      if (opinion !== ALL_VALUE) p.set('opinion', opinion);
      if (status !== ALL_VALUE) p.set('status', status);
      if (rating !== ALL_VALUE) p.set('rating', rating);
      if (watchYear !== ALL_VALUE) p.set('watchYear', watchYear);
      if (q) p.set('q', q);

      const qs = p.toString();
      router.replace(qs ? `?${qs}` : '/', { scroll: false });
    },
    [
      router,
      currentPage,
      pageSize,
      activeType,
      selectedGenre,
      selectedReleaseYear,
      selectedOpinion,
      selectedStatus,
      selectedRating,
      selectedWatchYear,
      searchQuery,
    ]
  );

  /**
   * Фильтрует медиа-контент по заданным критериям
   * @returns {MediaContent[]} - Отфильтрованный массив медиа-контента
   */
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return items.filter((item) => {
      // Тип контента
      if (activeType !== ALL_VALUE && item.type !== activeType) return false;

      // Поиск по тексту
      if (query) {
        const titleMatch = item.title?.toLowerCase().includes(query);
        const originalMatch = item.originalTitle?.toLowerCase().includes(query);
        const directorMatch = item.director?.toLowerCase().includes(query);
        if (!titleMatch && !originalMatch && !directorMatch) return false;
      }

      // Жанр
      if (
        selectedGenre !== ALL_VALUE &&
        !item.genres?.includes(
          selectedGenre as Title['genres'] extends (infer U)[] | null
            ? U
            : never
        )
      )
        return false;

      // Год выхода
      if (
        selectedReleaseYear !== ALL_VALUE &&
        item.releaseYear !== Number(selectedReleaseYear)
      )
        return false;

      // Впечатление
      if (
        selectedOpinion !== ALL_VALUE &&
        item.personalOpinion !== selectedOpinion
      )
        return false;

      // Статус
      if (selectedStatus !== ALL_VALUE && item.status !== selectedStatus)
        return false;

      // Рейтинг КП
      if (selectedRating !== ALL_VALUE) {
        if (!matchesRating(item.kpRating, selectedRating)) return false;
      }

      // Год просмотра
      if (
        selectedWatchYear !== ALL_VALUE &&
        item.watchYear !== Number(selectedWatchYear)
      )
        return false;

      return true;
    });
  }, [
    items,
    searchQuery,
    activeType,
    selectedGenre,
    selectedReleaseYear,
    selectedOpinion,
    selectedStatus,
    selectedRating,
    selectedWatchYear,
  ]);

  // Вычисляет общее количество страниц
  const totalPages = Math.ceil(filteredItems.length / pageSize);

  /**
   * Получает отфильтрованные элементы для текущей страницы
   * @returns {MediaContent[]} - Отфильтрованные элементы
   */
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  /**
   * Обработчик смены страницы
   * @param page - Новая страница
   */
  const handlePageChange = useCallback(
    (page: number) => updateParams({ page }),
    [updateParams]
  );

  /**
   * Обработчик смены размера страницы
   * @param newSize - Новый размер страницы
   */
  const handlePageSizeChange = useCallback(
    (newSize: number) => updateParams({ page: 1, size: newSize }),
    [updateParams]
  );

  /**
   * Обработчик смены типа
   * @param value - Новый тип
   */
  const handleTypeChange = useCallback(
    (value: string) => {
      setActiveType(value);
      updateParams({ page: 1, type: value });
    },
    [updateParams]
  );

  /**
   * Сброс всех фильтров
   */
  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setActiveType(ALL_VALUE);
    setSelectedGenre(ALL_VALUE);
    setSelectedReleaseYear(ALL_VALUE);
    setSelectedOpinion(ALL_VALUE);
    setSelectedStatus('watched');
    setSelectedRating(ALL_VALUE);
    setSelectedWatchYear(ALL_VALUE);
    router.replace('/', { scroll: false });
  }, [router]);

  /**
   * Проверяет, есть ли активные фильтры
   * @returns {boolean} - true, если есть активные фильтры
   */
  const hasActiveFilters =
    searchQuery !== '' ||
    activeType !== ALL_VALUE ||
    selectedGenre !== ALL_VALUE ||
    selectedReleaseYear !== ALL_VALUE ||
    selectedOpinion !== ALL_VALUE ||
    selectedStatus !== 'watched' ||
    selectedRating !== ALL_VALUE ||
    selectedWatchYear !== ALL_VALUE ||
    currentPage > 1 ||
    pageSize !== PAGINATION_CONFIG.defaultPageSize;

  const dashboardStats = useMemo(() => {
    const planned = items.filter((item) => item.status === 'planned').length;
    const liked = items.filter(
      (item) => item.personalOpinion === 'like'
    ).length;

    return {
      total: items.length,
      planned,
      liked,
    };
  }, [items]);

  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string; value: string }[] = [];

    if (searchQuery.trim()) {
      chips.push({
        key: 'q',
        label: 'Поиск',
        value: searchQuery.trim(),
      });
    }

    if (activeType !== ALL_VALUE) {
      chips.push({
        key: 'type',
        label: 'Тип',
        value:
          HOMEPAGE_FILTERS.types.find((option) => option.value === activeType)
            ?.label ?? activeType,
      });
    }

    if (selectedGenre !== ALL_VALUE) {
      chips.push({
        key: 'genre',
        label: 'Жанр',
        value:
          genreFilterOptions.find((option) => option.value === selectedGenre)
            ?.label ?? selectedGenre,
      });
    }

    if (selectedReleaseYear !== ALL_VALUE) {
      chips.push({
        key: 'year',
        label: 'Год выхода',
        value: selectedReleaseYear,
      });
    }

    if (selectedOpinion !== ALL_VALUE) {
      chips.push({
        key: 'opinion',
        label: 'Оценка',
        value:
          HOMEPAGE_FILTERS.opinions.find(
            (option) => option.value === selectedOpinion
          )?.label ?? selectedOpinion,
      });
    }

    if (selectedStatus !== 'watched') {
      chips.push({
        key: 'status',
        label: 'Статус',
        value:
          HOMEPAGE_FILTERS.statuses.find(
            (option) => option.value === selectedStatus
          )?.label ?? selectedStatus,
      });
    }

    if (selectedRating !== ALL_VALUE) {
      chips.push({
        key: 'rating',
        label: 'Рейтинг',
        value:
          HOMEPAGE_FILTERS.ratings.find(
            (option) => option.value === selectedRating
          )?.label ?? selectedRating,
      });
    }

    if (selectedWatchYear !== ALL_VALUE) {
      chips.push({
        key: 'watchYear',
        label: 'Год просмотра',
        value:
          watchYearFilterOptions.find(
            (option) => option.value === selectedWatchYear
          )?.label ?? selectedWatchYear,
      });
    }

    return chips;
  }, [
    searchQuery,
    activeType,
    selectedGenre,
    selectedReleaseYear,
    selectedOpinion,
    selectedStatus,
    selectedRating,
    selectedWatchYear,
    genreFilterOptions,
    watchYearFilterOptions,
  ]);

  return (
    <section className="relative border-t border-border/60 bg-linear-to-b from-white via-zinc-50/55 to-white pb-10 pt-8 dark:from-zinc-950 dark:via-zinc-950 dark:to-black lg:pb-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.14),transparent_55%),radial-gradient(circle_at_85%_15%,rgba(8,145,178,0.14),transparent_45%)] dark:bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.18),transparent_52%),radial-gradient(circle_at_90%_10%,rgba(56,189,248,0.2),transparent_45%)]" />
      <div className="container mx-auto space-y-5 px-2 sm:px-4 lg:space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-900/10 bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-800 p-5 text-white shadow-xl shadow-zinc-900/20 dark:border-zinc-700/60 dark:from-zinc-900 dark:via-zinc-950 dark:to-black dark:shadow-black/55 sm:p-7">
          <div className="pointer-events-none absolute -top-16 right-8 h-40 w-40 rounded-full bg-amber-300/30 blur-3xl dark:bg-fuchsia-500/25" />
          <div className="pointer-events-none absolute -bottom-24 left-14 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl dark:bg-sky-500/25" />
          <div className="relative z-10 space-y-5">
            <div className="space-y-2">
              <Badge className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase">
                Каталог пересказов
              </Badge>
              <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">
                Подборка без спойлерного шума
              </h2>
              <p className="max-w-2xl text-sm text-white/75 sm:text-base">
                Фильтруйте библиотеку по настроению, жанру и личной оценке,
                чтобы быстро найти стоящие истории.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur dark:border-white/10 dark:bg-white/6">
                <div className="mb-2 flex items-center gap-2 text-xs text-white/75 dark:text-white/70">
                  <Library className="size-4" />
                  Всего записей
                </div>
                <div className="text-2xl font-semibold">
                  {dashboardStats.total}
                </div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur dark:border-white/10 dark:bg-white/6">
                <div className="mb-2 flex items-center gap-2 text-xs text-white/75 dark:text-white/70">
                  <Clapperboard className="size-4" />
                  Найдено сейчас
                </div>
                <div className="text-2xl font-semibold">
                  {filteredItems.length}
                </div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur dark:border-white/10 dark:bg-white/6">
                <div className="mb-2 flex items-center gap-2 text-xs text-white/75 dark:text-white/70">
                  <Sparkles className="size-4" />
                  Понравилось
                </div>
                <div className="text-2xl font-semibold">
                  {dashboardStats.liked}
                </div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur dark:border-white/10 dark:bg-white/6">
                <div className="mb-2 flex items-center gap-2 text-xs text-white/75 dark:text-white/70">
                  <Search className="size-4" />
                  Запланировано
                </div>
                <div className="text-2xl font-semibold">
                  {dashboardStats.planned}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(270px,0.2fr)_minmax(0,1fr)] xl:gap-5">
          <aside className="xl:sticky xl:top-20 xl:h-fit">
            <div className="rounded-2xl border border-zinc-200/80 bg-card/90 p-4 shadow-sm backdrop-blur supports-backdrop-filter:bg-card/70 dark:border-zinc-800/80 dark:bg-zinc-950/75 dark:shadow-black/30 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold tracking-wide uppercase">
                    Фильтры
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    Настройте выдачу под себя
                  </p>
                </div>
                <SlidersHorizontal className="text-muted-foreground size-4" />
              </div>

              <div className="grid gap-3">
                <div className="relative">
                  <Search
                    size={14}
                    className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                  />
                  <Input
                    placeholder="Название, режиссёр или оригинал"
                    value={searchQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchQuery(value);
                      if (searchDebounceRef.current) {
                        clearTimeout(searchDebounceRef.current);
                      }
                      searchDebounceRef.current = setTimeout(() => {
                        updateParams({ page: 1, q: value });
                      }, 300);
                    }}
                    className="h-10 rounded-xl border-border/70 bg-background pl-8 text-sm dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  />
                </div>

                <CustomSelect
                  label="Жанр"
                  value={selectedGenre}
                  onValueChange={(v) => {
                    setSelectedGenre(v);
                    updateParams({ page: 1, genre: v });
                  }}
                  options={genreFilterOptions}
                  placeholder="Все жанры"
                />

                <CustomSelect
                  label="Год выхода"
                  value={selectedReleaseYear}
                  onValueChange={(v) => {
                    setSelectedReleaseYear(v);
                    updateParams({ page: 1, year: v });
                  }}
                  options={releaseYearFilterOptions}
                  placeholder="Год выхода"
                />

                <CustomSelect
                  label="Личная оценка"
                  value={selectedOpinion}
                  onValueChange={(v) => {
                    setSelectedOpinion(v);
                    updateParams({ page: 1, opinion: v });
                  }}
                  options={HOMEPAGE_FILTERS.opinions}
                  placeholder="Впечатление"
                />

                <CustomSelect
                  label="Статус"
                  value={selectedStatus}
                  onValueChange={(v) => {
                    setSelectedStatus(v);
                    updateParams({ page: 1, status: v });
                  }}
                  options={HOMEPAGE_FILTERS.statuses}
                  placeholder="Статус"
                />

                <CustomSelect
                  label="Рейтинг КП/IMDB"
                  value={selectedRating}
                  onValueChange={(v) => {
                    setSelectedRating(v);
                    updateParams({ page: 1, rating: v });
                  }}
                  options={HOMEPAGE_FILTERS.ratings}
                  placeholder="Рейтинг КП"
                />

                <CustomSelect
                  label="Год просмотра"
                  value={selectedWatchYear}
                  onValueChange={(v) => {
                    setSelectedWatchYear(v);
                    updateParams({ page: 1, watchYear: v });
                  }}
                  options={watchYearFilterOptions}
                  placeholder="Год просмотра"
                />
              </div>

              {hasActiveFilters && (
                <div className="mt-4">
                  <Button
                    onClick={resetFilters}
                    size="sm"
                    variant="outline"
                    className="w-full rounded-xl dark:border-zinc-700 dark:bg-zinc-900/40 dark:hover:bg-zinc-800/70"
                  >
                    <X size={12} />
                    Сбросить фильтры
                  </Button>
                </div>
              )}
            </div>
          </aside>

          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-200/80 bg-card/90 p-4 shadow-sm backdrop-blur supports-backdrop-filter:bg-card/70 dark:border-zinc-800/80 dark:bg-zinc-950/75 dark:shadow-black/30 sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                    Раздел записей
                  </p>
                  <h3 className="text-xl font-semibold sm:text-2xl">
                    Результат поиска
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Переключайте тип и фильтры, чтобы собрать точную подборку.
                  </p>
                </div>

                <Tabs value={activeType} onValueChange={handleTypeChange}>
                  <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-muted/70 p-1 dark:bg-zinc-900/80 dark:ring-1 dark:ring-zinc-800 lg:w-auto lg:justify-end">
                    {HOMEPAGE_FILTERS.types.map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="rounded-lg px-3 text-xs dark:text-zinc-300 dark:data-[state=active]:bg-zinc-100 dark:data-[state=active]:text-zinc-900 dark:data-[state=active]:shadow-none sm:text-sm"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white sm:text-sm dark:bg-zinc-100 dark:text-zinc-900">
                  Найдено: {filteredItems.length}
                </Badge>
                <Badge
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-xs font-medium dark:bg-zinc-800 dark:text-zinc-100"
                >
                  На странице: {paginatedItems.length}
                </Badge>
                {activeFilterChips.map((chip) => (
                  <Badge
                    key={chip.key}
                    variant="outline"
                    className="rounded-full border-zinc-300/90 bg-white/80 px-3 py-1 text-[11px] font-medium dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200"
                  >
                    {chip.label}: {chip.value}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item, index) => (
                  <div key={item.id}>
                    <MovieCard item={item} priority={index < 8} />
                  </div>
                ))
              ) : (
                <div className="col-span-full rounded-2xl border border-dashed border-zinc-300/70 bg-white/70 py-20 text-center dark:border-zinc-800 dark:bg-zinc-950/65">
                  <div className="text-muted-foreground">
                    {hasActiveFilters
                      ? 'По выбранным фильтрам ничего не найдено'
                      : 'Нет записей'}
                  </div>
                </div>
              )}
            </div>

            {filteredItems.length > pageSize && (
              <div className="rounded-2xl border border-zinc-200/80 bg-card/90 p-3 shadow-sm backdrop-blur supports-backdrop-filter:bg-card/70 dark:border-zinc-800/80 dark:bg-zinc-950/75 dark:shadow-black/30 sm:p-4">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  pageSize={pageSize}
                  onPageSizeChange={handlePageSizeChange}
                  scrollToTop
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePageClient;
