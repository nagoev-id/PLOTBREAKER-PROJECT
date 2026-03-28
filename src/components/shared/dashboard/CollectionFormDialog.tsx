'use client';

import { FC, FormEvent, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { Button, Input, Label, Switch } from '@/components/ui';
import type { List as Collection } from '@/payload-types';

interface CollectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection?: Collection | null;
  onSubmit: (data: Partial<Collection>) => Promise<void>;
}

/**
 * Диалог создания/редактирования коллекции.
 */
export const CollectionFormDialog: FC<CollectionFormDialogProps> = ({
  open,
  onOpenChange,
  collection,
  onSubmit,
}) => {
  const isEditing = !!collection;
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(collection?.title ?? '');
  const [isPublic, setIsPublic] = useState(collection?.isPublic ?? true);
  const [isTheme, setIsTheme] = useState(collection?.isTheme ?? false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSubmit({ title: title.trim(), isPublic, isTheme });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Редактировать список' : 'Новый список'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Измените данные списка и сохраните.'
              : 'Заполните данные для создания нового списка.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="collection-title">Название</Label>
            <Input
              id="collection-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название списка"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="collection-public">Общедоступный</Label>
            <Switch
              id="collection-public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="collection-theme">Тематический</Label>
            <Switch
              id="collection-theme"
              checked={isTheme}
              onCheckedChange={setIsTheme}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
