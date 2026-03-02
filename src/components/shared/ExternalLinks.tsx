import { Badge } from '@/components/ui/badge';
import { ExternalLink, Play } from 'lucide-react';
import Link from 'next/link';
import { FC, JSX } from 'react';
import { SidebarSection } from '@/components/shared/SidebarSection';
import { cn } from '@/utilities/utils';

type ExternalLinksProps = {
  kinopoiskId: number | string;
  kinoriumId?: number | string | null;
  originalTitle?: string | null;
  variant?: 'default' | 'secondary';
  className?: string;
  showKinoBd?: boolean;
  onToggleKinoBd?: () => void;
};

/**
 * Внешние ссылки (Кинопоиск, Кинориум, FRKP, HDRezka, KinoBD)
 * @param kinopoiskId - ID фильма на Кинопоиске
 * @param kinoriumId - ID фильма на Кинориуме
 * @param originalTitle - Оригинальное название фильма
 * @param variant - Вариант отображения
 * @param className - Дополнительные классы
 * @param showKinoBd - Показывать KinoBD
 * @param onToggleKinoBd - Функция переключения KinoBD
 * @returns {JSX.Element}
 */
export const ExternalLinks: FC<ExternalLinksProps> = ({
  kinopoiskId,
  kinoriumId,
  originalTitle,
  variant,
  className,
  showKinoBd,
  onToggleKinoBd,
}): JSX.Element => (
  <SidebarSection title="Ссылки" contentClassName="flex flex-wrap gap-1.5">
    <Link
      href={`https://www.kinopoisk.ru/film/${kinopoiskId}/`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Badge
        variant={variant}
        className={cn(
          'inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-3 py-1 transition-colors ',
          variant === 'default' ? 'hover:bg-primary/20' : ''
        )}
      >
        <ExternalLink size={12} />
        Кинопоиск
      </Badge>
    </Link>

    {kinoriumId && (
      <Link
        href={`https://kinorium.com/${kinoriumId}/`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Badge
          variant={variant}
          className={cn(
            'inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-3 py-1 transition-colors ',
            variant === 'default' ? 'hover:bg-primary/20' : ''
          )}
        >
          <ExternalLink size={12} />
          Кинориум
        </Badge>
      </Link>
    )}

    <Link
      href={`https://www.kinopoisk.cx/film/${kinopoiskId}/`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Badge
        variant={variant}
        className={cn(
          'inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-3 py-1 transition-colors ',
          variant === 'default' ? 'hover:bg-primary/20' : ''
        )}
      >
        <Play size={12} />
        FRKP
      </Badge>
    </Link>

    <Link
      href={`https://flymaterez.net/search/?do=search&subaction=search&q=${originalTitle ?? ''}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Badge
        variant={variant}
        className={cn(
          'inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-3 py-1 transition-colors ',
          variant === 'default' ? 'hover:bg-primary/20' : ''
        )}
      >
        <Play size={12} />
        HDRezka
      </Badge>
    </Link>

    {onToggleKinoBd && (
      <Badge
        variant={variant}
        onClick={onToggleKinoBd}
        className={cn(
          'inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-3 py-1 transition-colors ',
          variant === 'default' ? 'hover:bg-primary/20' : ''
        )}
      >
        <Play size={12} />
        {showKinoBd ? 'Скрыть KinoBD' : 'KinoBD'}
      </Badge>
    )}
  </SidebarSection>
);
