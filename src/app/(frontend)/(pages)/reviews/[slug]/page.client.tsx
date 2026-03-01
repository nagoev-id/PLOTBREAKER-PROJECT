'use client';

import { FC, JSX, useEffect, useState, lazy, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Clock,
  ExternalLink,
  Play,
  Minus,
  Plus,
  Type,
} from 'lucide-react';
import {
  Badge,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from '@/components/ui';

import { OPINION_CONFIG, TYPE_CONFIG } from '@/utilities/constants';
import { MediaContentCollection } from '@/utilities/types';
import {
  cn,
  formatDate,
  formatDuration,
  formatSlugString,
  getGenreLabel,
  getPosterUrl,
} from '@/utilities/utils';
import { AdminActions, RichText, SharedLink } from '@/components/shared';
import { useDelete } from '@/hooks/useDelete';

const VideoPlayer = lazy(() => import('@/components/shared/VideoPlayer'));

// Описание типов пропсов
type ReviewDetailClientProps = {
  item: MediaContentCollection;
};

/**
 * Компонент секции сайдбара
 *
 * @param title - Заголовок секции
 * @param children - Дочерние элементы секции
 * @param contentClassName - Классы для контента секции
 * @returns Секция сайдбара
 */
const SidebarSection: FC<{
  title: string;
  children: React.ReactNode;
  contentClassName?: string;
}> = ({ title, children, contentClassName }): JSX.Element => (
  <div className="space-y-1.5">
    <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
      {title}
    </span>
    <div className={contentClassName}>{children}</div>
  </div>
);

/**
 * Компонент блока с кратким описанием
 *
 * @param synopsis - Краткое описание
 * @param className - Дополнительные классы
 * @returns Блок с кратким описанием
 */
const SynopsisBlock: FC<{ synopsis: string; className?: string }> = ({
  synopsis,
  className,
}): JSX.Element => (
  <div className={cn('space-y-2', className)}>
    <h3 className="text-xl font-bold uppercase">Краткое описание</h3>
    <p className="text-muted-foreground text-base leading-relaxed lg:text-lg">
      {synopsis}
    </p>
  </div>
);

// Размеры prose: класс Tailwind Typography + подпись для UI
const PROSE_SIZES = [
  { cls: 'prose-sm', label: 'S' },
  { cls: 'prose-base', label: 'M' },
  { cls: 'prose-lg', label: 'L' },
  { cls: 'prose-xl', label: 'XL' },
  { cls: 'prose-2xl', label: '2XL' },
] as const;

/**
 * Клиентский компонент детальной страницы записи.
 * Hero-секция, контент обзора и сайдбар с метаданными.
 * @param item - Запись медиа-контента
 * @returns {JSX.Element | null}
 */
const ReviewDetailClient: FC<ReviewDetailClientProps> = ({
  item,
}): JSX.Element | null => {
  const router = useRouter();
  const { deleteRecord, deleteLoading } = useDelete();
  const [showFontControls, setShowFontControls] = useState(false);
  const [sizeIndex, setSizeIndex] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem('review_prose_size');
    if (saved) {
      const idx = Number(saved);
      if (idx >= 0 && idx < PROSE_SIZES.length) setSizeIndex(idx);
    }
  }, []);

  /**
   * Изменяет размер шрифта в тексте обзора
   * @param delta - Разница в индексе размера
   */
  const changeFontSize = (delta: number) => {
    setSizeIndex((prev) => {
      const next = Math.min(PROSE_SIZES.length - 1, Math.max(0, prev + delta));
      localStorage.setItem('review_prose_size', String(next));
      return next;
    });
  };

  const proseSize = PROSE_SIZES[sizeIndex].cls;

  const posterSrc = getPosterUrl(item);
  const opinionConfig = item.personalOpinion
    ? OPINION_CONFIG[item.personalOpinion]
    : null;
  const OpinionIcon = opinionConfig?.icon;
  const typeConfig = TYPE_CONFIG[item.type];

  /**
   * Обработчик удаления фильма
   */
  const handleDelete = () => {
    deleteRecord(item.id, {
      url: '/api/media-contents',
      successMessage: 'Запись удалена',
      errorMessage: 'Ошибка при удалении',
    });
  };

  return (
    <article>
      <section className="relative overflow-hidden border-b">
        {/* Фоновый постер (размытый) */}
        {posterSrc && (
          <div className="absolute inset-0">
            <Image
              src={posterSrc}
              alt={item.title}
              fill
              className="object-cover blur-xl scale-110"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          </div>
        )}

        <div className="container relative mx-auto px-4 py-8">
          {/* Кнопка «Назад» */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
              className="inline-flex items-center gap-2 text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              Назад
            </Button>
          </motion.div>

          {/* Заголовок + Постер */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid gap-4"
          >
            <div className="flex items-start gap-4">
              {/* Миниатюра постера */}
              {posterSrc && (
                <div className="relative  aspect-[2/3] w-[120px] xl:w-[270px] shrink-0 overflow-hidden rounded-sm border shadow-sm sm:block lg:w-[150px]">
                  <Image
                    src={posterSrc}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />
                </div>
              )}

              {/* Текстовый блок */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight lg:text-5xl">
                    {item.title}
                  </h1>

                  <AdminActions
                    editUrl={`/admin/collections/media-contents/${item.id}`}
                    onDelete={handleDelete}
                    isDeleting={deleteLoading === item.id}
                    title={item.title}
                    typeName="Запись"
                    classNames="!p-0 max-w-max !grid-cols-2"
                  />
                </div>

                {item.originalTitle && (
                  <p className="text-muted-foreground text-lg italic lg:text-xl">
                    {item.originalTitle}
                  </p>
                )}

                {/* Метаданные: год • режиссёр • длительность */}
                <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 text-sm">
                  {item.releaseYear && <span>{item.releaseYear}</span>}
                  {item.releaseYear && item.director && (
                    <span className="opacity-40">•</span>
                  )}
                  {item.director && <span>{item.director}</span>}
                  {(item.releaseYear || item.director) && item.duration && (
                    <span className="opacity-40">•</span>
                  )}
                  {item.duration && (
                    <span>{formatDuration(item.duration)}</span>
                  )}
                </div>
                {/* Синопсис */}
                {item.synopsis && (
                  <SynopsisBlock
                    synopsis={item.synopsis}
                    className="hidden lg:block"
                  />
                )}
              </div>
            </div>

            {/* Синопсис */}
            {item.synopsis && (
              <SynopsisBlock synopsis={item.synopsis} className="lg:hidden" />
            )}
          </motion.div>
        </div>
      </section>

      {/* Плеер HDRezka (только если указан URL) */}
      {item.hdrezkaUrl && (
        <section className="container mx-auto px-4 pt-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              </div>
            }
          >
            <VideoPlayer
              hdrezkaUrl={item.hdrezkaUrl}
              title={item.title}
              type={item.type}
            />
          </Suspense>
        </section>
      )}

      {/* Контент: Обзор + Сайдбар */}
      <section className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:items-start gap-6 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px]">
          {/* Левая колонка — обзор */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="min-w-0 pt-8"
          >
            {item.review && (
              <RichText
                content={item.review}
                className={`prose-hr:my-4 prose ${proseSize} prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-headings:uppercase prose-h2:mt-6 prose-h2:mb-2 prose-p:leading-relaxed prose-p:text-justify prose-p:my-2 prose-li:my-0.5`}
              />
            )}

            {/* Обзоры по сезонам (для сериалов и мультфильмов) */}
            {(item.type === 'series' || item.type === 'cartoon') &&
              item.seasons &&
              item.seasons.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-xl font-bold uppercase">
                    Подробный пересказ
                  </h2>
                  <Accordion type="multiple" className="w-full">
                    {item.seasons.map((season) => {
                      const seasonOpinion = season.personalOpinion
                        ? OPINION_CONFIG[season.personalOpinion]
                        : null;
                      const SeasonOpinionIcon = seasonOpinion?.icon;

                      return (
                        <AccordionItem
                          key={season.id ?? season.seasonNumber}
                          value={`season-${season.seasonNumber}`}
                        >
                          <AccordionTrigger className="text-base font-semibold hover:no-underline">
                            <div className="flex items-center gap-3">
                              <span className="sm:text-base">
                                Сезон {season.seasonNumber}
                              </span>
                              {SeasonOpinionIcon && seasonOpinion && (
                                <Badge
                                  variant="secondary"
                                  className="inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs sm:text-sm border border-muted-foreground/50"
                                >
                                  <SeasonOpinionIcon
                                    size={14}
                                    className={seasonOpinion.color}
                                  />
                                  {seasonOpinion.label}
                                </Badge>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            {season.review ? (
                              <RichText
                                content={season.review}
                                className={`prose ${proseSize} prose-zinc dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-justify prose-p:my-2 prose-headings:my-2 prose-li:my-0.5 prose-hr:my-4`}
                              />
                            ) : (
                              <p className="text-muted-foreground text-sm">
                                Обзор пока не добавлен
                              </p>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              )}
          </motion.div>

          {/* Правая колонка — сайдбар */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-4 lg:border-l lg:border-b lg:border-r lg:pb-4 lg:border-gray-200 lg:dark:border-gray-800 lg:px-4 lg:pt-8 lg:sticky lg:top-[55px]"
          >
            {/* Рейтинг */}
            {item.kpRating && (
              <SidebarSection
                title="Рейтинг"
                contentClassName="flex items-center gap-2"
              >
                <Star size={20} className="fill-amber-400 text-amber-400" />
                <span className="text-2xl font-bold">
                  {item.kpRating.toFixed(1)}
                </span>
                <span className="text-muted-foreground text-sm">/10</span>
              </SidebarSection>
            )}

            {/* Моя оценка */}
            {opinionConfig && OpinionIcon && (
              <SidebarSection title="Моя оценка">
                <Badge
                  variant="secondary"
                  className="inline-flex items-center gap-1.5 rounded-sm px-3 py-1"
                >
                  <OpinionIcon size={14} className={opinionConfig.color} />
                  {opinionConfig.label}
                </Badge>
              </SidebarSection>
            )}

            {item.watchDate && (
              <SidebarSection title="Дата просмотра">
                <Badge
                  variant="secondary"
                  className="inline-flex items-center gap-1.5 rounded-sm px-3 py-1"
                >
                  {formatDate(item.watchDate)}
                </Badge>
              </SidebarSection>
            )}

            {/* Тип */}
            {typeConfig && (
              <SidebarSection title="Тип">
                <Badge variant="secondary" className="rounded-sm px-3 py-1">
                  {typeConfig.label}
                </Badge>
              </SidebarSection>
            )}

            {/* Режиссёр */}
            {item.director && (
              <SidebarSection title="Режиссёр">
                <Badge variant="secondary" className="rounded-sm px-3 py-1">
                  {item.director}
                </Badge>
              </SidebarSection>
            )}

            {/* Жанры */}
            {item.genres && item.genres.length > 0 && (
              <SidebarSection
                title="Жанры"
                contentClassName="flex flex-wrap gap-1.5"
              >
                {item.genres.map((genre) => (
                  <Link key={genre} href={`/reviews/genres/${genre}`}>
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-3 py-1 cursor-pointer hover:bg-accent transition-colors"
                    >
                      {getGenreLabel(genre)}
                    </Badge>
                  </Link>
                ))}
              </SidebarSection>
            )}

            {/* Визуальные теги */}
            {item.visualTags && typeof item.visualTags === 'string' && (
              <SidebarSection
                title="Визуальные теги"
                contentClassName="flex flex-wrap gap-1.5"
              >
                {item.visualTags
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter(Boolean)
                  .map((tag, i) => (
                    <Link
                      key={`vtag-${i}-${tag}`}
                      href={`/reviews/tags/${formatSlugString(tag)}`}
                    >
                      <Badge
                        variant="secondary"
                        className="rounded-sm px-3 py-1 cursor-pointer hover:bg-accent transition-colors"
                      >
                        #{tag}
                      </Badge>
                    </Link>
                  ))}
              </SidebarSection>
            )}

            {/* Длительность */}
            {item.duration && (
              <SidebarSection
                title="Длительность"
                contentClassName="flex items-center gap-1.5 text-sm"
              >
                <Clock size={14} className="text-muted-foreground" />
                {formatDuration(item.duration)}
              </SidebarSection>
            )}

            {/* Ссылки */}
            {item.kinopoiskId && (
              <SidebarSection
                title="Ссылки"
                contentClassName="flex flex-wrap gap-1.5"
              >
                <Link
                  href={`https://www.kinopoisk.ru/film/${item.kinopoiskId}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Badge
                    variant="secondary"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-3 py-1 transition-colors hover:bg-accent"
                  >
                    <ExternalLink size={12} />
                    Кинопоиск
                  </Badge>
                </Link>

                {item.kinoriumId && (
                  <Link
                    href={`https://kinorium.com/${item.kinoriumId}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Badge
                      variant="secondary"
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-3 py-1 transition-colors hover:bg-accent"
                    >
                      <ExternalLink size={12} />
                      Кинориум
                    </Badge>
                  </Link>
                )}

                <Link
                  href={`https://www.kinopoisk.cx/film/${item.kinopoiskId}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Badge
                    variant="secondary"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-3 py-1 transition-colors hover:bg-accent"
                  >
                    <Play size={12} />
                    FRKP
                  </Badge>
                </Link>

                <Link
                  href={`https://flymaterez.net/search/?do=search&subaction=search&q=${item.originalTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Badge
                    variant="secondary"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-3 py-1 transition-colors hover:bg-accent"
                  >
                    <Play size={12} />
                    HDRezka
                  </Badge>
                </Link>
              </SidebarSection>
            )}

            {/* Поделиться */}
            <SharedLink />
          </motion.aside>
        </div>
      </section>

      {/* Плавающая кнопка размера шрифта */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {showFontControls && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1 rounded-full border bg-background/95 backdrop-blur-sm px-2 py-1.5 shadow-lg"
            >
              <button
                onClick={() => changeFontSize(-1)}
                disabled={sizeIndex <= 0}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-30 cursor-pointer"
                title="Уменьшить шрифт"
              >
                <Minus size={14} />
              </button>
              <span className="min-w-[36px] text-center text-xs font-medium tabular-nums">
                {PROSE_SIZES[sizeIndex].label}
              </span>
              <button
                onClick={() => changeFontSize(1)}
                disabled={sizeIndex >= PROSE_SIZES.length - 1}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-30 cursor-pointer"
                title="Увеличить шрифт"
              >
                <Plus size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowFontControls((prev) => !prev)}
          className="flex h-11 w-11 items-center justify-center rounded-full border bg-background/95 backdrop-blur-sm shadow-lg transition-colors hover:bg-muted cursor-pointer"
          title="Размер шрифта"
        >
          <Type size={18} />
        </button>
      </div>
    </article>
  );
};

export default ReviewDetailClient;
