'use client';

import { FC, JSX, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  ArrowLeft,
  CalendarDays,
  Minus,
  Plus,
  Star,
  Type,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
} from '@/components/ui';

import { OPINION_CONFIG, TYPE_CONFIG } from '@/lib/constants';
import type { Title } from '@/payload-types';
import {
  formatDate,
  formatSlugString,
  getGenreLabel,
  getPosterUrl,
} from '@/lib/utils';
import {
  AdminActions,
  ExternalLinks,
  KinoBdContainer,
  RichText,
  SharedLink,
  SidebarSection,
} from '@/components/shared';
import { useDelete } from '@/hooks/useDelete';

// Описание типов пропсов
type ReviewDetailClientProps = {
  item: Title;
};

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
  const [showKinoBd, setShowKinoBd] = useState(false);

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
  const TypeIcon = typeConfig?.icon;

  const directors = useMemo(
    () =>
      item.director
        ?.split(',')
        .map((director: string) => director.trim())
        .filter(Boolean) ?? [],
    [item.director]
  );

  const visualTags = useMemo(
    () =>
      typeof item.visualTags === 'string'
        ? item.visualTags
            .split(',')
            .map((tag: string) => tag.trim())
            .filter(Boolean)
        : [],
    [item.visualTags]
  );

  const hasSeasonBreakdown =
    (item.type === 'series' || item.type === 'cartoon') &&
    Boolean(item.seasons?.length);

  /**
   * Обработчик удаления фильма
   */
  const handleDelete = () => {
    deleteRecord(item.id, {
      url: '/api/titles',
      successMessage: 'Запись удалена',
      errorMessage: 'Ошибка при удалении',
    });
  };

  return (
    <article className="relative border-t border-border/60 bg-gradient-to-b from-white via-zinc-50/55 to-white dark:from-zinc-950 dark:via-zinc-950 dark:to-black">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.15),transparent_55%),radial-gradient(circle_at_85%_15%,rgba(8,145,178,0.16),transparent_45%)] dark:bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.18),transparent_52%),radial-gradient(circle_at_90%_10%,rgba(56,189,248,0.2),transparent_45%)]" />

      <section className="relative overflow-hidden border-b border-border/60">
        {/* Фоновый постер (размытый) */}
        {posterSrc && (
          <div className="absolute inset-0">
            <Image
              src={posterSrc}
              alt={item.title}
              fill
              className="scale-110 object-cover opacity-35 blur-xl"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-b from-background/70 via-background/85 to-background" />
          </div>
        )}

        <div className="container relative mx-auto px-4 py-8 lg:py-10">
          {/* Кнопка «Назад» */}
          <div className="mb-6">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border/60 bg-background/70 text-sm shadow-sm backdrop-blur-sm transition-colors hover:bg-muted/70"
            >
              <ArrowLeft size={16} />
              Назад
            </Button>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-card/95 p-4 shadow-xl shadow-zinc-900/10 backdrop-blur supports-[backdrop-filter]:bg-card/70 dark:border-zinc-800/70 dark:bg-zinc-950/80 dark:shadow-black/35 sm:p-6 lg:p-8">
            <div className="pointer-events-none absolute -right-16 -bottom-24 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl dark:bg-fuchsia-500/20" />
            <div className="pointer-events-none absolute -left-12 -top-16 h-48 w-48 rounded-full bg-cyan-300/15 blur-3xl dark:bg-sky-500/20" />

            {/* Заголовок + Постер */}
            <div className="relative z-10 grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
              {/* Миниатюра постера */}
              {posterSrc && (
                <div className="relative mx-auto aspect-2/3 w-full max-w-[260px] shrink-0 overflow-hidden rounded-2xl border border-zinc-300/70 shadow-lg shadow-zinc-900/20 dark:border-zinc-700/80">
                  <Image
                    src={posterSrc}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 240px, 220px"
                  />
                </div>
              )}
              {!posterSrc && (
                <div className="mx-auto flex aspect-2/3 w-full max-w-[260px] shrink-0 items-center justify-center rounded-2xl border border-dashed border-zinc-300/70 bg-zinc-100/80 dark:border-zinc-700 dark:bg-zinc-900/70">
                  <p className="text-muted-foreground px-4 text-center text-sm">
                    Постер не загружен
                  </p>
                </div>
              )}

              {/* Текстовый блок */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                    Детальный пересказ
                  </p>
                  <h1 className="text-3xl font-semibold leading-tight tracking-tight lg:text-5xl">
                    {item.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {item.originalTitle && (
                      <p className="text-muted-foreground text-base italic sm:text-lg">
                        {item.originalTitle}
                      </p>
                    )}
                    <SharedLink
                      className="max-w-max"
                      showText
                      buttonVariant="outline"
                    />
                  </div>
                </div>

                {/* Метаданные: год • режиссёр */}
                <div className="text-muted-foreground flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm">
                  {item.releaseYear && <span>{item.releaseYear}</span>}
                  {item.releaseYear && directors.length > 0 && (
                    <span className="opacity-40">•</span>
                  )}
                  {directors.map((director: string, index: number) => (
                    <span key={`${director}-${index}`}>
                      {director}
                      {index < directors.length - 1 && ', '}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Тип */}
                  {typeConfig && (
                    <Badge
                      variant="secondary"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-xs sm:text-sm dark:bg-zinc-900/80"
                    >
                      {TypeIcon && <TypeIcon size={14} className={typeConfig.color} />}
                      {typeConfig.label}
                    </Badge>
                  )}

                  {/* Рейтинг */}
                  {typeof item.kpRating === 'number' && (
                    <Badge className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-amber-900 dark:text-amber-300">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{item.kpRating.toFixed(1)}</span>
                    </Badge>
                  )}

                  {/* Моя оценка */}
                  {opinionConfig && OpinionIcon && (
                    <Badge
                      variant="outline"
                      className="inline-flex items-center gap-1.5 rounded-full border-border/70 bg-background/70 px-3 py-1 dark:bg-zinc-900/70"
                    >
                      <OpinionIcon size={14} className={opinionConfig.color} />
                      <span>{opinionConfig.label}</span>
                    </Badge>
                  )}

                  {/* Дата просмотра */}
                  {item.watchDate && (
                    <Badge
                      variant="outline"
                      className="inline-flex items-center gap-1.5 rounded-full border-border/70 bg-background/70 px-3 py-1 dark:bg-zinc-900/70"
                    >
                      <CalendarDays size={14} />
                      <span>{formatDate(item.watchDate)}</span>
                    </Badge>
                  )}
                </div>

                {/* Синопсис */}
                {item.synopsis && (
                  <div className="rounded-2xl border border-zinc-200/80 bg-background/75 p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/70">
                    <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                      Краткое описание
                    </p>
                    <p className="mt-2 text-sm leading-relaxed sm:text-base">
                      {item.synopsis}
                    </p>
                  </div>
                )}

                <div className="max-w-max rounded-2xl border border-zinc-200/80 bg-background/75 p-1 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/70">
                  <AdminActions
                    editUrl={`/admin/collections/titles/${item.id}`}
                    onDelete={handleDelete}
                    isDeleting={deleteLoading === item.id}
                    title={item.title}
                    typeName="Запись"
                    classNames="!grid-cols-3 !p-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KinoBD плеер (по KinopoiskId) */}
      {showKinoBd && item.kinopoiskId && (
        <KinoBdContainer
          kinopoiskId={String(item.kinopoiskId)}
          onClose={() => setShowKinoBd(false)}
        />
      )}

      {/* Контент: обзор + сайдбар */}
      <section className="container mx-auto px-4 py-8 lg:py-10">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* Левая колонка — обзор */}
          <div className="min-w-0 space-y-5">
            <div className="rounded-2xl border border-zinc-200/80 bg-card/90 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70 dark:border-zinc-800/80 dark:bg-zinc-950/75 dark:shadow-black/30 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                    Основной текст
                  </p>
                  <h2 className="text-xl font-semibold sm:text-2xl">Обзор</h2>
                </div>
                <Badge
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-xs dark:bg-zinc-900 dark:text-zinc-100"
                >
                  Размер: {PROSE_SIZES[sizeIndex].label}
                </Badge>
              </div>

              {item.review ? (
                <RichText
                  content={item.review}
                  className={`prose prose-zinc ${proseSize} prose-hr:my-4 prose-headings:mb-3 prose-headings:mt-6 prose-headings:font-bold prose-headings:uppercase prose-li:my-0.5 prose-p:my-2 prose-p:text-justify prose-p:leading-relaxed dark:prose-invert max-w-none`}
                />
              ) : (
                <p className="text-muted-foreground text-sm">
                  Текст обзора пока не добавлен.
                </p>
              )}
            </div>

            {/* Обзоры по сезонам (для сериалов и мультфильмов) */}
            {hasSeasonBreakdown && (
              <div className="rounded-2xl border border-zinc-200/80 bg-card/90 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70 dark:border-zinc-800/80 dark:bg-zinc-950/75 dark:shadow-black/30 sm:p-6">
                <div className="mb-3 space-y-1">
                  <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                    Эпизодная структура
                  </p>
                  <h2 className="text-xl font-semibold sm:text-2xl">
                    Подробный пересказ
                  </h2>
                </div>
                <Accordion type="multiple" className="w-full">
                  {item.seasons?.map(
                    (season: NonNullable<Title['seasons']>[number]) => {
                      const seasonOpinion = season.personalOpinion
                        ? OPINION_CONFIG[season.personalOpinion]
                        : null;
                      const SeasonOpinionIcon = seasonOpinion?.icon;

                      return (
                        <AccordionItem
                          key={season.id ?? season.seasonNumber}
                          value={`season-${season.seasonNumber}`}
                          className="border-border/70"
                        >
                          <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span>Сезон {season.seasonNumber}</span>
                              {SeasonOpinionIcon && seasonOpinion && (
                                <Badge
                                  variant="secondary"
                                  className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-0.5 text-xs dark:bg-zinc-900/80"
                                >
                                  <SeasonOpinionIcon
                                    size={13}
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
                                className={`prose prose-zinc ${proseSize} prose-headings:my-2 prose-hr:my-4 prose-li:my-0.5 prose-p:my-2 prose-p:text-justify prose-p:leading-relaxed dark:prose-invert max-w-none`}
                              />
                            ) : (
                              <p className="text-muted-foreground text-sm">
                                Обзор сезона пока не добавлен.
                              </p>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    }
                  )}
                </Accordion>
              </div>
            )}
          </div>

          {/* Правая колонка */}
          <aside className="xl:sticky xl:top-20 xl:h-fit">
            <div className="space-y-4 rounded-2xl border border-zinc-200/80 bg-card/90 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70 dark:border-zinc-800/80 dark:bg-zinc-950/75 dark:shadow-black/30 sm:p-5">
              <div>
                <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                  Метаданные
                </p>
                <h3 className="text-lg font-semibold">Навигация по записи</h3>
              </div>

              {(item.releaseYear || directors.length > 0) && (
                <div className="rounded-xl border border-zinc-200/80 bg-background/70 p-3 dark:border-zinc-800 dark:bg-zinc-950/70">
                  <div className="grid gap-2 text-sm">
                    {item.releaseYear && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Год выхода</span>
                        <span className="font-medium">{item.releaseYear}</span>
                      </div>
                    )}
                    {directors.length > 0 && (
                      <div className="grid gap-1">
                        <span className="text-muted-foreground">Режиссёр</span>
                        <span className="font-medium">{directors.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Жанры */}
              {item.genres && item.genres.length > 0 && (
                <SidebarSection
                  title="Жанры"
                  contentClassName="flex flex-wrap gap-1.5"
                >
                  {item.genres.map((genre: string) => (
                    <Link key={genre} href={`/reviews/genres/${genre}`}>
                      <Badge
                        variant="outline"
                        className="cursor-pointer rounded-full border-zinc-300/90 bg-white/80 px-3 py-1 text-xs transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900/70 dark:hover:bg-zinc-800/90"
                      >
                        {getGenreLabel(genre)}
                      </Badge>
                    </Link>
                  ))}
                </SidebarSection>
              )}

              {/* Ссылки */}
              {item.kinopoiskId && (
                <ExternalLinks
                  kinopoiskId={item.kinopoiskId}
                  originalTitle={item.originalTitle}
                  variant="secondary"
                  showKinoBd={showKinoBd}
                  onToggleKinoBd={() => setShowKinoBd((prev) => !prev)}
                />
              )}

              {/* Визуальные теги */}
              {visualTags.length > 0 && (
                <SidebarSection
                  title="Визуальные теги"
                  contentClassName="flex flex-wrap gap-1.5"
                >
                  {visualTags.map((tag: string, index: number) => (
                    <Link
                      key={`vtag-${index}-${tag}`}
                      href={`/reviews/tags/${formatSlugString(tag)}`}
                    >
                      <Badge
                        variant="outline"
                        className="cursor-pointer rounded-full border-zinc-300/90 bg-white/80 px-3 py-1 text-xs transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900/70 dark:hover:bg-zinc-800/90"
                      >
                        #{tag}
                      </Badge>
                    </Link>
                  ))}
                </SidebarSection>
              )}

              {!item.kinopoiskId &&
                (!item.genres || item.genres.length === 0) &&
                visualTags.length === 0 && (
                  <p className="text-muted-foreground rounded-xl border border-dashed border-zinc-300/70 bg-white/70 px-3 py-4 text-sm dark:border-zinc-800 dark:bg-zinc-950/65">
                    Дополнительные данные для этой записи пока не заполнены.
                  </p>
                )}
            </div>
          </aside>
        </div>
      </section>

      {/* Плавающая кнопка размера шрифта */}
      <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
        {showFontControls && (
          <div className="flex items-center gap-1 rounded-2xl border border-zinc-200/80 bg-background/95 px-2 py-1.5 shadow-lg backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/85">
            <button
              onClick={() => changeFontSize(-1)}
              disabled={sizeIndex <= 0}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
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
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
              title="Увеличить шрифт"
            >
              <Plus size={14} />
            </button>
          </div>
        )}

        <button
          onClick={() => setShowFontControls((prev) => !prev)}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-zinc-200/80 bg-background/95 shadow-lg backdrop-blur-sm transition-colors hover:bg-muted dark:border-zinc-800/80 dark:bg-zinc-950/85"
          title="Размер шрифта"
        >
          <Type size={18} />
        </button>
      </div>
    </article>
  );
};

export default ReviewDetailClient;
