'use client';

import { createContext, useContext, ReactNode } from 'react';
import { PostCollection } from '@/utilities/types';

// Тип для контекста аутентификации
type PostsContextType = {
  posts: PostCollection[] | null;
};

// Создание контекста аутентификации
const PostsContext = createContext<PostsContextType | undefined>(undefined);

// Провайдер аутентификации
export const PostsProvider = ({
  posts,
  children,
}: {
  posts: PostCollection[] | null;
  children: ReactNode;
}) => {
  return (
    <PostsContext.Provider value={{ posts }}>{children}</PostsContext.Provider>
  );
};

// Хук для использования контекста аутентификации
export const usePosts = () => {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within an PostsProvider');
  }
  return context;
};
