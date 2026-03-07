'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { Title } from '@/payload-types';

// Тип для контекста медиа-контента
type MediaContentsContextType = {
  mediaContents: Title[] | null;
};

// Создание контекста медиа-контента
const MediaContentsContext = createContext<
  MediaContentsContextType | undefined
>(undefined);

// Провайдер медиа-контента
export const MediaContentsProvider = ({
  mediaContents,
  children,
}: {
  mediaContents: Title[] | null;
  children: ReactNode;
}) => {
  return (
    <MediaContentsContext.Provider value={{ mediaContents }}>
      {children}
    </MediaContentsContext.Provider>
  );
};

// Хук для использования контекста медиа-контента
export const useMediaContents = () => {
  const context = useContext(MediaContentsContext);
  if (context === undefined) {
    throw new Error(
      'useMediaContents must be used within an MediaContentsProvider'
    );
  }
  return context;
};
