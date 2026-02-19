import { Spinner } from '@/components/ui/spinner';
import { FC, JSX } from 'react';

/**
 * Компонент спиннера загрузки
 * @returns {JSX.Element}
 */
export const LoadingSpinner: FC = (): JSX.Element => {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Spinner className="h-10 w-10" />
    </div>
  );
};
