'use client';

import { FC, useReducer, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

import { Button, Input } from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { DeleteConfirmDialog } from '@/components/shared/dashboard/DeleteConfirmDialog';
import { MEDIA_CONTENT_TYPES, MEDIA_CONTENT_STATUS, TYPE_CONFIG } from '@/lib/constants';
import { useDelete } from '@/hooks/useDelete';
import type { Title as MediaContent } from '@/payload-types';

// ---------------------------------------------------------------------------
// Состояние и редюсер
// ---------------------------------------------------------------------------

interface EntriesState {
  entries: MediaContent[];
  totalPages: number;
  totalDocs: number;
  page: number;
  search: string;
  filterType: string;
  filterStatus: string;
  loading: boolean;
}

type EntriesAction =
  | { type: 'FETCH_START' }
  | {
      type: 'FETCH_SUCCESS';
      payload: { docs: MediaContent[]; totalPages: number; totalDocs: number; page: number };
    }
  | { type: 'FETCH_ERROR' }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_FILTER_TYPE'; payload: string }
  | { type: 'SET_FILTER_STATUS'; payload: string }
  | { type: 'RESET_FILTERS' }
  | { type: 'DELETE_ENTRY'; payload: number | string };

const initialState: EntriesState = {
  entries: [],
  totalPages: 1,
  totalDocs: 0,
  page: 1,
  search: '',
  filterType: '',
  filterStatus: '',
  loading: false,
};

function entriesReducer(state: EntriesState, action: EntriesAction): EntriesState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        entries: action.payload.docs,
        totalPages: action.payload.totalPages,
        totalDocs: action.payload.totalDocs,
        page: action.payload.page,
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false };
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    case 'SET_FILTER_TYPE':
      return { ...state, filterType: action.payload };
    case 'SET_FILTER_STATUS':
      return { ...state, filterStatus: action.payload };
    case 'RESET_FILTERS':
      return { ...state, filterType: '', filterStatus: '' };
    case 'DELETE_ENTRY':
      return {
        ...state,
        entries: state.entries.filter((e) => String(e.id) !== String(action.payload)),
        totalDocs: state.totalDocs - 1,
      };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Вспомогательная функция
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, string> = {
  planned: 'Планирую',
  watching: 'Смотрю',
  watched: 'Просмотрено',
  abandoned: 'Заброшено',
};

const getStatusLabel = (status: string | null | undefined): string =>
  STATUS_LABELS[status || ''] ?? status ?? '—';

// ---------------------------------------------------------------------------
// Дочерние компоненты
// ---------------------------------------------------------------------------

interface EntryRowProps {
  entry: MediaContent;
  deleteLoading: number | string | null;
  onDelete: (id: number | string) => void;
}

const EntryRow: FC<EntryRowProps> = ({ entry, deleteLoading, onDelete }) => {
  const typeConfig = TYPE_CONFIG[entry.type || ''] || TYPE_CONFIG.film;

  return (
    <tr className="border-b transition-colors hover:bg-muted/30">
      <td className="px-4 py-3">
        <div className="font-medium">
          <Link href={`/reviews/${entry.slug}`}>{entry.title}</Link>
        </div>
        {entry.originalTitle && (
          <div className="text-muted-foreground text-xs">
            <Link href={`/reviews/${entry.slug}`}>{entry.originalTitle}</Link>
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
        <span className="text-muted-foreground text-sm">{getStatusLabel(entry.status)}</span>
      </td>
      <td className="hidden px-4 py-3 lg:table-cell">
        <span className="text-muted-foreground text-sm">{entry.releaseYear || '—'}</span>
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
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            }
            title={`Удалить «${entry.title}»?`}
            onConfirm={() => onDelete(entry.id)}
            loading={deleteLoading === entry.id}
          />
        </div>
      </td>
    </tr>
  );
};

// ---------------------------------------------------------------------------
// Основной компонент
// ---------------------------------------------------------------------------

/**
 * Клиентский компонент для управления записями медиа-контента.
 * Данные загружаются на клиенте через Payload REST API.
 */
const DashboardEntriesClient: FC = () => {
  const [state, dispatch] = useReducer(entriesReducer, initialState);
  const { deleteRecord, deleteLoading } = useDelete();

  const { entries, totalPages, totalDocs, page, search, filterType, filterStatus, loading } = state;

  const fetchEntries = useCallback(
    async (p: number, s: string, type: string, status: string) => {
      dispatch({ type: 'FETCH_START' });

      const params = new URLSearchParams({ page: p.toString(), limit: '20' });
      if (s) params.set('search', s);
      if (type) params.set('type', type);
      if (status) params.set('status', status);

      try {
        const res = await fetch(`/api/dashboard/entries?${params}`);
        if (!res.ok) throw new Error('Ошибка загрузки');
        const data = await res.json();
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: { docs: data.docs, totalPages: data.totalPages, totalDocs: data.totalDocs, page: p },
        });
      } catch {
        toast.error('Не удалось загрузить записи');
        dispatch({ type: 'FETCH_ERROR' });
      }
    },
    []
  );

  useEffect(() => {
    fetchEntries(1, '', '', '');
  }, [fetchEntries]);

  const handleSearch = () => fetchEntries(1, search, filterType, filterStatus);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleDelete = (id: number | string) => {
    deleteRecord(id, {
      url: '/api/dashboard/entries',
      successMessage: 'Запись удалена',
      errorMessage: 'Не удалось удалить запись',
      onSuccess: (deletedId) => dispatch({ type: 'DELETE_ENTRY', payload: deletedId }),
    });
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

      {/* Поиск и фильтры */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Поиск по названию..."
            value={search}
            onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
        </div>

        {/* Фильтр по типу */}
        <Select
          value={filterType}
          onValueChange={(val) => {
            dispatch({ type: 'SET_FILTER_TYPE', payload: val });
            fetchEntries(1, search, val, filterStatus);
          }}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Тип" />
          </SelectTrigger>
          <SelectContent>
            {MEDIA_CONTENT_TYPES.select.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Фильтр по статусу */}
        <Select
          value={filterStatus}
          onValueChange={(val) => {
            dispatch({ type: 'SET_FILTER_STATUS', payload: val });
            fetchEntries(1, search, filterType, val);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            {MEDIA_CONTENT_STATUS.select.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Кнопка сброса фильтров */}
        {(filterType || filterStatus) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              dispatch({ type: 'RESET_FILTERS' });
              fetchEntries(1, search, '', '');
            }}
            className="gap-1 text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Сброс
          </Button>
        )}

        <Button variant="outline" onClick={handleSearch} disabled={loading}>
          Найти
        </Button>
      </div>

      {/* Таблица */}
      {entries.length > 0 ? (
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Название</th>
                  <th className="hidden px-4 py-3 text-left text-sm font-medium sm:table-cell">Тип</th>
                  <th className="hidden px-4 py-3 text-left text-sm font-medium md:table-cell">Статус</th>
                  <th className="hidden px-4 py-3 text-left text-sm font-medium lg:table-cell">Год</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    deleteLoading={deleteLoading}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed py-12 text-center">
          <p className="text-muted-foreground">
            {search ? 'Записей не найдено' : loading ? 'Загрузка...' : 'Записей пока нет'}
          </p>
          {!search && !loading && (
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
            onClick={() => fetchEntries(page - 1, search, filterType, filterStatus)}
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
            onClick={() => fetchEntries(page + 1, search, filterType, filterStatus)}
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
