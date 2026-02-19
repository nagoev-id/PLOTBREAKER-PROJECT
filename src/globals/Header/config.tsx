import type { GlobalConfig } from 'payload';

import { METADATA } from '@/utilities/constants';
import { adminOnly } from '@/access';
import { link } from '@/fields/link';
import { revalidateHeader } from '@/globals/Header/hooks/revalidateHeader';

/**
 * Конфигурация глобальной настройки "Шапка сайта" для CMS Payload
 *
 * Содержит настройки для логотипа и навигационного меню сайта.
 * Автоматически кешируется и инвалидировается при изменениях.
 */
export const HeaderGlobalConfig: GlobalConfig = {
  slug: 'header',
  label: 'Шапка',
  access: {
    read: adminOnly,
  },
  fields: [
    {
      name: 'logo',
      label: 'Логотип',
      type: 'group',
      fields: [
        {
          /** HTML-код или SVG иконка логотипа */
          name: 'logoIcon',
          label: 'Иконка',
          type: 'code',
          admin: {
            description: 'HTML-код или SVG для иконки логотипа',
          },
        },
        {
          /** Текст логотипа, отображаемый рядом с иконкой */
          name: 'logoText',
          label: 'Текст',
          type: 'text',
          defaultValue: METADATA.siteName,
          admin: {
            description: 'Текст логотипа сайта',
          },
        },
      ],
    },
    /**
     * Массив навигационных элементов
     * Максимальное количество элементов: 6
     */
    {
      name: 'navItems',
      label: 'Навигация',
      type: 'array',
      fields: [
        /** Ссылка с настройками внешнего вида и поведения */
        link({
          appearances: false, // Отключаем дополнительные стили для ссылок
        }),
      ],
      /** Ограничение на количество навигационных элементов */
      maxRows: 6,
      admin: {
        /** Изначально сворачивать список элементов в админ-панели */
        initCollapsed: true,
        /** Кастомный компонент для отображения названия элемента в списке */
        components: {
          RowLabel: '@/globals/Header/components/row-label#RowLabel',
        },
        description: 'Основное навигационное меню сайта. Максимум 6 элементов.',
      },
    },
  ],

  /** Хуки, выполняемые при изменении настроек */
  hooks: {
    /** Выполняется после сохранения изменений для инвалидации кеша */
    afterChange: [revalidateHeader],
  },
};
