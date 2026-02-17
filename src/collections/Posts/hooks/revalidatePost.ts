'use server';
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload';

import { revalidatePath, revalidateTag } from 'next/cache';

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
    revalidatePath(path);
    revalidateTag('posts-sitemap');
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
    revalidatePath(path);
    revalidateTag('posts-sitemap');
  }
  return doc;
};
