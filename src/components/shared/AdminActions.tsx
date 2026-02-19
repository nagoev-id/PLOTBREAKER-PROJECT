import { FC, MouseEvent } from 'react';
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
} from '@/components/ui/alert-dialog';

type AdminActionsProps = {
  editUrl: string;
  onDelete: () => void;
  isDeleting: boolean;
  title: string;
  typeName: string; // 'Запись', 'Пост', 'Коллекция'
};

export const AdminActions: FC<AdminActionsProps> = ({
  editUrl,
  onDelete,
  isDeleting,
  title,
  typeName = 'Запись',
}) => {
  // Определяем склонение для "Удалить {typeName}"
  let deleteTitle = `Удалить ${typeName.toLowerCase()}?`;
  if (typeName.toLowerCase() === 'коллекция') {
    deleteTitle = 'Удалить коллекцию?';
  }

  return (
    <div className="grid lg:grid-cols-2 gap-1 p-2 md:px-3 md:pb-3">
      <Link
        href={editUrl}
        target="_blank"
        className="p-2 text-xs flex items-center justify-center gap-0.5 cursor-pointer border-1 rounded-xs bg-zinc-100 dark:bg-zinc-800"
        onClick={(e) => e.stopPropagation()}
        title="Редактировать"
      >
        <Pencil size={16} />
        Редакт.
      </Link>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            className="p-2 text-xs flex items-center justify-center gap-0.5 cursor-pointer border-1 rounded-xs bg-red-400 text-white"
            onClick={(e) => e.stopPropagation()}
            title="Удалить"
          >
            <Trash2 size={16} />
            Удалить
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent onClick={(e: MouseEvent) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteTitle}</AlertDialogTitle>
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
