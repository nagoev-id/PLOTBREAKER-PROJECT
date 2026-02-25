'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Globe, Lock, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { CollectionFormDialog } from '@/components/shared/dashboard/CollectionFormDialog';
import { DeleteConfirmDialog } from '@/components/shared/dashboard/DeleteConfirmDialog';
import { ANIMATIONS } from '@/utilities/constants';
import { useDelete } from '@/hooks/useDelete';
import type { Collection } from '@/payload-types';

interface DashboardCollectionsClientProps {
  initialCollections: Collection[];
}

/**
 * Клиентский компонент для управления коллекциями (списками).
 */
const DashboardCollectionsClient: FC<DashboardCollectionsClientProps> = ({
  initialCollections,
}) => {
  const router = useRouter();
  const [collections, setCollections] =
    useState<Collection[]>(initialCollections);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  );
  const { deleteRecord, deleteLoading } = useDelete();

  const handleCreate = () => {
    setEditingCollection(null);
    setDialogOpen(true);
  };

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: Partial<Collection>) => {
    try {
      if (editingCollection) {
        // Обновление
        const res = await fetch(
          `/api/dashboard/collections/${editingCollection.id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          }
        );
        if (!res.ok) throw new Error('Ошибка обновления');
        const updated = await res.json();
        setCollections((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        toast.success('Список обновлён');
      } else {
        // Создание
        const res = await fetch('/api/dashboard/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Ошибка создания');
        const created = await res.json();
        setCollections((prev) => [created, ...prev]);
        toast.success('Список создан');
      }
      router.refresh();
    } catch {
      toast.error('Не удалось сохранить список');
      throw new Error('Save failed');
    }
  };

  const handleDelete = (id: number) => {
    deleteRecord(id, {
      url: '/api/dashboard/collections',
      successMessage: 'Список удалён',
      errorMessage: 'Не удалось удалить список',
      onSuccess: (deletedId) => {
        setCollections((prev) => prev.filter((c) => c.id !== deletedId));
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка создания */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Коллекции</h2>
          <p className="text-muted-foreground text-sm">
            {collections.length} списков
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Новый список
        </Button>
      </div>

      {/* Таблица */}
      {collections.length > 0 ? (
        <motion.div
          variants={ANIMATIONS.containerVariants}
          initial="hidden"
          animate="visible"
          className="overflow-hidden rounded-lg border"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Название
                </th>
                <th className="hidden px-4 py-3 text-left text-sm font-medium sm:table-cell">
                  Элементов
                </th>
                <th className="hidden px-4 py-3 text-left text-sm font-medium md:table-cell">
                  Статус
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {collections.map((collection) => (
                <motion.tr
                  key={collection.id}
                  variants={ANIMATIONS.itemVariants}
                  className="border-b transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{collection.title}</div>
                    <div className="text-muted-foreground text-xs">
                      /{collection.slug}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className="text-muted-foreground text-sm">
                      {collection.itemCount ?? 0}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <div className="flex gap-1.5">
                      {collection.isPublic ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                          <Globe className="h-3 w-3" />
                          Публичный
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          <Lock className="h-3 w-3" />
                          Приватный
                        </span>
                      )}
                      {collection.isTheme && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-400">
                          <Tag className="h-3 w-3" />
                          Тема
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(collection)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DeleteConfirmDialog
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                        title={`Удалить «${collection.title}»?`}
                        onConfirm={() => handleDelete(collection.id)}
                        loading={deleteLoading === collection.id}
                      />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      ) : (
        <div className="rounded-lg border border-dashed py-12 text-center">
          <p className="text-muted-foreground">Списков пока нет</p>
          <Button variant="outline" className="mt-4" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Создать первый список
          </Button>
        </div>
      )}

      {/* Диалог создания/редактирования */}
      <CollectionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        collection={editingCollection}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default DashboardCollectionsClient;
