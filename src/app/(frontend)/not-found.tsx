'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] bg-gradient-to-b from-slate-50 to-white px-4 text-center overflow-hidden">
      {/* Декоративный фон */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Число 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        >
          <h1 className="text-[10rem] md:text-[14rem] font-bold leading-none font-heading bg-gradient-to-br from-teal-500 via-teal-600 to-teal-800 bg-clip-text text-transparent select-none">
            404
          </h1>
        </motion.div>

        {/* Текст */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-3 mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 font-heading">
            Страница не найдена
          </h2>
          <p className="text-slate-500 max-w-md text-base md:text-lg">
            К сожалению, запрашиваемая страница не существует или была
            перемещена
          </p>
        </motion.div>

        {/* Кнопки */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            asChild
            size="lg"
            className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20 gap-2"
          >
            <Link href="/">
              <Home className="w-4 h-4" />
              На главную
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => window.history.back()}
          >
            <span className="cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              Назад
            </span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
