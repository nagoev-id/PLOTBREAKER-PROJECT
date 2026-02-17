import { CollectionConfig } from 'payload';
import { adminOnly } from '@/access';
import { slugField } from '@/fields/slug';
import { Hero } from '@/blocks/Hero/config';
import { About } from '@/blocks/About/config';
import { COLLECTION_SLUGS } from '@/utilities/constants';

/**
 * Коллекция "Страницы" для создания произвольных посадочных страниц.
 *
 * Позволяет конструировать страницы из готовых блоков
 * и управлять их URL через слаги.
 */
export const Pages: CollectionConfig = {
  slug: COLLECTION_SLUGS.pages,
  labels: {
    singular: 'Страница',
    plural: 'Страницы',
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
      required: true,
      label: 'Заголовок',
    },
    slugField('title'),
    {
      name: 'layout',
      label: 'Структура страницы',
      type: 'blocks',
      blocks: [Hero, About],
      admin: {
        initCollapsed: true,
      },
    },
  ],
};
