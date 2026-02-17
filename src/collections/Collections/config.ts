import { adminOnly } from '@/access';
import { CollectionConfig } from 'payload';
import { slugField } from '@/fields/slug';
import {
  revalidateDelete,
  revalidateList,
} from '@/collections/Collections/hooks/revalidateList';
import { updateItemCount } from '@/collections/Collections/hooks/updateItemCount';
import { COLLECTION_SLUGS } from '@/utilities/constants';

/**
 * Коллекция "Коллекции"
 */
export const Collections: CollectionConfig = {
  slug: COLLECTION_SLUGS.collections,
  labels: {
    singular: 'Коллекция',
    plural: 'Коллекции',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Контент',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Название списка',
      required: true,
      unique: true,
    },
    slugField('title'),
    {
      name: 'description',
      type: 'richText',
      label: 'Описание списка',
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      label: 'Общедоступный список',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description:
          'Если включено, список будет виден всем посетителям сайта.',
      },
    },
    {
      name: 'itemCount',
      type: 'number',
      label: 'Количество элементов',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Обновляется автоматически при сохранении.',
      },
    },
    {
      name: 'items',
      type: 'join',
      collection: COLLECTION_SLUGS.mediaContents,
      on: 'collections',
      label: 'Медиа контент в списке',
    },
  ],
  hooks: {
    beforeChange: [updateItemCount],
    afterChange: [revalidateList],
    afterDelete: [revalidateDelete],
  },
  timestamps: true,
};
