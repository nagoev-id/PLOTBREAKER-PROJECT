'use client';

import { FC, JSX } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, ExternalLink, Play } from 'lucide-react';
import {
  Badge,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui';

import { OPINION_CONFIG, TYPE_CONFIG } from '@/utilities/constants';
import { MediaContentCollection } from '@/utilities/types';
import { formatDuration, getGenreLabel, getPosterUrl } from '@/utilities/utils';
import { RichText, SharedLink } from '@/components/shared';

// Описание типов пропсов
type ReviewDetailClientProps = {
  item: MediaContentCollection;
};

/**
 * Клиентский компонент детальной страницы записи.
 * Hero-секция, контент обзора и сайдбар с метаданными.
 * @param item - Объект MediaContentCollection
 * @returns {JSX.Element}
 */
const ReviewDetailClient: FC<ReviewDetailClientProps> = ({
  item,
}): JSX.Element => {
  const router = useRouter();
  const posterSrc = getPosterUrl(item);
  const opinionConfig = item.personalOpinion
    ? OPINION_CONFIG[item.personalOpinion]
    : null;
  const OpinionIcon = opinionConfig?.icon;
  const typeConfig = TYPE_CONFIG[item.type];

  return (
    <article>
      <section className="relative overflow-hidden border-b">
        {/* Фоновый постер (размытый) */}
        {posterSrc && (
          <div className="absolute inset-0">
            <Image
              src={posterSrc}
              alt=""
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
            <button
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              Назад
            </button>
          </motion.div>

          {/* Заголовок + Постер */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-start gap-6"
          >
            {/* Миниатюра постера */}
            {posterSrc && (
              <div className="relative hidden aspect-[2/3] w-[120px] shrink-0 overflow-hidden rounded-sm border shadow-sm sm:block lg:w-[150px]">
                <Image
                  src={posterSrc}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="150px"
                  priority
                />
              </div>
            )}

            {/* Текстовый блок */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight lg:text-5xl">
                {item.title}
              </h1>

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
                {item.duration && <span>{formatDuration(item.duration)}</span>}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Контент: Обзор + Сайдбар */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px]">
          {/* Левая колонка — обзор */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="min-w-0"
          >
            {item.synopsis && (
              <p className="text-muted-foreground mb-8 text-base leading-relaxed lg:text-lg">
                {item.synopsis}
              </p>
            )}

            {item.review && (
              <RichText
                content={item.review}
                className="prose-hr:my-4 prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-headings:uppercase prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-2 prose-p:text-base prose-p:leading-relaxed prose-p:text-justify prose-p:my-2 prose-li:my-0.5"
              />
            )}

            {/* Обзоры по сезонам (для сериалов и мультфильмов) */}
            {(item.type === 'series' || item.type === 'cartoon') &&
              item.seasons &&
              item.seasons.length > 0 && (
                <div className="mt-10">
                  <h2 className="mb-4 text-xl font-bold uppercase">
                    Обзоры по сезонам
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
                              <span>Сезон {season.seasonNumber}</span>
                              {SeasonOpinionIcon && seasonOpinion && (
                                <Badge
                                  variant="secondary"
                                  className="inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs"
                                >
                                  <SeasonOpinionIcon
                                    size={12}
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
                                className="prose prose-zinc dark:prose-invert max-w-none prose-p:text-base prose-p:leading-relaxed prose-p:text-justify prose-p:my-2 prose-headings:my-2 prose-li:my-0.5"
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
            className="space-y-6"
          >
            {/* Рейтинг */}
            {item.kpRating && (
              <div className="space-y-1.5">
                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  Рейтинг
                </span>
                <div className="flex items-center gap-2">
                  <Star size={20} className="fill-amber-400 text-amber-400" />
                  <span className="text-2xl font-bold">
                    {item.kpRating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground text-sm">/10</span>
                </div>
              </div>
            )}

            {/* Моя оценка */}
            {opinionConfig && OpinionIcon && (
              <div className="space-y-1.5">
                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  Моя оценка
                </span>
                <div>
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-1.5 rounded-sm px-3 py-1"
                  >
                    <OpinionIcon size={14} className={opinionConfig.color} />
                    {opinionConfig.label}
                  </Badge>
                </div>
              </div>
            )}

            {/* Тип */}
            {typeConfig && (
              <div className="space-y-1.5">
                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  Тип
                </span>
                <div>
                  <Badge variant="secondary" className="rounded-sm px-3 py-1">
                    {typeConfig.label}
                  </Badge>
                </div>
              </div>
            )}

            {/* Режиссёр */}
            {item.director && (
              <div className="space-y-1.5">
                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  Режиссёр
                </span>
                <div>
                  <Badge variant="secondary" className="rounded-sm px-3 py-1">
                    {item.director}
                  </Badge>
                </div>
              </div>
            )}

            {/* Жанры */}
            {item.genres && item.genres.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  Жанры
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {item.genres.map((genre) => (
                    <Badge
                      key={genre}
                      variant="secondary"
                      className="rounded-sm px-3 py-1"
                    >
                      {getGenreLabel(genre)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Визуальные теги */}
            {item.visualTags && typeof item.visualTags === 'string' && (
              <div className="space-y-1.5">
                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  Визуальные теги
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {item.visualTags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                    .map((tag, i) => (
                      <Link
                        key={`vtag-${i}-${tag}`}
                        href={`/reviews/tags/${encodeURIComponent(tag)}`}
                      >
                        <Badge
                          variant="secondary"
                          className="rounded-sm px-3 py-1 cursor-pointer hover:bg-accent transition-colors"
                        >
                          #{tag}
                        </Badge>
                      </Link>
                    ))}
                </div>
              </div>
            )}

            {/* Длительность */}
            {item.duration && (
              <div className="space-y-1.5">
                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  Длительность
                </span>
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock size={14} className="text-muted-foreground" />
                  {formatDuration(item.duration)}
                </div>
              </div>
            )}

            {/* Ссылки */}
            {item.kinopoiskId && (
              <div className="space-y-1.5">
                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  Ссылки
                </span>
                <div className="flex flex-wrap gap-1.5">
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
                </div>
              </div>
            )}

            {/* Поделиться */}
            <SharedLink />
          </motion.aside>
        </div>
      </section>
    </article>
  );
};

export default ReviewDetailClient;
