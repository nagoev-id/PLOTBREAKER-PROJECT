import type { Field, GroupField, RowField } from 'payload';
import { deepMerge } from '@/payload/utilities/utils';

/**
 * Опции конфигурации для фабричной функции {@link link}.
 */
type LinkOptions = {
  /**
   * Список вариантов оформления ссылки для поля `appearance`.
   *
   * - `string[]` — используются переданные варианты
   * - `false` — поле `appearance` не добавляется вовсе
   * - `undefined` — используются варианты по умолчанию: `['default', 'outline']`
   */
  appearances?: false | string[];

  /**
   * Если `true` — поле `label` (текст ссылки) не добавляется в конфигурацию.
   * Полезно когда текст ссылки управляется внешним полем.
   *
   * @default false
   */
  disableLabel?: boolean;

  /**
   * Произвольные переопределения для результирующего `GroupField`.
   * Применяются через {@link deepMerge} поверх базовой конфигурации,
   * что позволяет точечно менять любые вложенные свойства.
   *
   * @default {}
   */
  overrides?: Record<string, unknown>;
};

/**
 * Сигнатура фабричной функции {@link link}.
 */
type LinkType = (options?: LinkOptions) => Field;

/**
 * Фабричная функция, создающая конфигурацию группового поля «ссылка»
 * для Payload CMS.
 *
 * Генерирует `GroupField` с именем `link`, поддерживающий два режима:
 * **внутренняя ссылка** (relationship на коллекцию `pages`) и
 * **внешняя ссылка** (произвольный URL). Переключение между режимами
 * осуществляется через radio-поле `type`, а нужные поля показываются
 * / скрываются через `admin.condition`.
 *
 * @param options - Опции конфигурации поля; см. {@link LinkOptions}
 * @param options.appearances - Варианты оформления или `false` для отключения
 * @param options.disableLabel - Отключить поле `label` (текст ссылки)
 * @param options.overrides - Deep merge-переопределения итогового `GroupField`
 * @returns Объект конфигурации поля типа {@link Field} (GroupField под капотом)
 *
 * @example
 * // Базовое использование — внутренняя/внешняя ссылка с label и appearance
 * import { link } from '@/payload/fields/link';
 *
 * export const CallToAction: Block = {
 *   slug: 'cta',
 *   fields: [
 *     link(), // type, newTab, reference/url, label, appearance
 *   ],
 * };
 *
 * @example
 * // Кастомные варианты оформления
 * link({ appearances: ['primary', 'secondary', 'ghost'] })
 *
 * @example
 * // Без поля `appearance` (только type, newTab, reference/url, label)
 * link({ appearances: false })
 *
 * @example
 * // Без поля `label` — текст ссылки управляется снаружи
 * link({ disableLabel: true })
 *
 * @example
 * // Переопределение через overrides — сделать группу обязательной
 * link({
 *   overrides: {
 *     required: true,
 *     admin: { description: 'Укажите ссылку для CTA-кнопки' },
 *   },
 * })
 */
export const link: LinkType = ({
  appearances,
  disableLabel = false,
  overrides = {},
} = {}) => {
  /**
   * Базовый набор полей группы:
   * `type` (radio) и `newTab` (checkbox).
   * Остальные поля добавляются динамически ниже.
   */
  const linkFields: Field[] = [
    {
      name: 'type',
      type: 'radio',
      admin: { layout: 'horizontal' },
      defaultValue: 'reference',
      options: [
        { label: 'Внутренняя ссылка', value: 'reference' },
        { label: 'Внешняя ссылка', value: 'custom' },
      ],
    },
    {
      name: 'newTab',
      type: 'checkbox',
      admin: {
        style: { alignSelf: 'flex-end' },
        width: '50%',
      },
      label: 'Открывать в новом окне',
    },
  ];

  /**
   * Row-поле с взаимоисключающими полями `reference` и `url`.
   * Видимость каждого управляется через `admin.condition` по значению `type`.
   * Поле `label` добавляется сюда же, если `disableLabel !== true`.
   */
  const linkRowFields: RowField = {
    type: 'row',
    fields: [
      {
        name: 'reference',
        type: 'relationship',
        admin: {
          condition: (_, siblingData) => siblingData?.type === 'reference',
          width: '50%',
        },
        label: 'Документ',
        relationTo: ['pages'],
        required: true,
      },
      {
        name: 'url',
        type: 'text',
        admin: {
          condition: (_, siblingData) => siblingData?.type === 'custom',
          width: '50%',
        },
        label: 'URL',
        required: true,
      },
    ],
  };

  if (!disableLabel) {
    linkRowFields.fields.push({
      name: 'label',
      type: 'text',
      admin: { width: '50%' },
      label: 'Текст ссылки',
      required: true,
    });
  }

  linkFields.push(linkRowFields);

  if (appearances !== false) {
    /**
     * Поле `appearance` добавляется только если `appearances !== false`.
     * Если `appearances` не передан — используются варианты по умолчанию.
     * Лейблы капитализируются автоматически через `charAt(0).toUpperCase()`.
     */
    const defaultAppearances = ['default', 'outline'];
    const effectiveAppearances = Array.isArray(appearances)
      ? appearances
      : defaultAppearances;

    linkFields.push({
      name: 'appearance',
      type: 'select',
      admin: { description: 'Стиль оформления ссылки.' },
      defaultValue: 'default',
      options: effectiveAppearances.map((appearance) => ({
        label: appearance.charAt(0).toUpperCase() + appearance.slice(1),
        value: appearance,
      })),
    });
  }

  /**
   * Итоговый `GroupField` оборачивает все поля в группу `link`.
   * `hideGutter: true` убирает визуальный разделитель в Admin UI.
   * Финальная конфигурация мержится с `overrides` через {@link deepMerge}.
   */
  const linkGroup: GroupField = {
    name: 'link',
    type: 'group',
    admin: { hideGutter: true },
    fields: linkFields,
  };

  return deepMerge(linkGroup, overrides) as Field;
};
