import type { Block } from 'payload';

import { link } from '@/fields/link';
import { BLOCK_TYPES } from '@/utilities/constants';

/**
 * Конфигурация блока "О проекте" (About).
 * Этот блок используется для создания информационных секций с преимуществами
 * и списками внешних или внутренних ссылок.
 */
export const About: Block = {
  slug: BLOCK_TYPES.about,
  interfaceName: 'AboutBlock',
  labels: {
    singular: 'О проекте',
    plural: 'О проекте',
  },
  fields: [
    /**
     * Секция особенностей (Features Section)
     * Содержит заголовок, вводный текст и список карточек-преимуществ.
     */
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
        /**
         * Список особенностей/преимуществ (Items)
         * Каждая карточка включает иконку (SVG), заголовок и текст.
         */
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
    /**
     * Секция полезных ссылок (Useful Links Section)
     * Группирует ссылки по колонкам с общим заголовком и описанием.
     */
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
        /**
         * Список колонок со ссылками (Items)
         * Позволяет группировать ссылки тематически в несколько столбцов.
         */
        {
          name: 'items',
          type: 'array',
          dbName: 'about_cols', // Сокращенное имя для БД (обход лимита PostgreSQL)
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
            /**
             * Массив ссылок внутри одной колонки (Links)
             */
            {
              name: 'links',
              type: 'array',
              dbName: 'about_lnks', // Сокращенное имя для БД
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
};
