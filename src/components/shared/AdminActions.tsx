import { FC, JSX, MouseEvent } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui';

import { useAuth } from '@/components/shared';
import { cn } from '@/utilities/utils';

// Тип для пропсов
type AdminActionsProps = {
  editUrl: string;
  onDelete: () => void;
  isDeleting: boolean;
  title: string;
  typeName: string;
  classNames?: string;
};

/**
 *  Компонент кнопок администрирования
 * @param editUrl - URL для редактирования
 * @param onDelete - функция удаления
 * @param isDeleting - состояние удаления
 * @param title - название
 * @param typeName - тип
 * @returns {JSX.Element | null}
 */
export const AdminActions: FC<AdminActionsProps> = ({
  editUrl,
  onDelete,
  isDeleting,
  title,
  typeName = 'Запись',
  classNames,
}): JSX.Element | null => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div
      className={cn(
        'grid lg:grid-cols-2 gap-1 p-2 md:px-3 md:pb-3',
        classNames
      )}
    >
      <Link
        href={editUrl}
        target="_blank"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm shadow-sm dark:bg-white dark:text-black"
        onClick={(e) => e.stopPropagation()}
        title="Редактировать"
      >
        <Pencil size={16} />
        <span className="sr-only">Редактировать</span>
      </Link>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm shadow-sm dark:bg-white dark:text-black"
            onClick={(e) => e.stopPropagation()}
            title="Удалить"
          >
            <Trash2 size={16} />
            <span className="sr-only">Удалить</span>
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent onClick={(e: MouseEvent) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>{`Удалить ${typeName.toLowerCase() === 'коллекция' ? 'коллекцию' : typeName.toLowerCase()}?`}</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. {typeName} {`"${title}"`} будет
              удалена навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e: MouseEvent) => {
                e.preventDefault();
                onDelete();
              }}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                'Удалить'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
