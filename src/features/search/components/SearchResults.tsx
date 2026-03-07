import { FC } from 'react';
import { Film, Palette, Tv } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Title } from '@/payload-types';

const contentTypeIcons: Record<string, typeof Film> = {
  film: Film,
  series: Tv,
  cartoon: Palette,
};

type SearchResultsProps = {
  results: Title[];
  query: string;
  isLoading: boolean;
  onClose: () => void;
};

export const SearchResults: FC<SearchResultsProps> = ({
  results,
  query,
  isLoading,
  onClose,
}) => (
  <div className="flex-1 overflow-y-auto sm:max-h-[60vh]">
    {results.length === 0 && query.trim() && !isLoading && (
      <div className="text-muted-foreground py-12 text-center text-sm sm:py-16 sm:text-base">
        Ничего не найдено
      </div>
    )}

    {results.length === 0 && !query.trim() && (
      <div className="text-muted-foreground py-12 text-center text-sm sm:py-16 sm:text-base">
        Начните вводить для поиска
      </div>
    )}

    {results.length > 0 && (
      <div className="divide-border divide-y">
        {results.map((content) => {
          const Icon = contentTypeIcons[content.type || 'film'];

          const imageUrl =
            content.poster &&
            typeof content.poster === 'object' &&
            'url' in content.poster &&
            content.poster.url
              ? content.poster.url
              : content.posterUrl || '/images/cover.jpg';

          return (
            <Link
              key={content.id}
              href={`/reviews/${content.slug}`}
              onClick={onClose}
              className="group hover:bg-accent flex items-center justify-between gap-3 p-3 transition-colors sm:gap-4 sm:p-4"
            >
              <div className="flex items-center gap-3 overflow-hidden sm:gap-4">
                {/* Постер */}
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-100 sm:h-20 sm:w-14">
                  <Image
                    src={imageUrl}
                    alt={content.title}
                    fill
                    className="h-full w-full object-cover"
                    sizes="60px"
                  />
                </div>

                {/* Информация */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="group-hover:text-primary line-clamp-1 text-sm font-bold transition-colors sm:text-base">
                    {content.title}
                  </h3>

                  {content.originalTitle &&
                    content.originalTitle !== content.title && (
                      <p className="text-muted-foreground line-clamp-1 text-xs">
                        {content.originalTitle}
                      </p>
                    )}

                  <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-[11px] sm:mt-1 sm:text-xs">
                    {content.releaseYear && <span>{content.releaseYear}</span>}
                    {content.director && (
                      <>
                        <span>•</span>
                        <span className="line-clamp-1">{content.director}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Иконка типа контента */}
              {Icon && (
                <div className="bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 rounded-md p-2 transition-colors">
                  <Icon size={16} />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    )}
  </div>
);
