import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload';
import { revalidateTag } from 'next/cache';
import { CollectionCollection } from '@/utilities/types';

// Безопасная обёртка для revalidateTag — не падает вне контекста Next.js (CLI, jobs)
const safeRevalidateTag = (tag: string): void => {
  try {
    revalidateTag(tag);
  } catch {
    // Вне Next.js контекста revalidateTag недоступен — игнорируем
  }
};

export const revalidateList: CollectionAfterChangeHook<
  CollectionCollection
> = async ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    if (doc.slug) {
      const tag = `list_${doc.slug}`;
      payload.logger.info(`Revalidating list with tag: ${tag}`);
      safeRevalidateTag(tag);
    }
  }
  return doc;
};

export const revalidateDelete: CollectionAfterDeleteHook<
  CollectionCollection
> = async ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    if (doc.slug) {
      const tag = `list_${doc.slug}`;
      safeRevalidateTag(tag);
    }
  }

  return doc;
};
