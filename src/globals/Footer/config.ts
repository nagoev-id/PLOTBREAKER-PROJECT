import type { GlobalConfig } from 'payload';

import { METADATA } from '@/utilities/constants';
import { revalidateFooter } from '@/globals/Footer/hooks/revalidateFooter';

/**
 * Конфигурация глобального объекта Footer для CMS Payload.
 *
 * Определяет структуру и поведение подвала сайта, включая:
 * - Настройки доступа для чтения
 * - Поля для логотипа (иконка и текст)
 * - Хуки для инвалидации кеша после изменений
 *
 * @see {@link revalidateFooter} - Хук для ревалидации кеша
 */
export const FooterGlobalConfig: GlobalConfig = {
  slug: 'footer',
  label: 'Подвал',
  access: {
    /** Разрешает чтение подвала всем пользователям */
    read: () => true,
  },
  fields: [
    {
      name: 'logo',
      label: 'Логотип',
      type: 'group',
      /** Группа полей для настройки логотипа подвала */
      fields: [
        {
          name: 'logoIcon',
          label: 'Иконка',
          type: 'code',
          /** HTML-код или SVG иконки логотипа */
          admin: {
            description: 'HTML-код или SVG для иконки логотипа',
          },
        },
        {
          name: 'logoText',
          label: 'Текст',
          type: 'text',
          defaultValue: METADATA.siteName,
          /** Текстовое представление названия бренда */
          admin: {
            description: 'Текст логотипа, отображаемый рядом с иконкой',
            placeholder: 'Введите текст логотипа',
          },
        },
      ],
    },
  ],
  hooks: {
    /** Выполняет ревалидацию кеша после изменения подвала */
    afterChange: [revalidateFooter],
  },
};
