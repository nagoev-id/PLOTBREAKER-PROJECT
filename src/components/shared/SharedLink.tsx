'use client';

import { Check, Share2 } from 'lucide-react';
import { FC, JSX, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui';

/**
 * Компонент для кнопки "Поделиться"
 * @returns {JSX.Element}
 */
export const SharedLink: FC = (): JSX.Element => {
  const [copied, setCopied] = useState(false);

  /**
   * Копирует текущий URL в буфер обмена
   */
  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Ссылка скопирована');
    } catch (error) {
      toast.error('Не удалось поделиться');
      console.error('Не удалось поделиться', error);
    }
  }, []);

  /**
   * Рендерит содержимое кнопки
   * @returns {JSX.Element} - содержимое кнопки
   */
  const renderContent = (): JSX.Element => {
    if (copied) {
      return (
        <>
          <Check size={14} />
          Скопировано
        </>
      );
    }
    return (
      <>
        <Share2 size={14} />
        Поделиться
      </>
    );
  };

  return (
    <div className="border-t pt-4">
      <Button onClick={handleShare} className="inline-flex w-full">
        {renderContent()}
      </Button>
    </div>
  );
};
