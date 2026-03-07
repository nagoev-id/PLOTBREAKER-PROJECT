'use client';

import { Check, Share2 } from 'lucide-react';
import { FC, JSX, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui';

type SharedLink = {
  className?: string;
  showText?: boolean;
  buttonVariant?: 'link' | 'outline' | 'default' | 'secondary' | 'ghost';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon' | null | undefined;
};
/**
 * Компонент для кнопки "Поделиться"
 * @returns {JSX.Element}
 */
export const SharedLink: FC<SharedLink> = ({
  className,
  showText = false,
  buttonVariant = 'link',
  buttonSize = 'sm',
}): JSX.Element => {
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
          <span className={!showText ? 'sr-only' : ''}>Скопировано</span>
        </>
      );
    }
    return (
      <>
        <Share2 size={14} />
        <span className={!showText ? 'sr-only' : ''}>Поделиться</span>
      </>
    );
  };

  return (
    <div className={className}>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={handleShare}
        className="inline-flex w-full"
      >
        {renderContent()}
      </Button>
    </div>
  );
};
