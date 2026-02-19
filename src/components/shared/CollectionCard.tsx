'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn, configCollection } from '@/utilities/utils';

import { Card, Separator } from '@/components/ui';
import { toast } from 'sonner';
import { CollectionCollection, UserCollection } from '@/utilities/types';
import { AdminActions } from './AdminActions';

type CollectionCardProps = {
  list: CollectionCollection;
  user?: UserCollection | null;
};

/**
 * Карточка коллекции.
 * @param list Коллекция.
 * @param user Пользователь.
 * @returns Карточка коллекции.
 */
export const CollectionCard: FC<CollectionCardProps> = ({ list, user }) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const { type, TypeIcon } = configCollection(list.title);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/collections/${list.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      toast.success('Коллекция удалена');
      router.refresh();
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error('Ошибка при удалении');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group h-full"
    >
      <Card
        className={cn(
          'hover:bg-muted-foreground/2 h-full rounded-none border shadow-none transition-all hover:shadow-sm',
          type.border
        )}
      >
        <Link href={`/collections/${list.slug}`} className="block">
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
              <span className={cn('text-xs font-semibold', type.color)}>
                {type.label}
              </span>
            </div>
          </div>

          {/* Заголовок */}
          <h3 className="p-3 text-lg font-bold">{list.title}</h3>

          {/* Разделитель */}
          <Separator className={cn('bg-transparent border-b', type.border)} />

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
        </Link>
        {user && (
          <AdminActions
            editUrl={`/admin/collections/collections/${list.id}`}
            onDelete={handleDelete}
            isDeleting={isDeleting}
            title={list.title}
            typeName="Коллекция"
          />
        )}
      </Card>
    </motion.div>
  );
};
