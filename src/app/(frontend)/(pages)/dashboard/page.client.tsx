'use client';

import { FC, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Globe, Lock, Tag, Search, X } from 'lucide-react';

import { Button, Input } from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { CollectionFormDialog } from '@/components/shared/dashboard/CollectionFormDialog';
import { DeleteConfirmDialog } from '@/components/shared/dashboard/DeleteConfirmDialog';
import { useDelete } from '@/hooks/useDelete';
import type { List as Collection } from '@/payload-types';

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

  // Фильтры
  const [search, setSearch] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('');
  const [filterTheme, setFilterTheme] = useState('');

  const filteredCollections = useMemo(() => {
    return collections.filter((c) => {
      // Поиск по названию
      if (search) {
        const q = search.toLowerCase();
        if (
          !c.title.toLowerCase().includes(q) &&
          !(c.slug || '').toLowerCase().includes(q)
        )
          return false;
      }

      // Фильтр по видимости
      if (filterVisibility === 'public' && !c.isPublic) return false;
      if (filterVisibility === 'private' && c.isPublic) return false;

      // Фильтр по теме
      if (filterTheme === 'theme' && !c.isTheme) return false;
      if (filterTheme === 'not-theme' && c.isTheme) return false;

      return true;
    });
  }, [collections, search, filterVisibility, filterTheme]);

  const hasActiveFilters = search || filterVisibility || filterTheme;

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
            {filteredCollections.length} из {collections.length} списков
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Новый список
        </Button>
      </div>

      {/* Поиск и фильтры */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Поиск по названию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Фильтр видимости */}
        <Select value={filterVisibility} onValueChange={setFilterVisibility}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Видимость" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Публичные</SelectItem>
            <SelectItem value="private">Приватные</SelectItem>
          </SelectContent>
        </Select>

        {/* Фильтр по теме */}
        <Select value={filterTheme} onValueChange={setFilterTheme}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Тема" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="theme">Темы</SelectItem>
            <SelectItem value="not-theme">Не темы</SelectItem>
          </SelectContent>
        </Select>

        {/* Сброс фильтров */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('');
              setFilterVisibility('');
              setFilterTheme('');
            }}
            className="gap-1 text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Сброс
          </Button>
        )}
      </div>

      {/* Таблица */}
      {filteredCollections.length > 0 ? (
        <div className="overflow-hidden rounded-lg border">
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
              {filteredCollections.map((collection) => (
                <tr
                  key={collection.id}
                  className="border-b transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      <Link href={`/collections/${collection.slug}`}>
                        {collection.title}
                      </Link>
                    </div>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed py-12 text-center">
          <p className="text-muted-foreground">
            {hasActiveFilters ? 'Списков не найдено' : 'Списков пока нет'}
          </p>
          {!hasActiveFilters && (
            <Button variant="outline" className="mt-4" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Создать первый список
            </Button>
          )}
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
