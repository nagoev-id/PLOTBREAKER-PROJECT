import { Block } from 'payload';

import { link } from '@/payload/fields/link';

// Настройки блоков - Список слагов
export const BLOCK_SLUGS = {
  about: 'about',
  hero: 'hero',
} as const;

//
export const ABOUT_BLOCK = {
  slug: BLOCK_SLUGS.about,
  interfaceName: 'AboutBlock',
  labels: {
    singular: 'О проекте',
    plural: 'О проекте',
  },
  fields: [
    {
      name: 'featuresSection',
      type: 'group',
      label: 'Секция особенностей',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Заголовок',
          required: true,
          defaultValue: 'Философия',
          admin: {
            description: 'Отображается крупным шрифтом в начале блока',
          },
        },
        {
          name: 'text',
          type: 'textarea',
          label: 'Вводный текст',
          defaultValue:
            'Краткие пересказы фильмов и сериалов для тех, кто ценит своё время. Узнайте суть сюжета, ключевые моменты и мою честную оценку — и решите, стоит ли тратить вечер на просмотр. Никакой воды, только главное.',
          admin: {
            description: 'Краткое описание под заголовком',
          },
        },
        {
          name: 'items',
          type: 'array',
          label: 'Список особенностей',
          labels: {
            singular: 'Особенность',
            plural: 'Особенности',
          },
          maxRows: 6,
          admin: {
            initCollapsed: true,
          },
          fields: [
            {
              name: 'icon',
              type: 'code',
              label: 'Иконка (SVG код)',
              required: true,
              admin: {
                language: 'html',
                description:
                  'Вставьте SVG-код иконки (без обертки, только содержимое тега <svg> или весь тег)',
              },
            },
            {
              name: 'title',
              type: 'text',
              label: 'Заголовок карточки',
              required: true,
            },
            {
              name: 'text',
              type: 'textarea',
              label: 'Описание',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'usefulLinksSection',
      type: 'group',
      label: 'Секция полезных ссылок',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Заголовок блока',
          required: true,
          defaultValue: 'Полезные ссылки',
          admin: {
            description: 'Отображается в начале секции',
          },
        },
        {
          name: 'text',
          type: 'textarea',
          label: 'Описание (необязательно)',
          defaultValue: 'Популярные платформы с обзорами и рейтингами фильмов',
          admin: {
            description: 'Пояснительный текст под заголовком',
          },
        },
        {
          name: 'items',
          type: 'array',
          dbName: 'about_cols',
          label: 'Колонки ссылок',
          labels: {
            singular: 'Колонка',
            plural: 'Колонки',
          },
          maxRows: 3,
          minRows: 1,
          admin: {
            initCollapsed: true,
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Заголовок колонки',
              required: true,
              admin: {
                placeholder: 'Например: Базы данных',
              },
            },
            {
              name: 'links',
              type: 'array',
              dbName: 'about_lnks',
              label: 'Ссылки в колонке',
              labels: {
                singular: 'Ссылка',
                plural: 'Ссылки',
              },
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: 'Название сервиса',
                  required: true,
                },
                {
                  name: 'text',
                  type: 'text',
                  label: 'Краткое описание',
                },
                link({
                  disableLabel: true,
                }),
              ],
            },
          ],
        },
      ],
    },
  ],
} as unknown as Block;

//
export const HERO_BLOCK = {
  slug: BLOCK_SLUGS.hero,
  interfaceName: 'HeroBlock',
  labels: {
    singular: 'Hero блок',
    plural: 'Hero блоки',
  },
  fields: [
    {
      name: 'heroTitle',
      type: 'text',
      label: 'Заголовок',
      required: true,
      defaultValue: 'О проекте.',
      admin: {
        description: 'Основной текстовый акцент на первом экране',
      },
    },
    {
      name: 'heroText',
      type: 'textarea',
      label: 'Подзаголовок',
      defaultValue: 'Минималистичный журнал о визуальном повествовании в кино.',
      admin: {
        description: 'Более подробное описание под заголовком',
      },
    },
    {
      name: 'links',
      type: 'array',
      label: 'Призывы к действию (Кнопки)',
      maxRows: 2,
      admin: {
        initCollapsed: true,
      },
      fields: [
        link({
          appearances: ['default', 'outline'],
        }),
      ],
    },
    {
      name: 'backgroundVideo',
      type: 'upload',
      relationTo: 'media',
      label: 'Фоновое видео',
      admin: {
        description:
          'Загрузите видео (mp4) для фона Hero-секции. Если не указано — стандартный фон.',
      },
    },
  ],
} as unknown as Block;
