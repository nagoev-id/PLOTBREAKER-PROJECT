import { adminOnly } from '@/access';
import { CollectionConfig } from 'payload';

import { slugField } from '@/fields/slug';
import {
  revalidatePost,
  revalidateDelete,
} from '@/collections/Posts/hooks/revalidatePost';
import { COLLECTION_SLUGS } from '@/utilities/constants';

export const Posts: CollectionConfig = {
  slug: COLLECTION_SLUGS.posts,
  labels: {
    singular: 'Запись',
    plural: 'Записи',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'tags', 'publishedAt', 'updatedAt'],
    group: 'Контент',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    // Основная область (Main)
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Заголовок',
    },
    slugField('title'),
    {
      name: 'content',
      type: 'richText',
      label: 'Контент',
      required: true,
    },

    // Боковая панель (Sidebar)
    {
      name: 'heroImage',
      type: 'upload',
      label: 'Изображение',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'select',
      label: 'Теги',
      hasMany: true,
      options: [
        { label: 'Обзор', value: 'review' },
        { label: 'Новости', value: 'news' },
        { label: 'Подборка', value: 'collection' },
        { label: 'Мнение', value: 'opinion' },
        { label: 'Гайд', value: 'guide' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Дата публикации',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ value }) => {
            // Автозаполнение датой создания, если не указана
            if (!value) return new Date().toISOString();
            return value;
          },
        ],
      },
    },
  ],
  hooks: {
    afterChange: [revalidatePost],
    afterDelete: [revalidateDelete],
  },
  timestamps: true,
};
