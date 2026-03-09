'use client';

import { FC } from 'react';
import Link from 'next/link';

import { cn, configCollection } from '@/lib/utils';
import type { List } from '@/payload-types';

type CollectionCardProps = {
  list: List;
};

/**
 * Карточка коллекции.
 * @param list Коллекция.
 * @returns Карточка коллекции.
 */
export const CollectionCard: FC<CollectionCardProps> = ({ list }) => {
  const { type, TypeIcon } = configCollection(list.title, list.slug);
  const [titleMain, titleSecondary] = list.title
    .split(':')
    .map((part) => part.trim());
  const contentType = list.isTheme ? 'Тематический' : type.label;
  const href = list.slug ? `/collections/${list.slug}` : '/collections';

  return (
    <div className="group h-full">
      <Link
        href={href}
        className={cn(
          'relative block h-full min-h-[180px] overflow-hidden border border-border bg-background/30 p-4 transition-all duration-300 sm:min-h-[230px] sm:p-6',
          'hover:border-foreground/30 hover:bg-background/60'
        )}
      >
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-foreground/[0.04] to-transparent sm:h-20" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-foreground/[0.06] to-transparent sm:h-24" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:text-xs sm:tracking-[0.14em]">
            <div className="inline-flex min-w-0 items-center gap-1.5 sm:gap-2">
              <TypeIcon
                className={cn('h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4', type.color)}
              />
              <span className="truncate">{contentType}</span>
            </div>
            <span>{list.itemCount ?? 0} записей</span>
          </div>

          <h3 className="space-y-0.5 pt-5 text-center sm:space-y-1 sm:pt-8">
            <span className="block break-words font-title text-[1.55rem] leading-[0.92] font-bold tracking-tight uppercase sm:text-3xl md:text-[2.05rem] lg:text-4xl">
              {titleMain}
            </span>
            <span className="block break-words text-[1.5rem] leading-[0.92] font-semibold tracking-tight uppercase sm:text-3xl md:text-[2.05rem] lg:text-4xl">
              {titleSecondary || 'Коллекция'}
            </span>
          </h3>

          <div className="text-center text-xs text-muted-foreground transition-colors group-hover:text-foreground/85 sm:text-sm">
            Открыть подборку
          </div>
        </div>
      </Link>
    </div>
  );
};
