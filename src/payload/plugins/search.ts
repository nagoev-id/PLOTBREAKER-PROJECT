import { searchPlugin } from '@payloadcms/plugin-search';
import { COLLECTION_SLUGS } from '@/payload/config/collections';

/**
 * Конфигурация плагина полнотекстового поиска Payload CMS.
 *
 * Индексирует коллекции {@link COLLECTION_SLUGS.titles} и
 * {@link COLLECTION_SLUGS.posts}, объединяя ключевые текстовые поля
 * (`title`, `originalTitle`, `director`) в единое поле `keywords`
 * для повышения релевантности поиска.
 *
 * Результаты хранятся в служебной коллекции `search-results`.
 */
export const search = searchPlugin({
  collections: [COLLECTION_SLUGS.titles, COLLECTION_SLUGS.posts],
  defaultPriorities: {
    [COLLECTION_SLUGS.titles]: 10,
    [COLLECTION_SLUGS.posts]: 5,
  },
  beforeSync: ({ originalDoc, searchDoc }) => ({
    ...searchDoc,
    title: originalDoc.title || searchDoc.title,
    keywords: [
      originalDoc.title,
      originalDoc.originalTitle,
      originalDoc.director,
    ]
      .filter(Boolean)
      .join(' '),
  }),
  searchOverrides: {
    slug: 'search-results',
    labels: {
      singular: 'Результат поиска',
      plural: 'Результаты поиска',
    },
    admin: {
      group: 'Настройки',
      //   hidden: true,
    },
    fields: ({ defaultFields }) => [
      ...defaultFields,
      {
        name: 'keywords',
        type: 'text',
        admin: { readOnly: true },
      },
    ],
  },
});
