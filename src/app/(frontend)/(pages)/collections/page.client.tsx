'use client';

import { FC, JSX, useMemo, useState } from 'react';
import { CollectionCollection } from '@/utilities/types';
import { FILTERS_COLLECTIONS } from '@/utilities/constants';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn, configCollection, getTypeKey } from '@/lib/utils';

// Тип пропсов компонента
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

  /**
   * Фильтрует списки на основе выбранного типа.
   * Если выбран "all_type", возвращаются все списки.
   * Иначе возвращаются только списки с выбранным типом.
   */
  const filteredLists = useMemo(() => {
    return data.filter((list) => {
      const typeKey = getTypeKey(list.title);
      return typeFilter === 'all_type' || typeKey === typeFilter;
    });
  }, [data, typeFilter]);

  return (
    <section className="border-t">
      <div className="container mx-auto space-y-6 px-4 py-6">
        {/* Фильтры */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid place-items-center"
        >
          {/* Заголовок */}
          <div className="grid place-items-center gap-2 ">
            <h3 className="text-2xl font-bold">Список коллекции</h3>
            <div className="text-muted-foreground text-sm">
              Найдено списков:{' '}
              <span className="font-bold text-foreground">
                {filteredLists.length}
              </span>
            </div>
            {/* Фильтры */}
            <div className="flex flex-col gap-4 md:flex-row md:gap-6">
              {FILTERS_COLLECTIONS.map((filter) => (
                <div className="grid space-y-2" key={filter.label}>
                  <span className="sr-only text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                    {filter.label}
                  </span>
                  <Tabs
                    value={typeFilter}
                    onValueChange={(val) => val && setTypeFilter(val)}
                  >
                    <TabsList className="flex h-auto justify-center max-w-max">
                      {filter.options.map((option) => (
                        <TabsTrigger key={option.value} value={option.value}>
                          {option.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Сетка карточек */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLists.length > 0 ? (
            filteredLists.map((list) => {
              const { type, TypeIcon } = configCollection(list.title);

              return (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="group h-full"
                >
                  <Link
                    href={`/collections/${list.slug}`}
                    className="block h-full"
                  >
                    <Card
                      className={cn(
                        'hover:bg-muted-foreground/2 h-full rounded-none border shadow-none transition-all hover:shadow-sm',
                        type.border
                      )}
                    >
                      <div className="flex items-center justify-between p-3">
                        {/* Иконка типа */}
                        <div
                          className={cn(
                            'h-10 w-10 grid place-items-center border',
                            type.bg
                          )}
                        >
                          <TypeIcon size={20} className={type.color} />
                        </div>

                        {/* Бейдж типа контента */}
                        <div
                          className={cn(
                            'flex items-center gap-1.5 rounded-sm border px-3 py-1',
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
                      <h3 className="p-3 text-lg font-bold">{list.title}</h3>

                      {/* Разделитель */}
                      <Separator
                        className={cn('bg-transparent border-b', type.border)}
                      />

                      {/* Футер */}
                      <div
                        className={cn(
                          'flex items-center justify-between gap-3 p-3 text-sm text-zinc-500 dark:text-zinc-400',
                          type.bg
                        )}
                      >
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
            <div className="col-span-full py-20 text-center">
              <div className="text-muted-foreground">Списков не найдено</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CollectionsPageClient;
