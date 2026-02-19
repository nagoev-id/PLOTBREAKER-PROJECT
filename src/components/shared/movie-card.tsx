import { Card } from '@/components/ui/card';
import { FC, JSX } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getGenreLabel } from '@/lib/utils';
import { Calendar, Clock, Star } from 'lucide-react';
import { MediaContent } from '@/payload-types';
import { OPINION_CONFIG } from '@/utilities/constants';
import { Badge } from '@/components/ui';

type Props = {
  item: MediaContent;
};

export const MovieCard: FC<Props> = ({ item }): JSX.Element => {
  const posterSrc =
    item.poster && typeof item.poster === 'object'
      ? item.poster.url
      : item.posterUrl;

  const opinionConfig = item.personalOpinion
    ? OPINION_CONFIG[item.personalOpinion]
    : null;
  const OpinionIcon = opinionConfig?.icon;

  return (
    <Link href={`/reviews/${item.id}`} className="block h-full">
      <Card className="group flex h-full flex-col overflow-hidden rounded-none border shadow-none transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
        {/* Постер с overlay-бейджами */}
        {posterSrc && (
          <div className="relative aspect-[2/3] w-full overflow-hidden">
            <Image
              src={posterSrc}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/5 transition-colors group-hover:bg-black/10" />

            {/* Рейтинг KP — overlay */}
            {item.kpRating && (
              <div className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded-sm bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                <Star size={10} className="fill-amber-400 text-amber-400" />
                {item.kpRating.toFixed(1)}
              </div>
            )}

            {/* Впечатление — overlay */}
            {OpinionIcon && opinionConfig && (
              <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-sm bg-black/60 px-1.5 py-0.5 backdrop-blur-sm">
                <OpinionIcon size={12} className={opinionConfig.color} />
                <span className="hidden text-[10px] text-white md:inline">
                  {opinionConfig.label}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Контент карточки */}
        <div className="flex flex-1 flex-col gap-2 p-2 md:p-3">
          {/* Заголовок */}
          <h3 className="line-clamp-2 text-xs font-medium leading-tight md:text-sm xl:text-base">
            {item.title}
          </h3>

          {/* Оригинальное название */}
          {item.originalTitle && (
            <p className="text-muted-foreground line-clamp-1 text-[11px] xl:text-xs">
              {item.originalTitle}
            </p>
          )}

          {/* Жанры */}
          {item.genres && item.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.genres.slice(0, 3).map((genre) => (
                <Badge
                  key={genre}
                  variant="default"
                  className="rounded-sm px-1.5 py-0 text-[10px] font-normal"
                >
                  {getGenreLabel(genre)}
                </Badge>
              ))}
            </div>
          )}

          {/* Метаданные — прижаты к низу */}
          <div className="mt-auto flex items-center gap-2 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            {item.releaseYear && (
              <span className="flex items-center gap-1">
                <Calendar size={11} className="opacity-60" />
                {item.releaseYear}
              </span>
            )}
            {item.duration && (
              <span className="flex items-center gap-1">
                <Clock size={11} className="opacity-60" />
                {item.duration} мин
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};
