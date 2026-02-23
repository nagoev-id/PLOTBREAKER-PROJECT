'use client';

import { createContext, useContext, ReactNode } from 'react';
import { MediaContentCollection } from '@/utilities/types';

// Тип для контекста медиа-контента
type MediaContentsContextType = {
  mediaContents: MediaContentCollection[] | null;
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
  mediaContents: MediaContentCollection[] | null;
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
