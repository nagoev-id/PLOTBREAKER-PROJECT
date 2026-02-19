import type { Field } from 'payload';

import { formatSlug } from '@/utilities/utils';
import { deepMerge } from '@/utilities/utils';

/**
 * Тип функции для создания slug-поля.
 *
 * @param fieldToUse - Имя поля, из которого брать значение для slug (по умолчанию "title")
 * @param overrides - Дополнительные настройки для переопределения стандартных параметров поля
 * @returns Сконфигурированное поле slug для Payload CMS
 */
type Slug = (fieldToUse?: string, overrides?: Partial<Field>) => Field;

/**
 * Создает конфигурацию slug-поля для Payload CMS.
 *
 * Функция возвращает готовое поле slug со следующими характеристиками:
 * - Автоматическое форматирование из указанного поля
 * - Размещение в сайдбаре админ-панели
 * - Индексация для быстрого поиска
 * - Возможность переопределения параметров
 *
 * @param fieldToUse - Имя поля для автоматического заполнения slug (по умолчанию "title")
 * @param overrides - Объект с переопределениями стандартных настроек поля
 * @returns Сконфигурированное поле slug
 */
export const slugField: Slug = (fieldToUse = 'title', overrides = {}) =>
  deepMerge(
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [formatSlug(fieldToUse)],
      },
    },
    overrides
  );
