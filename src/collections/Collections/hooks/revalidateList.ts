import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload';
import { revalidateTag } from 'next/cache';
import { CollectionCollection } from '@/utilities/types';

export const revalidateList: CollectionAfterChangeHook<
  CollectionCollection
> = async ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    if (doc.slug) {
      const tag = `list_${doc.slug}`;
      payload.logger.info(`Revalidating list with tag: ${tag}`);
      revalidateTag(tag);
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
      revalidateTag(tag);
    }
  }

  return doc;
};
