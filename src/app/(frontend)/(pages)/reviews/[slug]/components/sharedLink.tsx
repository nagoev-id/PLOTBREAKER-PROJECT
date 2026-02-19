'use client';

import { Check, Share2 } from 'lucide-react';
import { FC, JSX, useCallback, useState } from 'react';
import { toast } from 'sonner';

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

  return (
    <div className="border-t pt-4">
      <button
        onClick={handleShare}
        className="text-muted-foreground hover:text-foreground inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border px-4 py-2 text-sm transition-colors hover:bg-accent"
      >
        {copied ? (
          <>
            <Check size={14} />
            Скопировано
          </>
        ) : (
          <>
            <Share2 size={14} />
            Поделиться
          </>
        )}
      </button>
    </div>
  );
};
