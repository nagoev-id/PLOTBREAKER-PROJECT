import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload';
import { revalidateTag } from 'next/cache';
import { MediaContentCollection } from '@/utilities/types';

// Безопасная обёртка для revalidateTag — не падает вне контекста Next.js (CLI, jobs)
const safeRevalidateTag = (tag: string): void => {
  try {
    revalidateTag(tag);
  } catch {
    // Вне Next.js контекста revalidateTag недоступен — игнорируем
  }
};

export const revalidateList: CollectionAfterChangeHook<
  MediaContentCollection
> = async ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    // Revalidate the "all" fetch
    payload.logger.info(`Revalidating media contents list`);
    safeRevalidateTag('media-contents');

    // Also revalidate any collections this item belongs to
    if (doc.collections && Array.isArray(doc.collections)) {
      doc.collections.forEach((collection) => {
        // collection can be either an ID or populated object
        if (
          typeof collection === 'object' &&
          collection !== null &&
          'slug' in collection
        ) {
          safeRevalidateTag(`collection_${collection.slug}`);
          safeRevalidateTag(`list_${collection.slug}`);
          payload.logger.info(`Revalidating collection ${collection.slug}`);
        } else if (
          typeof collection === 'number' ||
          typeof collection === 'string'
        ) {
          // If it's just an ID, we might not know the slug easily, but the global lists tag will clear
        }
      });
    }

    if (doc.slug) {
      safeRevalidateTag(`media_${doc.slug}`);
    }
  }
  return doc;
};

export const revalidateDelete: CollectionAfterDeleteHook<
  MediaContentCollection
> = async ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    safeRevalidateTag('media-contents');

    if (doc.collections && Array.isArray(doc.collections)) {
      doc.collections.forEach((collection) => {
        if (
          typeof collection === 'object' &&
          collection !== null &&
          'slug' in collection
        ) {
          safeRevalidateTag(`collection_${collection.slug}`);
          safeRevalidateTag(`list_${collection.slug}`);
        }
      });
    }

    if (doc.slug) {
      safeRevalidateTag(`media_${doc.slug}`);
    }
  }

  return doc;
};
