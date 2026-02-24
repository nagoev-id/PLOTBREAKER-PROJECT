'use client';

import { FC, ReactNode } from 'react';
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

interface DeleteConfirmDialogProps {
  trigger: ReactNode;
  title?: string;
  description?: string;
  onConfirm: () => void;
  loading?: boolean;
}

/**
 * Диалог подтверждения удаления.
 * Используется для безопасного удаления записей и коллекций.
 */
export const DeleteConfirmDialog: FC<DeleteConfirmDialogProps> = ({
  trigger,
  title = 'Удалить?',
  description = 'Это действие нельзя отменить. Запись будет удалена навсегда.',
  onConfirm,
  loading = false,
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Удаление...' : 'Удалить'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
