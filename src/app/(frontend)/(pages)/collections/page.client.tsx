'use client';

import { FC, JSX, useMemo, useState } from 'react';
import { CollectionCollection } from '@/utilities/types';
import { FILTERS_COLLECTIONS, TYPE_CONFIG } from '@/utilities/constants';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn, getTypeKey } from '@/lib/utils';
import { ListIcon } from 'lucide-react';

type CollectionsPageClientProps = {
  data: CollectionCollection[];
};

/**
 * Клиентский компонент страницы коллекций.
 * Реализует фильтрацию списков и отображение карточек.
 */
const CollectionsPageClient: FC<CollectionsPageClientProps> = ({
  data,
}): JSX.Element => {
  const [typeFilter, setTypeFilter] = useState<string>('all_type');

  const filteredLists = useMemo(() => {
    return data.filter((list) => {
      const typeKey = getTypeKey(list.title);
      return typeFilter === 'all_type' || typeKey === typeFilter;
    });
  }, [data, typeFilter]);

  return (
    <section className="container mx-auto space-y-6 px-4 py-8 lg:py-11">
      {/* Фильтры */}
      <div className="grid gap-3 md:flex md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-bold xl:text-3xl">Список коллекции</h3>
          <div className="text-muted-foreground text-sm">
            Найдено списков:{' '}
            <span className="font-bold text-foreground">
              {filteredLists.length}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:gap-6">
          {FILTERS_COLLECTIONS.map((filter) => (
            <div className="flex flex-col gap-2" key={filter.label}>
              <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                {filter.label}
              </span>
              <ToggleGroup
                type="single"
                value={typeFilter}
                onValueChange={(val: string) => val && setTypeFilter(val)}
                variant="outline"
                size="sm"
                className="flex-wrap justify-start"
              >
                {filter.options.map((option) => (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className="text-xs"
                  >
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          ))}
        </div>
      </div>

      {/* Сетка карточек */}
      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLists.length > 0 ? (
            filteredLists.map((list, index) => {
              const typeKey = getTypeKey(list.title);
              const type = TYPE_CONFIG[typeKey] ?? {
                label: 'Контент',
                icon: ListIcon,
                bg: 'bg-zinc-100',
                color: 'text-zinc-500',
              };
              const TypeIcon = type.icon;

              return (
                <motion.div
                  key={list.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="group"
                >
                  <Link href={`/collections/${list.slug}`}>
                    <Card className="hover:bg-muted-foreground/5 rounded-sm border-2 shadow-none transition-all hover:shadow-sm">
                      <div className="flex items-center justify-between p-2 pb-0 sm:p-4 sm:pb-0">
                        {/* Иконка типа */}
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-lg',
                            type.bg
                          )}
                        >
                          <TypeIcon size={20} className={type.color} />
                        </div>

                        {/* Бейдж типа контента */}
                        <div
                          className={cn(
                            'flex items-center gap-1.5 rounded-full border px-3 py-1',
                            type.bg
                          )}
                        >
                          <TypeIcon size={14} className={type.color} />
                          <span
                            className={cn('text-xs font-semibold', type.color)}
                          >
                            {type.label}
                          </span>
                        </div>
                      </div>

                      {/* Заголовок */}
                      <h3 className="p-2 text-lg font-bold sm:p-4 lg:text-xl">
                        {list.title}
                      </h3>

                      {/* Разделитель */}
                      <Separator />

                      {/* Футер */}
                      <div className="flex items-center gap-3 p-2 text-sm text-zinc-500 sm:p-4 dark:text-zinc-400">
                        <div className="flex items-center gap-2">
                          <TypeIcon size={16} className="opacity-60" />
                          <span>{type.label}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-zinc-900 dark:text-zinc-50">
                            {list.itemCount ?? 0}
                          </span>
                          <span>записей</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="col-span-full py-20 text-center"
            >
              <div className="text-muted-foreground">Списков не найдено</div>
            </motion.div>
          )}
        </div>
      </AnimatePresence>
    </section>
  );
};

export default CollectionsPageClient;
