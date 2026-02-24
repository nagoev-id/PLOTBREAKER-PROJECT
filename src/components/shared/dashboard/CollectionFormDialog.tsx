'use client';

import { FC, FormEvent, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { Button, Input, Label, Switch } from '@/components/ui';
import type { Collection } from '@/payload-types';

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
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isTheme, setIsTheme] = useState(false);

  useEffect(() => {
    if (collection) {
      setTitle(collection.title);
      setIsPublic(collection.isPublic ?? true);
      setIsTheme(collection.isTheme ?? false);
    } else {
      setTitle('');
      setIsPublic(true);
      setIsTheme(false);
    }
  }, [collection, open]);

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
              autoFocus
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
