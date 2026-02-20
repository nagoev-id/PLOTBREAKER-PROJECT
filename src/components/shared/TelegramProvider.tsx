'use client';

import { init } from '@telegram-apps/sdk';
import { FC, ReactNode, useEffect, useState } from 'react';

/**
 * Тип пропсов для провайдера Telegram SDK
 */
interface TelegramProviderProps {
  children: ReactNode;
}

/**
 * Провайдер Telegram SDK
 *
 * Оборачивает приложение для инициализации Telegram Web App.
 *
 * @param props - Пропсы компонента
 * @param props.children - Дочерние элементы
 * @returns Контейнер с инициализированным SDK
 */
export const TelegramProvider: FC<TelegramProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      // Инициализация Telegram SDK
      init();
    } catch (e) {
      console.warn('Telegram SDK init fail', e);
    }

    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return <>{children}</>;
};
