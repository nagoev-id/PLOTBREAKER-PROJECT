import { anyone } from '@/payload/access';
import { METADATA } from '@/lib/constants';
import { revalidateGlobal } from '@/payload/hooks/revalidateGlobal';
import { GlobalConfig } from 'payload';
import { link } from '@/payload/fields/link';

// Глобальные настройки - Список слагов
export const GLOBAL_SLUGS = {
  header: 'header',
  footer: 'footer',
} as const;

const LOGO_FIELDS = {
  name: 'logo',
  label: 'Логотип',
  type: 'group',
  fields: [
    // Иконка
    {
      name: 'logoIcon',
      label: 'Иконка',
      type: 'code',
      admin: {
        description: 'HTML-код или SVG для иконки логотипа',
      },
    },
    // Текст
    {
      name: 'logoText',
      label: 'Текст',
      type: 'text',
      defaultValue: METADATA.siteName,
      admin: {
        description: 'Текст логотипа, отображаемый рядом с иконкой',
        placeholder: 'Введите текст логотипа',
      },
    },
  ],
};

// Глобальные настройки - Подвал
export const GLOBAL_FOOTER = {
  slug: GLOBAL_SLUGS.footer,
  label: 'Подвал',
  access: {
    read: anyone,
  },
  fields: [
    // Логотип
    LOGO_FIELDS,
  ],
  hooks: {
    afterChange: [revalidateGlobal(GLOBAL_SLUGS.footer)],
  },
} as unknown as GlobalConfig;

// Глобальные настройки - Шапка
export const GLOBAL_HEADER = {
  slug: GLOBAL_SLUGS.header,
  label: 'Шапка',
  access: {
    read: anyone,
  },
  fields: [
    // Логотип
    LOGO_FIELDS,
    // Навигация
    {
      name: 'navItems',
      label: 'Навигация',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/payload/globals/Header/RowLabel.client#RowLabel',
        },
        description: 'Основное навигационное меню сайта. Максимум 6 элементов.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateGlobal(GLOBAL_SLUGS.header)],
  },
} as unknown as GlobalConfig;
