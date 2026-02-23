'use client';

import { createContext, useContext, ReactNode } from 'react';
import { UserCollection } from '@/utilities/types';

// Тип для контекста аутентификации
type AuthContextType = {
  user: UserCollection | null;
};

// Создание контекста аутентификации
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер аутентификации
export const AuthProvider = ({
  user,
  children,
}: {
  user: UserCollection | null;
  children: ReactNode;
}) => {
  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

// Хук для использования контекста аутентификации
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
