import type { Field } from 'payload';
import { formatSlug } from '@/payload/utilities/utils';

/**
 * Фабричная функция, создающая конфигурацию поля `slug` для Payload CMS.
 *
 * Поле автоматически генерирует URL-совместимый slug из значения
 * указанного поля (по умолчанию — `title`) через хук `beforeValidate`.
 * При ручном вводе slug также нормализуется через {@link formatSlug}.
 *
 * @param fieldToUse - Имя поля-источника для автогенерации slug.
 *   Должно быть полем того же документа (sibling field).
 *   По умолчанию: `'title'`
 * @param overrides - Частичный объект конфигурации Payload `Field`
 *   для переопределения любых свойств по умолчанию.
 *   Применяется через spread-оператор поверх базовой конфигурации.
 * @returns Готовый объект конфигурации поля типа {@link Field}
 *
 *
 * @example
 * // Поведение хука при разных входных данных
 * // value = 'My Page!'       → 'my-page'      (ручной ввод)
 * // value = '',  title = 'About Us' → 'about-us'  (из siblingData)
 * // value = undefined        → undefined      (без изменений)
 */
export const slugField = (
  fieldToUse = 'title',
  overrides?: Partial<Field>
): Field =>
  ({
    name: 'slug',
    type: 'text',
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
      description:
        'Автоматически генерируется из названия. Можно редактировать вручную.',
    },
    hooks: {
      /**
       * Хук выполняется перед валидацией при каждом сохранении документа.
       * Нормализует значение slug через {@link formatSlug}.
       *
       * @param value - Текущее значение поля `slug` (введённое пользователем)
       * @param siblingData - Остальные поля того же документа;
       *   используется для чтения `fieldToUse` при пустом `value`
       */
      beforeValidate: [
        ({ value, siblingData }) => {
          if (typeof value === 'string') {
            return formatSlug(value);
          }
          const fieldValue = siblingData?.[fieldToUse];
          if (typeof fieldValue === 'string') {
            return formatSlug(fieldValue);
          }
          return value;
        },
      ],
    },
    ...overrides,
  }) as Field;
