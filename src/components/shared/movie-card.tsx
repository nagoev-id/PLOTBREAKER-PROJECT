'use client';

import { Card } from '@/components/ui/card';
import { FC, JSX, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getGenreLabel } from '@/lib/utils';
import { Calendar, Clock, Star, Pencil, Trash2, Loader2 } from 'lucide-react';
import { MediaContent, User } from '@/payload-types';
import { getPosterUrl, OPINION_CONFIG } from '@/utilities/constants';
import { Badge } from '@/components/ui';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

type Props = {
  item: MediaContent;
  user?: User | null;
};

export const MovieCard: FC<Props> = ({ item, user }): JSX.Element => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const posterSrc = getPosterUrl(item);

  const opinionConfig = item.personalOpinion
    ? OPINION_CONFIG[item.personalOpinion]
    : null;
  const OpinionIcon = opinionConfig?.icon;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/media-contents/${item.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      toast.success('Запись удалена');
      router.refresh();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Ошибка при удалении');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative h-full group/card">
      <Link href={`/reviews/${item.slug}`} className="block h-full">
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

      {/* Admin Actions */}
      {user && (
        <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 transition-opacity group-hover/card:opacity-100 flex gap-2 justify-center bg-black/60 backdrop-blur-sm translate-y-full group-hover/card:translate-y-0 z-10">
          <Link
            href={`/admin/collections/media-contents/${item.id}`}
            target="_blank"
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            onClick={(e) => e.stopPropagation()}
            title="Редактировать"
          >
            <Pencil size={16} />
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
                title="Удалить"
              >
                <Trash2 size={16} />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить запись?</AlertDialogTitle>
                <AlertDialogDescription>
                  Это действие нельзя отменить. Запись {`"${item.title}"`} будет
                  удалена навсегда.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  className="bg-red-500 hover:bg-red-600"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    'Удалить'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};
