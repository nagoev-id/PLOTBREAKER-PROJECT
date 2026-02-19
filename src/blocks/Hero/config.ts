import type { Block } from 'payload';

import { BLOCK_TYPES } from '@/utilities/constants';
import { link } from '@/fields/link';

/**
 * Конфигурация блока "Hero".
 */
export const Hero: Block = {
  slug: BLOCK_TYPES.hero,
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
  ],
};
