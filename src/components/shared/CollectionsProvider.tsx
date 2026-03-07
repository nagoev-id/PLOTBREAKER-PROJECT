'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { List } from '@/payload-types';

// Тип для контекста аутентификации
type CollectionsContextType = {
  collections: List[] | null;
};

// Создание контекста аутентификации
const CollectionsContext = createContext<CollectionsContextType | undefined>(
  undefined
);

// Провайдер аутентификации
export const CollectionsProvider = ({
  collections,
  children,
}: {
  collections: List[] | null;
  children: ReactNode;
}) => {
  return (
    <CollectionsContext.Provider value={{ collections }}>
      {children}
    </CollectionsContext.Provider>
  );
};

// Хук для использования контекста аутентификации
export const useCollections = () => {
  const context = useContext(CollectionsContext);
  if (context === undefined) {
    throw new Error(
      'useCollections must be used within an CollectionsProvider'
    );
  }
  return context;
};
