import localFont from 'next/font/local';

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
