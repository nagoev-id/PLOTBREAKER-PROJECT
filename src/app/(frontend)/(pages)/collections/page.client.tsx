'use client';

import { FC, JSX, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui';

import { FILTERS_COLLECTIONS } from '@/utilities/constants';
import { getTypeKey } from '@/utilities/utils';
import { CollectionCard, useCollections } from '@/components/shared';

/**
 * Клиентский компонент страницы коллекций.
 * Реализует фильтрацию списков и отображение карточек.
 */
const CollectionsPageClient: FC = (): JSX.Element => {
  const { collections } = useCollections();
  const collectionsLists = collections || [];
  const [typeFilter, setTypeFilter] = useState<string>('all_type');

  /**
   * Фильтрует списки на основе выбранного типа.
   * Если выбран "all_type", возвращаются все списки.
   * Иначе возвращаются только списки с выбранным типом.
   */
  const filteredLists = useMemo(() => {
    return collectionsLists.filter((list) => {
      if (typeFilter === 'all_type') return true;
      if (typeFilter === 'theme') return list.isTheme === true;

      const typeKey = getTypeKey(list.title);
      return typeKey === typeFilter;
    });
  }, [collectionsLists, typeFilter]);

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
            filteredLists.map((list) => (
              <CollectionCard key={list.id} list={list} />
            ))
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
