'use client';

import { FC, useState, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Input } from '@/components/ui';
import { DeleteConfirmDialog } from '@/components/shared/dashboard/DeleteConfirmDialog';
import { ANIMATIONS, TYPE_CONFIG } from '@/utilities/constants';
import { useDelete } from '@/hooks/useDelete';
import type { MediaContent } from '@/payload-types';

interface DashboardEntriesClientProps {
  initialEntries: MediaContent[];
  initialTotalPages: number;
  initialTotalDocs: number;
}

/**
 * Клиентский компонент для управления записями медиа-контента.
 */
const DashboardEntriesClient: FC<DashboardEntriesClientProps> = ({
  initialEntries,
  initialTotalPages,
  initialTotalDocs,
}) => {
  const [entries, setEntries] = useState<MediaContent[]>(initialEntries);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalDocs, setTotalDocs] = useState(initialTotalDocs);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const { deleteRecord, deleteLoading } = useDelete();

  const fetchEntries = useCallback(async (p: number, s: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: p.toString(),
        limit: '20',
      });
      if (s) params.set('search', s);

      const res = await fetch(`/api/dashboard/entries?${params}`);
      if (!res.ok) throw new Error('Ошибка загрузки');
      const data = await res.json();

      setEntries(data.docs);
      setTotalPages(data.totalPages);
      setTotalDocs(data.totalDocs);
      setPage(p);
    } catch {
      toast.error('Не удалось загрузить записи');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => {
    fetchEntries(1, search);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleDelete = (id: number) => {
    deleteRecord(id, {
      url: '/api/dashboard/entries',
      successMessage: 'Запись удалена',
      errorMessage: 'Не удалось удалить запись',
      onSuccess: (deletedId) => {
        setEntries((prev) => prev.filter((e) => e.id !== deletedId));
        setTotalDocs((prev) => prev - 1);
      },
    });
  };

  const getStatusLabel = (status: string | null | undefined): string => {
    const map: Record<string, string> = {
      planned: 'Планирую',
      watching: 'Смотрю',
      watched: 'Просмотрено',
      abandoned: 'Заброшено',
    };
    return map[status || ''] || status || '—';
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Записи</h2>
          <p className="text-muted-foreground text-sm">{totalDocs} записей</p>
        </div>
        <Link href="/dashboard/entries/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Новая запись
          </Button>
        </Link>
      </div>

      {/* Поиск */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Поиск по названию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={handleSearch} disabled={loading}>
          Найти
        </Button>
      </div>

      {/* Таблица */}
      {entries.length > 0 ? (
        <motion.div
          variants={ANIMATIONS.containerVariants}
          initial="hidden"
          animate="visible"
          className="overflow-hidden rounded-lg border"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Название
                  </th>
                  <th className="hidden px-4 py-3 text-left text-sm font-medium sm:table-cell">
                    Тип
                  </th>
                  <th className="hidden px-4 py-3 text-left text-sm font-medium md:table-cell">
                    Статус
                  </th>
                  <th className="hidden px-4 py-3 text-left text-sm font-medium lg:table-cell">
                    Год
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const typeConfig =
                    TYPE_CONFIG[entry.type || ''] || TYPE_CONFIG.film;

                  return (
                    <motion.tr
                      key={entry.id}
                      variants={ANIMATIONS.itemVariants}
                      className="border-b transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{entry.title}</div>
                        {entry.originalTitle && (
                          <div className="text-muted-foreground text-xs">
                            {entry.originalTitle}
                          </div>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${typeConfig.bg} ${typeConfig.color}`}
                        >
                          {typeConfig.label}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span className="text-muted-foreground text-sm">
                          {getStatusLabel(entry.status)}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <span className="text-muted-foreground text-sm">
                          {entry.releaseYear || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Link href={`/dashboard/entries/${entry.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
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
                            title={`Удалить «${entry.title}»?`}
                            onConfirm={() => handleDelete(entry.id)}
                            loading={deleteLoading === entry.id}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <div className="rounded-lg border border-dashed py-12 text-center">
          <p className="text-muted-foreground">
            {search ? 'Записей не найдено' : 'Записей пока нет'}
          </p>
          {!search && (
            <Link href="/dashboard/entries/new">
              <Button variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Создать первую запись
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchEntries(page - 1, search)}
            disabled={page <= 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-muted-foreground text-sm">
            {page} из {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchEntries(page + 1, search)}
            disabled={page >= totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default DashboardEntriesClient;
