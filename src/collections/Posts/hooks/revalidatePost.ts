'use server';
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload';

import { revalidatePath, revalidateTag } from 'next/cache';

// Безопасные обёртки — не падают вне контекста Next.js (CLI, jobs)
const safeRevalidatePath = (path: string): void => {
  try {
    revalidatePath(path);
  } catch {
    // Вне Next.js контекста revalidatePath недоступен — игнорируем
  }
};

const safeRevalidateTag = (tag: string): void => {
  try {
    revalidateTag(tag);
  } catch {
    // Вне Next.js контекста revalidateTag недоступен — игнорируем
  }
};

/**
 * Инвалидирует кэш страницы поста после изменения.
 */
export const revalidatePost: CollectionAfterChangeHook = async ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    const path = `/posts/${doc.slug}`;
    payload.logger.info(`Revalidating post at path: ${path}`);
    safeRevalidatePath(path);
    safeRevalidateTag('posts-sitemap');
  }
  return doc;
};

/**
 * Инвалидирует кэш страницы поста после удаления.
 */
export const revalidateDelete: CollectionAfterDeleteHook = async ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    const path = `/posts/${doc?.slug}`;
    safeRevalidatePath(path);
    safeRevalidateTag('posts-sitemap');
  }
  return doc;
};
