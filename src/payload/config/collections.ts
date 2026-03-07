import { CollectionConfig } from 'payload';

import { admin, anyone } from '@/payload/access';
import { updateItemCount } from '@/payload/collections/Lists/hooks';
import { richTextField } from '@/payload/fields/richText';
import {
  revalidateCollection,
  revalidateDeleteCollection,
} from '@/payload/hooks/revalidatePage';
import { slugField } from '@/payload/fields/slug';
import { setPublishedAt } from '@/payload/hooks/setPublishedAt';
import {
  populateList,
  syncCollectionCounts,
  syncDates,
  syncWatchDate,
  syncPersonalOpinion,
} from '@/payload/collections/Titles/hooks';
import {
  COLLECTION_SLUGS,
  GENRES,
  MEDIA_CONTENT_PERSONAL_OPINION,
  MEDIA_CONTENT_STATUS,
  MEDIA_CONTENT_TYPES,
} from '@/lib/constants';
import { formatVisualTags } from '@/payload/hooks/formatVisualTags';
import { ABOUT_BLOCK, HERO_BLOCK } from '@/payload/config/blocks';

export const MIME_TYPES = [
  'image/*',
  'application/pdf',
  'application/zip',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const IMAGE_SIZES = [
  {
    name: 'thumbnail',
    width: 400,
    height: 400,
    position: 'centre' as const,
  },
  {
    name: 'card',
    width: 800,
    height: 600,
    position: 'centre' as const,
  },
];

// Ре-экспорт для обратной совместимости
export { COLLECTION_SLUGS } from '@/lib/constants';

// Коллекция - Пользователи
export const USERS_COLLECTION = {
  slug: COLLECTION_SLUGS.users,
  labels: {
    singular: 'Пользователь',
    plural: 'Пользователи',
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'username'],
    group: 'Настройки',
  },
  access: {
    read: admin,
    create: admin,
    update: admin,
    delete: admin,
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30,
    useAPIKey: true,
    loginWithUsername: true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Имя пользователя',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      label: 'Почта',
      required: true,
      unique: true,
    },
    {
      name: 'username',
      type: 'text',
      label: 'Логин',
      required: true,
      unique: true,
    },
  ],
} as unknown as CollectionConfig;

// Коллекция - Пользователи
export const MEDIA_COLLECTION = {
  slug: 'media',
  labels: {
    singular: 'Медиа',
    plural: 'Медиа',
  },
  admin: {
    group: 'Настройки',
  },
  access: {
    read: anyone,
    create: admin,
    update: admin,
    delete: admin,
  },
  folders: true,
  upload: {
    mimeTypes: MIME_TYPES,
    imageSizes: IMAGE_SIZES,
    adminThumbnail: 'thumbnail',
    focalPoint: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Альтернативный текст',
      required: true,
    },
  ],
} as unknown as CollectionConfig;

// Коллекция - Страницы
export const PAGES_COLLECTION = {
  slug: 'pages',
  labels: {
    singular: 'Страница',
    plural: 'Страницы',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug'],
    group: 'Настройки',
  },
  access: {
    read: admin,
    create: admin,
    update: admin,
    delete: admin,
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
      blocks: [HERO_BLOCK, ABOUT_BLOCK],
      admin: {
        initCollapsed: true,
      },
    },
  ],
} as unknown as CollectionConfig;

// Коллекция - Записи
export const TITLES_COLLECTION = {
  slug: COLLECTION_SLUGS.titles,
  dbName: 'media_contents',
  labels: {
    singular: 'Контент',
    plural: 'Контент',
  },
  access: {
    read: admin,
    create: admin,
    update: admin,
    delete: admin,
  },
  admin: {
    defaultColumns: ['title', 'type', 'collections'],
    group: 'Контент',
  },
  fields: [
    {
      name: 'kpSearch',
      type: 'ui',
      admin: {
        components: {
          Field: '@/payload/collections/Titles/fields/kp.tsx#KpSearch',
        },
      },
    },
    {
      name: 'tmdbSearch',
      type: 'ui',
      admin: {
        components: {
          Field: '@/payload/collections/Titles/fields/tmdb.tsx#TmdbSearch',
        },
      },
    },
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
          Field: '@/payload/fields/сopyPrompt.tsx#CopyPromptButton',
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
    richTextField({
      label: 'Мой отзыв',
      description: 'Мой отзыв о фильме или сериале',
    }),
    {
      name: 'seasons',
      type: 'array',
      label: 'Сезоны (для сериалов)',
      admin: {
        condition: (data: Record<string, unknown>) => data.type === 'series',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'seasonNumber',
          type: 'number',
          label: 'Номер сезона',
          required: true,
        },
        richTextField({ label: 'Отзыв о сезоне' }),
        {
          name: 'personalOpinion',
          type: 'select',
          label: 'Впечатление',
          defaultValue: 'neutral',
          options: [...MEDIA_CONTENT_PERSONAL_OPINION.select],
          admin: {
            condition: (data: Record<string, unknown>) =>
              data.status !== 'planned',
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
      hooks: {
        beforeChange: [formatVisualTags],
      },
    },

    // Sidebar
    {
      name: 'isPublished',
      type: 'checkbox',
      label: 'Опубликовано',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Отображать запись на сайте',
      },
    },
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
    {
      name: 'personalOpinion',
      type: 'select',
      label: 'Впечатление',
      defaultValue: 'neutral',
      options: [...MEDIA_CONTENT_PERSONAL_OPINION.select],
      admin: {
        position: 'sidebar',
        description: 'Автоматически устанавливается при статусе "Планирую"',
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
        description: 'Для сериалов вычисляется автоматически из дат сезонов',
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
      name: 'seasonCount',
      type: 'number',
      label: 'Количество сезонов',
      min: 1,
      admin: {
        position: 'sidebar',
        condition: (data: Record<string, unknown>) => data.type === 'series',
      },
    },
    {
      name: 'episodeCount',
      type: 'number',
      label: 'Количество серий',
      min: 1,
      admin: {
        position: 'sidebar',
        condition: (data: Record<string, unknown>) =>
          data.type === 'series' || data.type === 'cartoon',
      },
    },
    {
      name: 'kinopoiskId',
      type: 'text',
      label: 'ID Кинопоиск',
      admin: {
        position: 'sidebar',
      },
    },

    {
      name: 'collections',
      type: 'relationship',
      relationTo: COLLECTION_SLUGS.lists,
      hasMany: true,
      label: 'Входит в подборки',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [syncDates, syncWatchDate, syncPersonalOpinion],
    afterChange: [
      populateList,
      syncCollectionCounts,
      revalidateCollection({
        entity: 'title',
        getTags: (doc) => (doc?.slug ? `list_${doc.slug}` : undefined),
      }),
    ],
    afterDelete: [
      revalidateDeleteCollection({
        entity: 'title',
        getTags: (doc) => (doc?.slug ? `list_${doc.slug}` : undefined),
      }),
    ],
  },
  timestamps: true,
} as unknown as CollectionConfig;

// Коллекция - Подборки
export const LISTS_COLLECTION = {
  slug: COLLECTION_SLUGS.lists,
  dbName: 'collections',
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
    read: admin,
    create: admin,
    update: admin,
    delete: admin,
  },
  fields: [
    //
    {
      name: 'title',
      type: 'text',
      label: 'Название списка',
      required: true,
      unique: true,
    },
    slugField('title', { unique: true }),
    richTextField({ name: 'description', label: 'Описание списка' }),
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
    {
      name: 'items',
      type: 'join',
      collection: COLLECTION_SLUGS.titles,
      on: 'collections',
      label: 'Медиа контент в списке',
    },
  ],
  hooks: {
    beforeChange: [updateItemCount],
    afterChange: [
      revalidateCollection({
        entity: 'list',
        getTags: (doc) => (doc?.slug ? `list_${doc.slug}` : undefined),
      }),
    ],
    afterDelete: [
      revalidateDeleteCollection({
        entity: 'list',
        getTags: (doc) => (doc?.slug ? `list_${doc.slug}` : undefined),
      }),
    ],
  },
  timestamps: true,
} as unknown as CollectionConfig;

// Коллекция - Посты
export const POSTS_COLLECTION = {
  slug: COLLECTION_SLUGS.posts,
  labels: {
    singular: 'Пост',
    plural: 'Посты',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'publishedAt', 'updatedAt'],
    group: 'Контент',
  },
  access: {
    read: admin,
    create: admin,
    update: admin,
    delete: admin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Название поста',
      required: true,
      unique: true,
    },
    slugField('title', { unique: true }),
    {
      name: 'annotation',
      type: 'text',
      label: 'Аннотация',
      required: true,
      admin: {
        description: 'Краткое описание статьи.',
      },
    },
    richTextField({
      name: 'body',
      label: 'Текст статьи',
      required: true,
      description: 'Основной текст статьи.',
    }),
    {
      name: 'content',
      type: 'richText',
      label: 'Контент',
      required: true,
    },
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
      name: 'isPublished',
      type: 'checkbox',
      label: 'Опубликовано',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'image',
      type: 'upload',
      label: 'Изображение поста',
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
          pickerAppearance: 'dayOnly',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [setPublishedAt],
      },
    },
  ],
  hooks: {
    afterChange: [
      revalidateCollection({
        entity: 'post',
        getPath: (doc) => `/posts/${doc.slug}`,
        getTags: () => 'posts-sitemap',
      }),
    ],
    afterDelete: [
      revalidateDeleteCollection({
        entity: 'post',
        getPath: (doc) => `/posts/${doc?.slug}`,
        getTags: () => 'posts-sitemap',
      }),
    ],
  },
  timestamps: true,
} as unknown as CollectionConfig;
