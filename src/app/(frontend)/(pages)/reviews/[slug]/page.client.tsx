'use client';

import { FC, JSX, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ArrowLeft, Star, Minus, Plus, Type } from 'lucide-react';
import {
  Badge,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
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
  SynopsisBlock,
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
            <div className="absolute inset-0 bg-linear-to-b from-background/80 via-background/80 to-background" />
          </div>
        )}

        <div className="container relative mx-auto px-4 py-8">
          {/* Кнопка «Назад» */}
          <div className="mb-6">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
              className="inline-flex items-center gap-2 text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              Назад
            </Button>
          </div>

          {/* Заголовок + Постер */}
          <div className="grid gap-4">
            {/* <div className="flex items-start gap-4"> */}
            <div className="grid gap-2 md:gap-4 md:grid-cols-[200px_1fr]">
              {/* Миниатюра постера */}
              {posterSrc && (
                <div className="relative aspect-2/3 w-full max-w-[300px] mx-auto shrink-0 overflow-hidden rounded-sm border shadow-sm sm:block ">
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
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold tracking-tight lg:text-5xl">
                  {item.title}
                </h1>

                {item.originalTitle && (
                  <div className="flex items-center gap-2 text-muted-foreground text-lg italic lg:text-xl">
                    {item.originalTitle}

                    {/* Поделиться */}
                    <div className="max-w-max">
                      <SharedLink showText={false} buttonSize="icon" />
                    </div>
                  </div>
                )}

                {/* Метаданные: год • режиссёр • длительность */}
                <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  {item.releaseYear && <span>{item.releaseYear}</span>}
                  {item.releaseYear && item.director && (
                    <span className="opacity-40">•</span>
                  )}
                  {item.director &&
                    item.director
                      .split(',')
                      .map((d: string) => d.trim())
                      .filter(Boolean)
                      .map((d: string, i: number, arr: string[]) => (
                        <span key={d}>
                          {d}
                          {i < arr.length - 1 && ', '}
                        </span>
                      ))}
                </div>

                <AdminActions
                  editUrl={`/admin/collections/titles/${item.id}`}
                  onDelete={handleDelete}
                  isDeleting={deleteLoading === item.id}
                  title={item.title}
                  typeName="Запись"
                  classNames="!p-0 max-w-max !grid-cols-3"
                />
              </div>
            </div>

            <div className="grid gap-2">
              {/* Синопсис */}
              {item.synopsis && <SynopsisBlock synopsis={item.synopsis} />}

              {/* Тип */}
              {typeConfig && (
                <SidebarSection title="Тип">
                  <Badge className="rounded-sm px-3 py-1">
                    {typeConfig.label}
                  </Badge>
                </SidebarSection>
              )}

              {/* Рейтинг */}
              {item.kpRating && (
                <SidebarSection
                  title="Рейтинг КП"
                  contentClassName="flex items-center gap-2"
                >
                  <Badge className="inline-flex gap-1">
                    <Star size={15} className="fill-amber-400 text-amber-400" />
                    <span className="text-lg font-bold">
                      {item.kpRating.toFixed(1)}
                    </span>
                  </Badge>
                </SidebarSection>
              )}

              {/* Моя оценка */}
              {opinionConfig && OpinionIcon && (
                <SidebarSection title="Моя оценка">
                  <Badge className="inline-flex gap-1 rounded-sm px-3 py-1 transition-colors">
                    <OpinionIcon size={14} className={opinionConfig.color} />
                    <span>{opinionConfig.label}</span>
                  </Badge>
                </SidebarSection>
              )}

              {/* Дата просмота */}
              {item.watchDate && (
                <SidebarSection title="Дата просмотра">
                  <Badge className="inline-flex items-center gap-1.5 rounded-sm px-3 py-1">
                    {formatDate(item.watchDate)}
                  </Badge>
                </SidebarSection>
              )}

              {/* Жанры */}
              {item.genres && item.genres.length > 0 && (
                <SidebarSection
                  title="Жанры"
                  contentClassName="flex flex-wrap gap-1.5"
                >
                  {item.genres.map((genre: string) => (
                    <Link key={genre} href={`/reviews/genres/${genre}`}>
                      <Badge className="rounded-sm px-3 py-1 cursor-pointer transition-colors">
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
                  showKinoBd={showKinoBd}
                  onToggleKinoBd={() => setShowKinoBd((p) => !p)}
                />
              )}

              {/* Визуальные теги */}
              {item.visualTags && typeof item.visualTags === 'string' && (
                <SidebarSection
                  title="Визуальные теги"
                  contentClassName="flex flex-wrap gap-1.5"
                >
                  {item.visualTags
                    .split(',')
                    .map((tag: string) => tag.trim())
                    .filter(Boolean)
                    .map((tag: string, i: number) => (
                      <Link
                        key={`vtag-${i}-${tag}`}
                        href={`/reviews/tags/${formatSlugString(tag)}`}
                      >
                        <Badge className="rounded-sm px-3 py-1 cursor-pointer transition-colors">
                          # {tag}
                        </Badge>
                      </Link>
                    ))}
                </SidebarSection>
              )}
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

      {/* Контент: Обзор + Сайдбар */}
      <section className="container mx-auto px-4 pb-8">
        {/* Левая колонка — обзор */}
        <div className="min-w-0 pt-8">
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
                  {item.seasons.map(
                    (season: NonNullable<Title['seasons']>[number]) => {
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
                    }
                  )}
                </Accordion>
              </div>
            )}
        </div>
      </section>

      {/* Плавающая кнопка размера шрифта */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {showFontControls && (
          <div className="flex items-center gap-1 rounded-full border bg-background/95 backdrop-blur-sm px-2 py-1.5 shadow-lg">
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
          </div>
        )}

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
