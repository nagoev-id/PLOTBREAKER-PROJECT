import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import localFont from 'next/font/local';

/**
 * Объединяет CSS классы с помощью Tailwind CSS.
 * @param inputs - CSS классы для объединения.
 * @returns Объединенные CSS классы.
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/**
 * Конфигурация локального шрифта Euclid Circular B.
 * Поддерживает веса 300, 400, 500, 600, 700.
 * Использует variable-шрифт для интеграции с Tailwind CSS (--font-euclid).
 */
export const euclid = localFont({
  src: [
    {
      path: '../../public/fonts/EuclidCircularB-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/EuclidCircularB-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/EuclidCircularB-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/EuclidCircularB-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/EuclidCircularB-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-euclid',
});

/**
 * Форматирует дату.
 * @param date - Дата в формате строки.
 * @returns Отформатированная дата.
 */
export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

/**
 * Определяет тип контента по заголовку коллекции.
 * @param title - Заголовок коллекции.
 * @returns Тип контента ('film', 'series', 'cartoon').
 */
export const getTypeKey = (title: string): string => {
  const lower = title.toLowerCase();
  if (lower.includes('мультфильм')) return 'cartoon';
  if (lower.includes('сериал')) return 'series';
  return 'film';
};
