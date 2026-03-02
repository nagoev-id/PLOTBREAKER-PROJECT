import { cn } from '@/utilities/utils';
import { FC, JSX } from 'react';

type SynopsisBlockProps = {
  synopsis: string;
  className?: string;
};

/**
 * Компонент блока с кратким описанием
 *
 * @param synopsis - Краткое описание
 * @param className - Дополнительные классы
 * @returns Блок с кратким описанием
 */
export const SynopsisBlock: FC<SynopsisBlockProps> = ({
  synopsis,
  className,
}): JSX.Element => (
  <div className={cn('space-y-2', className)}>
    <h3 className="text-xl font-bold uppercase">Краткое описание</h3>
    <p className="text-muted-foreground text-base leading-relaxed lg:text-lg">
      {synopsis}
    </p>
  </div>
);
