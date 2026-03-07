import type { FC } from 'react';

import { METADATA } from '@/lib/constants';
import { getCachedGlobal, getAuthUser } from '@/lib/helpers';
import { HeaderClient } from '@/payload/globals/Header/Header.client';
import type { Header as HeaderGlobal } from '@/payload-types';
import { GLOBAL_SLUGS } from '@/payload/config/globals';

/**
 * Серверный компонент шапки приложения.
 *
 * Асинхронно выполняет две операции параллельно:
 * - Аутентифицирует текущего пользователя через Payload CMS
 *   на основе входящих HTTP-заголовков (`headers`)
 * - Загружает данные глобала `header` из кэша через {@link getCachedGlobal}
 *
 * Передаёт полученные данные и объект пользователя клиентскому
 * компоненту {@link HeaderClient}.
 *
 * В случае ошибки (недоступность CMS, сбой авторизации) логирует её
 * и рендерит шапку с минимальными fallback-данными: названием сайта
 * из {@link METADATA}, пустым массивом навигации и `user: null`.
 *
 * @component
 * @returns Клиентский компонент `HeaderClient` с данными из CMS и
 *          текущим пользователем, либо с fallback-данными при ошибке
 */
export const Header: FC = async () => {
  try {
    const user = await getAuthUser();

    const headerData: HeaderGlobal = (await getCachedGlobal(
      GLOBAL_SLUGS.header,
      1
    )()) as unknown as HeaderGlobal;

    return <HeaderClient data={headerData} user={user} />;
  } catch (error) {
    console.error('Ошибка при загрузке данных шапки:', error);

    const fallbackData: Partial<HeaderGlobal> = {
      logo: {
        logoText: METADATA.siteName,
        logoIcon: null,
      },
      navItems: [],
    };

    return <HeaderClient data={fallbackData as HeaderGlobal} user={null} />;
  }
};
