import { postgresAdapter } from '@payloadcms/db-postgres';
import {
  FixedToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { storage, importExport, search } from '@/payload/plugins';
import {
  Posts,
  Users,
  Media,
  Pages,
  Lists,
  Titles,
} from '@/payload/collections';
import { GLOBAL_FOOTER, GLOBAL_HEADER } from '@/payload/config/globals';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Конфигурация Payload CMS
export default buildConfig({
  // Админ-панель
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    autoRefresh: true,
    components: {
      afterNavLinks: ['@/components/admin/OpenSiteLink'],
    },
  },

  // Инициализация
  onInit: async (payload) => {
    const users = await payload.find({
      collection: 'users',
      limit: 1,
    });

    if (users.totalDocs === 0) {
      await payload.create({
        collection: 'users',
        data: {
          name: process.env.CMS_SEED_ADMIN_LOGIN || 'Admin',
          username: process.env.CMS_SEED_ADMIN_LOGIN || 'admin',
          email: process.env.CMS_SEED_ADMIN_EMAIL || 'admin@example.com',
          password: process.env.CMS_SEED_ADMIN_PASSWORD || 'changeme',
        },
      });
      payload.logger.info('✅ Seed admin user created');
    }
  },

  // Коллекции
  collections: [Users, Media, Pages, Lists, Titles, Posts],

  // Глобальные настройки
  globals: [GLOBAL_HEADER, GLOBAL_FOOTER],

  // Редактор
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
    ],
  }),

  // Секретный ключ
  secret: process.env.PAYLOAD_SECRET || '',

  // Типы
  typescript: {
    outputFile: path.resolve(dirname, '../../payload-types.ts'),
  },

  // База данных
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),

  // Обработка изображений
  sharp,

  // Плагины
  plugins: [storage, importExport, search],
});
