'use client';

import { FC, JSX } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="select-none text-[9rem] font-bold leading-none tracking-tighter text-foreground/50 md:text-[13rem]">
          404
        </span>
      </motion.div>

      {/* Разделитель */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mb-6 h-px w-24 bg-border"
      />

      {/* Текст */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mb-8 space-y-2"
      >
        <h1 className="text-xl font-bold uppercase tracking-widest">
          Страница не найдена
        </h1>
        <p className="text-muted-foreground mx-auto max-w-sm text-sm">
          Возможно, запрашиваемая страница была перемещена или больше не
          существует
        </p>
      </motion.div>

      {/* Кнопки */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="flex flex-col gap-3 sm:flex-row"
      >
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
      </motion.div>
    </div>
  );
};

export default NotFound;
