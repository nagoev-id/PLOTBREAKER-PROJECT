import type { Field, GroupField } from 'payload';
import { deepMerge } from '@/utilities/utils';

/**
 * Варианты внешнего вида ссылки.
 */
export type LinkAppearances = 'default' | 'outline';

/**
 * Опции выбора внешнего вида для административной панели.
 */
export const appearanceOptions: Record<
  LinkAppearances,
  { label: string; value: string }
> = {
  default: {
    label: 'Стандартная (заливка)',
    value: 'default',
  },
  outline: {
    label: 'Контурная',
    value: 'outline',
  },
};

/**
 * Тип функции для создания поля ссылки.
 */
type LinkType = (options?: {
  /** Массив доступных вариантов оформления или false, чтобы скрыть выбор оформления */
  appearances?: LinkAppearances[] | false;
  /** Скрывает поле для ввода текста ссылки (label) */
  disableLabel?: boolean;
  /** Переопределение конфигурации поля */
  overrides?: Partial<GroupField>;
}) => Field;

/**
 * Генерирует универсальное поле для ссылки (внутренней или внешней).
 *
 * Создает группу полей, позволяющую выбрать тип ссылки (документ или URL),
 * настроить открытие в новой вкладке, задать текст ссылки и выбрать стиль оформления.
 *
 * @param options - Настройки поля
 * @returns Сконфигурированное поле Payload типа 'group'
 */
export const link: LinkType = ({
  appearances,
  disableLabel = false,
  overrides = {},
} = {}) => {
  const linkResult: GroupField = {
    name: 'link',
    label: 'Ссылка',
    type: 'group',
    admin: {
      hideGutter: true,
    },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'type',
            type: 'radio',
            label: 'Тип ссылки',
            admin: {
              layout: 'horizontal',
              width: '50%',
            },
            defaultValue: 'reference',
            options: [
              {
                label: 'Внутренняя (страница)',
                value: 'reference',
              },
              {
                label: 'Внешний URL',
                value: 'custom',
              },
            ],
          },
          {
            name: 'newTab',
            type: 'checkbox',
            label: 'Открыть в новой вкладке',
            admin: {
              style: {
                alignSelf: 'flex-end',
              },
              width: '50%',
            },
          },
        ],
      },
    ],
  };

  const linkTypes: Field[] = [
    {
      name: 'reference',
      type: 'relationship',
      label: 'Документ',
      relationTo: ['pages'],
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'reference',
      },
    },
    {
      name: 'url',
      type: 'text',
      label: 'Кастомный URL',
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'custom',
      },
    },
  ];

  if (!disableLabel) {
    // Применяем ширину 50% к типам ссылок, если текст ссылки включен
    const adjustedLinkTypes: Field[] = linkTypes.map((linkType) => {
      // Создаем копию поля и безопасно добавляем ширину в настройки admin
      const field = { ...linkType };
      field.admin = {
        ...(field.admin || {}),
        width: '50%',
      };
      return field as Field;
    });

    linkResult.fields.push({
      type: 'row',
      fields: [
        ...adjustedLinkTypes,
        {
          name: 'label',
          type: 'text',
          label: 'Текст ссылки',
          required: true,
          admin: {
            width: '50%',
          },
        },
      ],
    });
  } else {
    linkResult.fields = [...linkResult.fields, ...linkTypes];
  }

  if (appearances !== false) {
    let appearanceOptionsToUse = [
      appearanceOptions.default,
      appearanceOptions.outline,
    ];

    if (appearances) {
      appearanceOptionsToUse = appearances.map(
        (appearance) => appearanceOptions[appearance]
      );
    }

    linkResult.fields.push({
      name: 'appearance',
      type: 'select',
      label: 'Оформление',
      admin: {
        description: 'Выберите, как ссылка должна отображаться на сайте.',
      },
      defaultValue: 'default',
      options: appearanceOptionsToUse,
    });
  }

  return deepMerge(linkResult, overrides) as Field;
};
