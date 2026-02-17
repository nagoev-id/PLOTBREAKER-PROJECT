import { CollectionBeforeChangeHook } from 'payload';
import { CollectionCollection } from '@/utilities/types';

export const updateItemCount: CollectionBeforeChangeHook<
  CollectionCollection
> = async ({ data }) => {
  if (data && 'items' in data) {
    const items = data.items || [];
    data.itemCount = Array.isArray(items) ? items.length : 0;
  }
  return data;
};
