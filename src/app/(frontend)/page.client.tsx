'use client';

import { FC, JSX, useCallback, useMemo, useState } from 'react';
import { MediaContent } from '@/payload-types';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Badge, Input, Tabs, TabsList, TabsTrigger } from '@/components/ui';
import { CustomSelect } from '@/components/shared/custom-select';
import { MovieCard } from '@/components/shared/movie-card';
import {
  GENRES,
  PAGINATION_CONFIG,
  ALL_VALUE,
  extractYears,
  matchesRating,
  HOMEPAGE_FILTERS,
} from '@/utilities/constants';
import { PaginationControls } from '@/components/shared/pagination-controls';

// Тип пропсов
type HomePageClientProps = {
  items: MediaContent[];
};

/**
 * Клиентский компонент главной страницы.
 * Отображает список медиа-контента с фильтрами, поиском и пагинацией.
 * @param items - Массив медиа-контента
 * @returns {JSX.Element}
 */
const HomePageClient: FC<HomePageClientProps> = ({ items }): JSX.Element => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState(ALL_VALUE);
  const [selectedGenre, setSelectedGenre] = useState(ALL_VALUE);
  const [selectedReleaseYear, setSelectedReleaseYear] = useState(ALL_VALUE);
  const [selectedOpinion, setSelectedOpinion] = useState(ALL_VALUE);
  const [selectedRating, setSelectedRating] = useState(ALL_VALUE);
  const [selectedWatchYear, setSelectedWatchYear] = useState(ALL_VALUE);

  const currentPage = Number(searchParams.get('page')) || 1;
  const pageSize = PAGINATION_CONFIG.pageSizeOptions.includes(
    Number(searchParams.get('size'))
  )
    ? Number(searchParams.get('size'))
    : PAGINATION_CONFIG.defaultPageSize;

  /**
   * Обновляет параметры пагинации в URL
   * @param page - Номер страницы
   * @param size - Размер страницы
   */
  const updateParams = useCallback(
    (page: number, size: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) params.delete('page');
      else params.set('page', String(page));
      if (size === PAGINATION_CONFIG.defaultPageSize) params.delete('size');
      else params.set('size', String(size));
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : '?', { scroll: false });
    },
    [router, searchParams]
  );

  /**
   * Извлекает уникальные годы из массива медиа-контента
   * @param items - Массив медиа-контента
   * @param getter - Функция для извлечения года
   * @returns {number[]} - Массив уникальных годов
   */
  const releaseYears = useMemo(
    () => extractYears(items, (i) => i.releaseYear),
    [items]
  );

  /**
   * Извлекает уникальные годы из массива медиа-контента
   * @param items - Массив медиа-контента
   * @param getter - Функция для извлечения года
   * @returns {number[]} - Массив уникальных годов
   */
  const watchYears = useMemo(
    () => extractYears(items, (i) => i.watchYear),
    [items]
  );

  /**
   * Создает массив опций для года просмотра
   * @returns {Array<{ label: string; value: string }>} - Массив опций
   */
  const watchYearOptions = useMemo(
    () => [
      { label: 'Все годы', value: ALL_VALUE },
      ...watchYears.map((y) => ({ label: String(y), value: String(y) })),
    ],
    [watchYears]
  );

  /**
   * Создает массив опций для года выхода
   * @returns {Array<{ label: string; value: string }>} - Массив опций
   */
  const releaseYearOptions = useMemo(
    () => [
      { label: 'Все годы', value: ALL_VALUE },
      ...releaseYears.map((y) => ({ label: String(y), value: String(y) })),
    ],
    [releaseYears]
  );

  /**
   * Создает массив опций для жанров
   * @returns {Array<{ label: string; value: string }>} - Массив опций
   */
  const genreOptions = useMemo(
    () => [
      { label: 'Все жанры', value: ALL_VALUE },
      ...GENRES.map((g) => ({ label: g.label, value: g.value })),
    ],
    []
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
          selectedGenre as MediaContent['genres'] extends (infer U)[] | null
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

  /**
   * Вычисляет общее количество страниц
   * @returns {number} - Общее количество страниц
   */
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
    (page: number) => updateParams(page, pageSize),
    [updateParams, pageSize]
  );

  /**
   * Обработчик смены размера страницы
   * @param newSize - Новый размер страницы
   */
  const handlePageSizeChange = useCallback(
    (newSize: number) => updateParams(1, newSize),
    [updateParams]
  );

  /**
   * Обработчик смены типа
   * @param value - Новый тип
   */
  const handleTypeChange = useCallback(
    (value: string) => {
      setActiveType(value);
      updateParams(1, pageSize);
    },
    [updateParams, pageSize]
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
    updateParams(1, PAGINATION_CONFIG.defaultPageSize);
  }, [updateParams]);

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
    selectedWatchYear !== ALL_VALUE;

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
                    setSearchQuery(e.target.value);
                    updateParams(1, pageSize);
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
                  updateParams(1, pageSize);
                }}
                options={genreOptions}
                placeholder="Все жанры"
              />

              {/* Год выхода */}
              <CustomSelect
                label="Год выхода"
                value={selectedReleaseYear}
                onValueChange={(v) => {
                  setSelectedReleaseYear(v);
                  updateParams(1, pageSize);
                }}
                options={releaseYearOptions}
                placeholder="Год выхода"
              />

              {/* Впечатление */}
              <CustomSelect
                label="Личная оценка"
                value={selectedOpinion}
                onValueChange={(v) => {
                  setSelectedOpinion(v);
                  updateParams(1, pageSize);
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
                  updateParams(1, pageSize);
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
                  updateParams(1, pageSize);
                }}
                options={watchYearOptions}
                placeholder="Год просмотра"
              />
            </motion.div>

            {/* Кнопка сброса фильтров */}
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={resetFilters}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors"
              >
                <X size={12} />
                Сбросить фильтры
              </motion.button>
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
