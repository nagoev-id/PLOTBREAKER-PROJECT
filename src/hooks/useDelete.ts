import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type DeleteOptions = {
  url: string;
  onSuccess?: (id: number | string) => void;
  successMessage?: string;
  errorMessage?: string;
};

export const useDelete = () => {
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState<number | string | null>(
    null
  );

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
