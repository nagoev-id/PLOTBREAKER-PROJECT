'use client';

import { FC, JSX, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  CircleSlash,
  Clapperboard,
  Eye,
  Film,
  MessageSquareText,
  Star,
  Timer,
  Tv2,
  type LucideIcon,
} from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { toast } from 'sonner';
import axios from 'axios';

import { OPINION_CONFIG } from '@/lib/constants';
import { cn, getGenreLabel, getPosterUrl } from '@/lib/utils';
import { formatSlug } from '@/payload/utilities/utils';
import type { Title } from '@/payload-types';
import { AdminActions } from '@/components/shared';
import { useAuth } from '@/components/context';

type Props = {
  item: Title;
  priority?: boolean;
};

const TYPE_META: Record<
  Title['type'],
  {
    label: string;
    Icon: LucideIcon;
    className: string;
    placeholderGradient: string;
  }
> = {
  film: {
    label: 'Фильм',
    Icon: Film,
    className: 'border-sky-500/40 bg-sky-500/20 text-sky-100',
    placeholderGradient: 'from-sky-700 to-sky-950',
  },
  series: {
    label: 'Сериал',
    Icon: Tv2,
    className: 'border-violet-500/40 bg-violet-500/20 text-violet-100',
    placeholderGradient: 'from-violet-700 to-violet-950',
  },
  cartoon: {
    label: 'Мультфильм',
    Icon: Clapperboard,
    className: 'border-rose-500/40 bg-rose-500/20 text-rose-100',
    placeholderGradient: 'from-rose-700 to-rose-950',
  },
};

/**
 * Проверяет, содержит ли Lexical rich text поле реальный контент
 */
const hasRichTextContent = (field?: Title['review'] | null): boolean => {
  if (!field?.root?.children) return false;
  return field.root.children.some((child) => {
    if (child.type !== 'paragraph') return true;
    const childNode = child as Record<string, unknown>;
    const nested = childNode.children;
    if (!Array.isArray(nested) || nested.length === 0) return false;
    return nested.some(
      (c: Record<string, unknown>) =>
        typeof c.text === 'string' && c.text.trim().length > 0
    );
  });
};

/**
 * Компонент карточки фильма
 * @param item - объект фильма
 * @returns {JSX.Element}
 */
export const MovieCard: FC<Props> = ({
  item,
  priority = false,
}): JSX.Element => {
  const { user } = useAuth();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const posterSrc = getPosterUrl(item);
  const isPlanned = item.status === 'planned';
  const reviewHref = item.slug ? `/reviews/${item.slug}` : undefined;
  const typeMeta = TYPE_META[item.type];

  const hasReview =
    item.isPublished &&
    (hasRichTextContent(item.review) ||
      item.seasons?.some((s) => hasRichTextContent(s.review)));

  const opinionConfig = item.personalOpinion
    ? OPINION_CONFIG[item.personalOpinion]
    : null;
  const OpinionIcon = opinionConfig?.icon;
  const StatusIcon = isPlanned
    ? Timer
    : item.status === 'watching'
      ? Eye
      : item.status === 'abandoned'
        ? CircleSlash
        : OpinionIcon;
  const statusLabel = isPlanned
    ? 'Планирую'
    : item.status === 'watching'
      ? 'Смотрю'
      : item.status === 'abandoned'
        ? 'Брошено'
        : opinionConfig?.label;
  const statusClassName = isPlanned
    ? 'border border-sky-500/35 bg-sky-500/12 text-sky-200'
    : item.status === 'watching'
      ? 'border border-emerald-500/35 bg-emerald-500/12 text-emerald-200'
      : item.status === 'abandoned'
        ? 'border border-zinc-500/45 bg-zinc-500/12 text-zinc-200'
        : 'border border-border/75 bg-background/75 text-foreground/90';
  const statusIconClassName =
    isPlanned || item.status === 'watching' || item.status === 'abandoned'
      ? 'text-white'
      : opinionConfig?.color || 'text-white';

  /**
   * Обработчик удаления фильма
   */
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const {
        data: { success },
      } = await axios.delete(`/api/titles/${item.id}`);

      if (!success) {
        throw new Error('Failed to delete');
      }

      toast.success('Запись удалена');
      router.back();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Ошибка при удалении');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative h-full">
      <Card className="group/card relative flex h-full flex-col overflow-hidden rounded-none border border-border bg-background/30 shadow-none transition-all duration-300 hover:border-foreground/30 hover:bg-background/60">
        <div className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
          <div className="absolute inset-x-0 top-0 h-14 bg-linear-to-b from-foreground/4 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-foreground/6 to-transparent" />
        </div>

        {/* Постер с overlay-бейджами */}
        <div className="relative z-20 aspect-2/3 w-full overflow-hidden border-b border-border/70 bg-zinc-200 dark:bg-zinc-900">
          {user && (
            <AdminActions
              editUrl={`/admin/collections/titles/${item.id}`}
              onDelete={handleDelete}
              isDeleting={isDeleting}
              title={item.title}
              typeName="Запись"
              classNames="absolute top-1.5 left-1.5 z-30"
            />
          )}

          {reviewHref ? (
            <Link
              href={reviewHref}
              className="relative flex h-full w-full flex-1 flex-col"
            >
              {posterSrc ? (
                <>
                  <Image
                    src={posterSrc}
                    alt={item.title}
                    fill
                    priority={priority}
                    className={cn(
                      'object-cover transition-transform duration-500 group-hover/card:scale-[1.03]',
                      isPlanned && 'grayscale-[0.35] saturate-[0.85]'
                    )}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/15 to-transparent opacity-85 transition-opacity duration-300 group-hover/card:opacity-95" />
                </>
              ) : (
                <div
                  className={cn(
                    'absolute inset-0 bg-linear-to-br',
                    typeMeta.placeholderGradient
                  )}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.24),transparent_50%)]" />
                  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-white/90">
                    <typeMeta.Icon className="size-8" />
                    <p className="text-xs font-semibold tracking-[0.14em] uppercase">
                      Постер в обработке
                    </p>
                  </div>
                </div>
              )}
            </Link>
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-zinc-700 to-zinc-900" />
          )}

          <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1.5">
            {item.kpRating && (
              <div className="inline-flex items-center gap-1 rounded-full border border-black/5 bg-white/95 px-2 py-0.5 text-[11px] font-bold text-black shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-black/80 dark:text-white">
                <Star size={11} className="fill-amber-500 text-amber-500" />
                {item.kpRating.toFixed(1)}
              </div>
            )}

            {StatusIcon && statusLabel && (
              <div className="inline-flex items-center gap-1 rounded-full border border-black/5 bg-white/95 px-2 py-0.5 text-[11px] font-bold text-black shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-black/80 dark:text-white">
                <StatusIcon
                  className={cn(
                    'size-3',
                    opinionConfig?.color ||
                      (isPlanned
                        ? 'text-sky-500'
                        : item.status === 'watching'
                          ? 'text-emerald-500'
                          : 'text-zinc-500')
                  )}
                />
                <span>{statusLabel}</span>
              </div>
            )}
          </div>

          <div className="absolute bottom-2 left-2 z-20 flex flex-wrap items-center gap-1.5">
            <div
              className={cn(
                'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase backdrop-blur-md shadow-xs',
                typeMeta.className
              )}
            >
              <typeMeta.Icon className="size-3" />
              {typeMeta.label}
            </div>

            {hasReview && (
              <div className="inline-flex items-center gap-1 rounded-sm border border-emerald-500/40 bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-100 uppercase backdrop-blur-md shadow-xs">
                <MessageSquareText className="size-3" />
                Обзор
              </div>
            )}
            {item.franchise && (
              <div
                role="link"
                tabIndex={0}
                className="pointer-events-auto inline-flex cursor-pointer items-center gap-1 rounded-sm border border-orange-500/40 bg-orange-500/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-orange-100 uppercase backdrop-blur-md shadow-xs transition-colors hover:bg-orange-500/40"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/reviews/franchises/${formatSlug(item.franchise!)}`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/reviews/franchises/${formatSlug(item.franchise!)}`;
                  }
                }}
              >
                <MessageSquareText className="size-3" />
                Франшиза
              </div>
            )}
          </div>
        </div>

        {/* Контент карточки */}
        <div className="relative z-20 flex flex-1 flex-col gap-3 p-4">
          {reviewHref ? (
            <Link href={reviewHref} className="flex flex-col gap-1">
              {/* Заголовок */}
              <h3 className="line-clamp-2 text-sm font-semibold leading-tight tracking-tight md:text-base">
                {item.title}
              </h3>

              {/* Оригинальное название */}
              {item.originalTitle && (
                <p className="text-muted-foreground line-clamp-1 text-sm">
                  {item.originalTitle}
                </p>
              )}
            </Link>
          ) : (
            <div className="flex flex-col gap-1">
              <h3 className="line-clamp-2 text-sm font-semibold leading-tight md:text-base">
                {item.title}
              </h3>
              {item.originalTitle && (
                <p className="text-muted-foreground line-clamp-1 text-sm">
                  {item.originalTitle}
                </p>
              )}
            </div>
          )}

          {item.director && (
            <p className="text-muted-foreground/90 line-clamp-1 text-xs">
              Реж. {item.director}
            </p>
          )}

          {/* Жанры */}
          {item.genres && item.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.genres.slice(0, 3).map((genre: string) => (
                <Link
                  key={genre}
                  href={`/reviews/genres/${genre}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Badge
                    variant="secondary"
                    className="rounded-full border border-border/70 bg-background/45 px-2 py-0 text-[10px] font-medium text-foreground/85 transition-colors hover:bg-background/70"
                  >
                    {getGenreLabel(genre)}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Метаданные — прижаты к низу */}
          <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-muted-foreground">
            {item.releaseYear && (
              <span className="flex items-center gap-1">
                <Calendar size={12} className="opacity-65" />
                {item.releaseYear}
              </span>
            )}
            {item.watchYear && item.watchYear !== item.releaseYear && (
              <span className="flex items-center gap-1">
                <Eye size={12} className="opacity-65" />
                {item.watchYear}
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
