import { FC, JSX } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  title: string | null | undefined;
  text: string | null | undefined;
  className?: string;
};

export const SectionHeading: FC<Props> = ({
  title,
  text,
  className,
}): JSX.Element => {
  if (!title && !text) return <></>;

  return (
    <div className={cn('text-center space-y-1 md:space-y-2', className)}>
      {title && (
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h2>
      )}
      {text && (
        <div className="text-muted-foreground mx-auto max-w-3xl text-base leading-relaxed md:text-lg">
          {text}
        </div>
      )}
    </div>
  );
};
