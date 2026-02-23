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
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Badge,
  Button,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { Search, X } from 'lucide-react';

import {
  CustomSelect,
  MovieCard,
  PaginationControls,
} from '@/components/shared';
import {
  PAGINATION_CONFIG,
  ALL_VALUE,
  HOMEPAGE_FILTERS,
} from '@/utilities/constants';
import { MediaContentCollection } from '@/utilities/types';
import {
  genreOptions,
  matchesRating,
  releaseYearOptions,
  watchYearOptions,
} from '@/utilities/utils';

/**
 * Клиентский компонент главной страницы.
 * Отображает список медиа-контента с фильтрами, поиском и пагинацией.
 * @param items - Массив медиа-контента
 * @returns {JSX.Element}
 */
const HomePageClient: FC<{ items: MediaContentCollection[] }> = ({
  items: itemsProp,
}): JSX.Element => {
  const items = itemsProp || [];

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
    setSelectedRating(searchParams.get('rating') || ALL_VALUE);
    setSelectedWatchYear(searchParams.get('watchYear') || ALL_VALUE);
  }, [searchParams]);

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
          selectedGenre as MediaContentCollection['genres'] extends
            | (infer U)[]
            | null
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
    selectedRating !== ALL_VALUE ||
    selectedWatchYear !== ALL_VALUE ||
    currentPage > 1 ||
    pageSize !== PAGINATION_CONFIG.defaultPageSize;

  return (
    <section className="space-y-6 pb-8 lg:pb-11 border-t pt-8">
      <div className="container mx-auto space-y-2 md:space-y-6 px-2 sm:px-4">
        {/* Заголовок + Количество найденных записей */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2 md:space-y-4 md:flex md:items-center md:justify-between"
        >
          {/* Заголовок */}
          <h3 className="text-2xl font-bold lg:text-3xl md:mb-0">Записи</h3>

          {/* Вкладки по типу контента */}
          <Tabs value={activeType} onValueChange={handleTypeChange}>
            <TabsList className="flex h-auto justify-center max-w-max">
              {HOMEPAGE_FILTERS.types.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Основной контент: Сайдбар + Сетка */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.5fr_3fr] lg:grid-cols-[1fr_3fr]">
          <aside className="">
            {/* Фильтры */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="grid gap-3 mb-4"
            >
              <h3 className="text-sm font-medium uppercase">Фильтры</h3>
              {/* Поиск */}
              <div className="relative lg:col-span-1">
                <Search
                  size={14}
                  className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                />
                <Input
                  placeholder="Поиск..."
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);
                    if (searchDebounceRef.current)
                      clearTimeout(searchDebounceRef.current);
                    searchDebounceRef.current = setTimeout(() => {
                      updateParams({ page: 1, q: value });
                    }, 300);
                  }}
                  className="pl-8 text-sm"
                />
              </div>

              {/* Жанры */}
              <CustomSelect
                label="Жанр"
                value={selectedGenre}
                onValueChange={(v) => {
                  setSelectedGenre(v);
                  updateParams({ page: 1, genre: v });
                }}
                options={genreOptions()}
                placeholder="Все жанры"
              />

              {/* Год выхода */}
              <CustomSelect
                label="Год выхода"
                value={selectedReleaseYear}
                onValueChange={(v) => {
                  setSelectedReleaseYear(v);
                  updateParams({ page: 1, year: v });
                }}
                options={releaseYearOptions(items)}
                placeholder="Год выхода"
              />

              {/* Впечатление */}
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

              {/* Рейтинг КП */}
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

              {/* Год просмотра */}
              <CustomSelect
                label="Год просмотра"
                value={selectedWatchYear}
                onValueChange={(v) => {
                  setSelectedWatchYear(v);
                  updateParams({ page: 1, watchYear: v });
                }}
                options={watchYearOptions(items)}
                placeholder="Год просмотра"
              />
            </motion.div>

            {/* Кнопка сброса фильтров */}
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Button onClick={resetFilters} size="sm" variant="outline">
                  <X size={12} />
                  Сбросить фильтры
                </Button>
              </motion.div>
            )}
          </aside>

          {/* Правая колонка с карточками */}
          <div className="space-y-6 md:space-y-2">
            {/* Сетка карточек */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="space-y-1 md:flex md:gap-2 lg:justify-between"
            >
              <h3 className="text-sm font-medium uppercase">
                Результат поиска:
              </h3>
              <Badge className="text-xs font-medium sm:text-sm rounded-sm">
                Найдено · {filteredItems.length}
              </Badge>
            </motion.div>

            {/* Сетка карточек */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.4 }}
                  >
                    <MovieCard item={item} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-20 text-center"
                >
                  <div className="text-muted-foreground">
                    {hasActiveFilters
                      ? 'По выбранным фильтрам ничего не найдено'
                      : 'Нет записей'}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Пагинация (нижняя) */}
            {filteredItems.length > pageSize && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                scrollToTop
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePageClient;
