import { CollectionConfig } from 'payload';

import { adminOnly } from '@/access';
import { slugField } from '@/fields/slug';
import {
  MEDIA_CONTENT_STATUS,
  MEDIA_CONTENT_TYPES,
  GENRES,
  COLLECTION_SLUGS,
  MEDIA_CONTENT_PERSONAL_OPINION,
} from '@/utilities/constants';
import { populateList } from '@/collections/MediaContents/hooks/populateList';
import { syncDates } from '@/collections/MediaContents/hooks/syncDates';
import { syncCollectionCounts } from '@/collections/MediaContents/hooks/syncCollectionCounts';
import { convertMarkdownReview } from '@/collections/MediaContents/hooks/convertMarkdownReview';
import {
  revalidateDelete,
  revalidateList,
} from '@/collections/MediaContents/hooks/revalidateList';

export const MediaContents: CollectionConfig = {
  slug: COLLECTION_SLUGS.mediaContents,
  labels: {
    singular: 'Медиа-Содержимое',
    plural: 'Медиа-Содержимое',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    defaultColumns: ['title', 'type', 'collections', 'personalOpinion'],
    group: 'Контент',
  },
  fields: [
    {
      name: 'kpSearch',
      type: 'ui',
      admin: {
        components: {
          Field: '@/collections/MediaContents/fields/kp.tsx#KpSearch',
        },
      },
    },
    {
      name: 'tmdbSearch',
      type: 'ui',
      admin: {
        components: {
          Field: '@/collections/MediaContents/fields/tmdb.tsx#TmdbSearch',
        },
      },
    },
    // Основная информация (Main)
    {
      name: 'title',
      type: 'text',
      label: 'Название (RU)',
      required: true,
      admin: {
        description: 'Название фильма или сериала на русском языке',
      },
    },
    {
      name: 'originalTitle',
      type: 'text',
      label: 'Оригинальное название',
      admin: {
        description: 'Название на языке оригинала',
      },
    },
    {
      name: 'copyPrompt',
      type: 'ui',
      admin: {
        components: {
          Field: '@/fields/CopyPromptButton.tsx#CopyPromptButton',
        },
      },
    },
    slugField('originalTitle', { unique: true }),
    {
      name: 'synopsis',
      type: 'textarea',
      label: 'Описание (Синопсис)',
      admin: {
        description: 'Краткое описание фильма или сериала',
      },
    },
    {
      name: 'review',
      type: 'richText',
      label: 'Мой отзыв',
      admin: {
        description: 'Мой отзыв о фильме или сериале',
      },
      hooks: {
        beforeChange: [convertMarkdownReview],
      },
    },
    {
      name: 'seasons',
      type: 'array',
      label: 'Сезоны (для сериалов)',
      admin: {
        condition: (data) => data.type === 'series',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'seasonNumber',
          type: 'number',
          label: 'Номер сезона',
          required: true,
        },
        {
          name: 'review',
          type: 'richText',
          label: 'Отзыв о сезоне',
          hooks: {
            beforeChange: [convertMarkdownReview],
          },
        },
        {
          name: 'personalOpinion',
          type: 'select',
          label: 'Впечатление',
          defaultValue: 'neutral',
          options: [...MEDIA_CONTENT_PERSONAL_OPINION.select],
          admin: {
            condition: (data) => data.status !== 'planned',
          },
        },
        {
          name: 'startDate',
          type: 'date',
          label: 'Начало просмотра',
        },
        {
          name: 'endDate',
          type: 'date',
          label: 'Конец просмотра',
        },
      ],
    },
    {
      name: 'visualTags',
      type: 'text',
      label: 'Визуальные теги',
      admin: {
        description: 'Введите теги через запятую',
      },
    },

    // Боковая панель (Sidebar) - Основные параметры
    {
      name: 'type',
      type: 'select',
      label: 'Тип контента',
      required: true,
      defaultValue: 'film',
      options: [...MEDIA_CONTENT_TYPES.select],
      admin: {
        position: 'sidebar',
        description: 'Тип контента (фильм, сериал и т.д.)',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Статус',
      defaultValue: 'planned',
      options: [...MEDIA_CONTENT_STATUS.select],
      admin: {
        position: 'sidebar',
        description: 'Статус просмотра фильма или сериала',
      },
    },
    {
      name: 'poster',
      type: 'upload',
      label: 'Постер',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
        description: 'Постер фильма или сериала',
      },
    },
    {
      name: 'posterUrl',
      type: 'text',
      label: 'URL постера (резерв)',
      admin: {
        position: 'sidebar',
        description: 'Используется, если файл не загружен в Медиа',
      },
    },

    // Боковая панель (Sidebar) - Оценки и Даты
    {
      name: 'personalOpinion',
      type: 'select',
      label: 'Впечатление',
      defaultValue: 'neutral',
      options: [...MEDIA_CONTENT_PERSONAL_OPINION.select],
      admin: {
        position: 'sidebar',
        condition: (data) => {
          if (data.type === 'series') {
            return data.status !== 'planned' && data.status !== 'watching';
          }
          return data.status !== 'planned' && data.status !== 'watching';
        },
      },
    },
    {
      name: 'tmdbRating',
      type: 'number',
      label: 'Рейтинг TMDB',
      min: 0,
      max: 10,
      admin: {
        position: 'sidebar',
        step: 0.01,
      },
    },
    {
      name: 'kpRating',
      type: 'number',
      label: 'Рейтинг Кинопоиск',
      min: 0,
      max: 10,
      admin: {
        position: 'sidebar',
        step: 0.01,
      },
    },
    {
      name: 'watchDate',
      type: 'date',
      label: 'Дата просмотра',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'watchYear',
      type: 'number',
      label: 'Год просмотра',
      min: 1800,
      max: new Date().getFullYear(),
      admin: {
        position: 'sidebar',
        description: 'Автоматически заполняется из даты просмотра',
      },
    },

    // Боковая панель (Sidebar) - Детали фильма/сериала
    {
      name: 'genres',
      type: 'select',
      label: 'Жанры',
      hasMany: true,
      options: [...GENRES],
      admin: {
        position: 'sidebar',
        description: 'Жанры фильма или сериала',
      },
    },
    {
      name: 'director',
      type: 'text',
      label: 'Режиссёр',
      admin: {
        position: 'sidebar',
        description: 'Режиссёр фильма или сериала',
      },
    },
    {
      name: 'releaseDate',
      type: 'date',
      label: 'Дата выхода',
      admin: {
        position: 'sidebar',
        description: 'Месяц и день релиза (если известно)',
      },
    },
    {
      name: 'releaseYear',
      type: 'number',
      label: 'Год выхода',
      min: 1800,
      max: new Date().getFullYear() + 5,
      admin: {
        position: 'sidebar',
        description: 'Автоматически заполняется из даты выхода',
      },
    },
    {
      name: 'duration',
      type: 'number',
      label: 'Длительность (мин)',
      min: 1,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'seasonCount',
      type: 'number',
      label: 'Количество сезонов',
      min: 1,
      admin: {
        position: 'sidebar',
        condition: (data) => data.type === 'series',
      },
    },
    {
      name: 'episodeCount',
      type: 'number',
      label: 'Количество серий',
      min: 1,
      admin: {
        position: 'sidebar',
        condition: (data) => data.type === 'series' || data.type === 'cartoon',
      },
    },

    // Боковая панель (Sidebar) - Связи
    {
      name: 'kinopoiskId',
      type: 'text',
      label: 'ID Кинопоиск',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'kinoriumId',
      type: 'text',
      label: 'ID Кинориум',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'collections',
      type: 'relationship',
      relationTo: 'collections',
      hasMany: true,
      label: 'Входит в коллекции',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [syncDates],
    afterChange: [populateList, syncCollectionCounts, revalidateList],
    afterDelete: [revalidateDelete],
  },
  timestamps: true,
  indexes: [
    { fields: ['type', 'releaseYear'] },
    { fields: ['personalOpinion', 'watchYear'] },
    { fields: ['title', 'originalTitle'] },
  ],
};
