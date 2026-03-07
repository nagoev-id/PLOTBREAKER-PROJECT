import type { FC } from 'react';

import { METADATA } from '@/lib/constants';
import { getCachedGlobal } from '@/lib/helpers';
import { FooterClient } from '@/payload/globals/Footer/Footer.client';
import type { Footer as FooterGlobal } from '@/payload-types';
import { GLOBAL_SLUGS } from '@/payload/config/globals';

/**
 * Серверный компонент футера приложения.
 *
 * Асинхронно загружает данные глобала `footer` из кэша Payload CMS
 * и передаёт их клиентскому компоненту {@link FooterClient}.
 *
 * @component
 * @returns Клиентский компонент `FooterClient` с данными из CMS
 */

export const Footer: FC = async () => {
  try {
    const footerData = (await getCachedGlobal(
      GLOBAL_SLUGS.footer,
      1
    )()) as FooterGlobal;

    return <FooterClient data={footerData} />;
  } catch (error) {
    console.error('Ошибка загрузки данных подвала:', error);

    const fallbackData: Partial<FooterGlobal> = {
      logo: {
        logoText: METADATA.siteName,
        logoIcon: null,
      },
    };

    return <FooterClient data={fallbackData as FooterGlobal} />;
  }
};
