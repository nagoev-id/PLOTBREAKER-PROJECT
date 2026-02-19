import type { CollectionConfig } from 'payload';

import { protectRoles, admin } from '@/access';
import { COLLECTION_SLUGS } from '@/utilities/constants';

export const Users: CollectionConfig = {
  slug: COLLECTION_SLUGS.users,
  labels: {
    singular: 'Пользователь',
    plural: 'Пользователи',
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'username'],
    group: 'Конфигурация',
  },
  access: {
    read: admin,
    create: admin,
    update: admin,
    delete: admin,
    admin: async ({ req }) => {
      const result = await admin({ req });
      return result === true;
    },
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30,
    useAPIKey: true,
    loginWithUsername: true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Имя',
      required: true,
    },
    {
      name: 'username',
      type: 'text',
      label: 'Логин',
      required: true,
      unique: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      label: 'Аватар',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'role',
      type: 'select',
      label: 'Роль',
      defaultValue: 'user',
      options: [
        { label: 'Администратор', value: 'admin' },
        { label: 'Пользователь', value: 'user' },
      ],
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [protectRoles],
      },
    },
  ],
};
