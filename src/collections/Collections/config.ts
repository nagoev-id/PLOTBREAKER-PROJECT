import type { CollectionConfig } from 'payload';

import { adminOnly } from '@/access';
import { slugField } from '@/fields/slug';
import {
  revalidateDelete,
  revalidateList,
} from '@/collections/Collections/hooks/revalidateList';
import { updateItemCount } from '@/collections/Collections/hooks/updateItemCount';
import { COLLECTION_SLUGS } from '@/utilities/constants';
import { convertMarkdownReview } from '@/collections/Collections/hooks/convertMarkdownReview';

/**
 * Коллекция "Коллекции" (Collections).
 * Используется для группировки медиа-контента в именованные списки (например, "Избранное", "Посмотреть позже").
 */
export const Collections: CollectionConfig = {
  slug: COLLECTION_SLUGS.collections,
  labels: {
    singular: 'Подборка',
    plural: 'Подборки',
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
    // Поле для названия списка
    {
      name: 'title',
      type: 'text',
      label: 'Название списка',
      required: true,
      unique: true,
    },
    // Поле для генерации URL-адреса списка на основе названия
    slugField('title', { unique: true }),
    // Поле для описания списка
    {
      name: 'description',
      type: 'richText',
      label: 'Описание списка',
      hooks: {
        beforeChange: [convertMarkdownReview],
      },
    },
    // Поле для определения, является ли список общедоступным
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
      name: 'isTheme',
      type: 'checkbox',
      label: 'Тематический список',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Если включено, список будет виден всем посетителям сайта и будет отображаться в разделе "Темы".',
      },
    },
    // Поле для отображения количества элементов в списке
    // Поле обновляется автоматически через хук beforeChange
    {
      name: 'itemCount',
      type: 'number',
      label: 'Количество элементов',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description:
          'Обновляется автоматически при сохранении на основе связанных элементов.',
      },
    },
    // Поле для отображения связанных элементов медиа-контента
    {
      name: 'items',
      type: 'join',
      collection: COLLECTION_SLUGS.mediaContents,
      on: 'collections',
      label: 'Медиа контент в списке',
    },
  ],
  hooks: {
    // Хук для пересчета количества элементов перед сохранением
    beforeChange: [updateItemCount],
    // Хуки для сброса кеша (revalidation) после изменения или удаления
    afterChange: [revalidateList],
    afterDelete: [revalidateDelete],
  },
  // Поле для хранения времени создания и обновления записи
  timestamps: true,
};
