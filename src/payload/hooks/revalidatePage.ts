import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  TypeWithID,
} from 'payload';
import { safeRevalidatePath, safeRevalidateTag } from './revalidate';

// ============================================================================
// revalidateCollection / revalidateDeleteCollection
// ============================================================================

type RevalidateDoc = TypeWithID & Record<string, unknown>;

type RevalidateOptions<T extends TypeWithID = RevalidateDoc> = {
  entity: string;
  getPath?: (doc: T) => string | undefined;
  getTags?: (doc: T) => string[] | string | undefined;
};

export const revalidateCollection = <T extends TypeWithID = RevalidateDoc>({
  entity,
  getPath,
  getTags,
}: RevalidateOptions<T>): CollectionAfterChangeHook<T> => {
  return async ({ doc, req: { payload, context } }) => {
    if (!context.disableRevalidate) {
      if (getPath) {
        const path = getPath(doc);
        if (path) {
          payload.logger.info(`Revalidating ${entity} at path: ${path}`);
          safeRevalidatePath(path);
        }
      }
      if (getTags) {
        const tags = getTags(doc);
        const tagsArray = Array.isArray(tags) ? tags : [tags];
        for (const tag of tagsArray) {
          if (tag) {
            payload.logger.info(`Revalidating ${entity} with tag: ${tag}`);
            safeRevalidateTag(tag);
          }
        }
      }
    }
    return doc;
  };
};

export const revalidateDeleteCollection = <
  T extends TypeWithID = RevalidateDoc,
>({
  entity,
  getPath,
  getTags,
}: RevalidateOptions<T>): CollectionAfterDeleteHook<T> => {
  return async ({ doc, req: { payload, context } }) => {
    if (!context.disableRevalidate) {
      if (getPath) {
        const path = getPath(doc);
        if (path) {
          payload.logger.info(
            `Revalidating deleted ${entity} at path: ${path}`
          );
          safeRevalidatePath(path);
        }
      }
      if (getTags) {
        const tags = getTags(doc);
        const tagsArray = Array.isArray(tags) ? tags : [tags];
        for (const tag of tagsArray) {
          if (tag) {
            payload.logger.info(
              `Revalidating deleted ${entity} with tag: ${tag}`
            );
            safeRevalidateTag(tag);
          }
        }
      }
    }
    return doc;
  };
};
