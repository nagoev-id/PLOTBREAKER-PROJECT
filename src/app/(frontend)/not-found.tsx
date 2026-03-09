'use client';

import { FC, JSX } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Страница 404
 * @returns {JSX.Element} - Элемент страницы 404
 */
const NotFound: FC = (): JSX.Element => {
  const router = useRouter();

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      {/* Число 404 */}
      <div>
        <span className="select-none text-[9rem] font-bold leading-none tracking-tighter text-foreground/50 md:text-[13rem]">
          404
        </span>
      </div>

      {/* Разделитель */}
      <div className="mb-6 h-px w-24 bg-border" />

      {/* Текст */}
      <div className="mb-8 space-y-2">
        <h1 className="text-xl font-bold uppercase tracking-widest">
          Страница не найдена
        </h1>
        <p className="text-muted-foreground mx-auto max-w-sm text-sm">
          Возможно, запрашиваемая страница была перемещена или больше не
          существует
        </p>
      </div>

      {/* Кнопки */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="sm" className="gap-2">
          <Link href="/">
            <Home size={14} />
            На главную
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft size={14} />
          Назад
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
