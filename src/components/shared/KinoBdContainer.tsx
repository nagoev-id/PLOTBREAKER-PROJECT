'use client';
import { FC, JSX, useEffect, useRef } from 'react';

type KinoBdContainerProps = {
  kinopoiskId: string;
  onClose: () => void;
};

/**
 * KinoBD плеер — контейнер, загружает скрипт kinobd.net
 * @param kinopoiskId - ID фильма на Кинопоиске
 * @param onClose - Функция закрытия плеера
 * @returns {JSX.Element}
 */
export const KinoBdContainer: FC<KinoBdContainerProps> = ({
  kinopoiskId,
  onClose,
}): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const playerDiv = document.createElement('div');
    playerDiv.id = 'kinobd';
    playerDiv.setAttribute('data-kinopoisk', kinopoiskId);
    containerRef.current.appendChild(playerDiv);

    const script = document.createElement('script');
    script.src = '//kinobd.net/js/player_.js';
    script.async = true;
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [kinopoiskId]);

  return (
    <section className="container mx-auto px-4 pt-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            KinoBD Плеер
          </span>
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Свернуть
          </button>
        </div>
        <div
          ref={containerRef}
          className="aspect-video w-full overflow-hidden rounded-lg border bg-black"
        />
      </div>
    </section>
  );
};
