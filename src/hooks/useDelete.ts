'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * Параметры для выполнения операции удаления
 */
type DeleteOptions = {
  /** URL API эндпоинта (без ID в конце) */
  url: string;
  /** Обратный вызов, выполняемый после успешного удаления */
  onSuccess?: (id: number | string) => void;
  /** Сообщение об успехе для уведомления */
  successMessage?: string;
  /** Сообщение об ошибке для уведомления */
  errorMessage?: string;
};

/**
 * Хук для управления состоянием и процессом удаления записей.
 *
 * @returns Объект с функцией удаления и состоянием загрузки.
 */
export const useDelete = () => {
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState<number | string | null>(
    null
  );

  /**
   * Выполняет DELETE запрос к API и обрабатывает результат.
   *
   * @param id - Идентификатор записи для удаления.
   * @param options - Объект с настройками (url, callbacks, messages).
   */
  const deleteRecord = async (id: number | string, options: DeleteOptions) => {
    const {
      url,
      onSuccess,
      successMessage = 'Запись удалена',
      errorMessage = 'Ошибка при удалении',
    } = options;

    setDeleteLoading(id);
    try {
      const res = await fetch(`${url}/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error(errorMessage);
      }

      toast.success(successMessage);

      if (onSuccess) {
        onSuccess(id);
      }

      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  return { deleteRecord, deleteLoading };
};
