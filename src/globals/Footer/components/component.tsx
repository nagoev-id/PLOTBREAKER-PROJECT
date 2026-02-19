import type { FC } from 'react';

import { METADATA } from '@/utilities/constants';
import { getCachedGlobal } from '@/utilities/helpers';
import { FooterClient } from '@/globals/Footer/components/component.client';
import { FooterGlobal } from '@/utilities/types';

/**
 * Серверный компонент подвала сайта
 *
 * Компонент выполняет на сервере следующие задачи:
 * - Загружает данные подвала из кешированного глобального объекта Payload CMS
 * - Передает данные в клиентский компонент для рендеринга
 * - Обеспечивает SSR и кеширование для оптимальной производительности
 *
 * @returns Отрендеренный подвал сайта
 */
export const Footer: FC = async () => {
  try {
    // Загружаем данные подвала из кешированного глобального объекта
    // getCachedGlobal обеспечивает оптимальную производительность через кеширование
    const footerData: FooterGlobal = (await getCachedGlobal(
      'footer',
      1
    )()) as unknown as FooterGlobal;

    // Передаем данные в клиентский компонент для интерактивной функциональности
    return <FooterClient data={footerData} />;
  } catch (error) {
    console.error('Error loading footer data:', error);

    // В случае ошибки возвращаем подвал с данными по умолчанию
    // Это обеспечивает отказоустойчивость компонента
    const fallbackData: Partial<FooterGlobal> = {
      logo: {
        logoText: METADATA.siteName,
        logoIcon: null,
      },
    };

    return <FooterClient data={fallbackData as FooterGlobal} />;
  }
};
