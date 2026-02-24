import { postgresAdapter } from '@payloadcms/db-postgres';
import {
  FixedToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { s3Storage } from '@payloadcms/storage-s3';
import { importExportPlugin } from '@payloadcms/plugin-import-export';

import {
  Users,
  Media,
  Pages,
  Collections,
  Posts,
  MediaContents,
} from '@/collections';
import { HeaderGlobalConfig } from '@/globals/Header/config';
import { FooterGlobalConfig } from '@/globals/Footer/config';
import { COLLECTION_SLUGS } from '@/utilities/constants';
import { searchPlugin } from '@payloadcms/plugin-search';

// Определение текущего пути для корректной работы с файловой системой
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * Основная конфигурация Payload CMS
 */
export default buildConfig({
  // Настройки административной панели
  admin: {
    // Коллекция, используемая для аутентификации в админке
    user: Users.slug,
    // Настройка карты импорта для корректной сборки клиентских компонентов
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // Автоматический вход в режиме разработки для удобства тестирования
    // ...(process.env.NODE_ENV !== 'production' && {
    //   autoLogin: {
    //     email: process.env.CMS_SEED_ADMIN_EMAIL,
    //     password: process.env.CMS_SEED_ADMIN_PASSWORD,
    //   },
    // }),
    // Автоматическое обновление данных
    autoRefresh: true,
    // Кастомные компоненты интерфейса админки
    components: {
      // Добавляем ссылку на основной сайт после ссылок навигации
      afterNavLinks: ['@/components/admin/OpenSiteLink'],
    },
  },

  // Функция, выполняемая при инициализации Payload
  onInit: async (payload) => {
    // Проверяем наличие пользователей в системе
    const users = await payload.find({
      collection: 'users',
      limit: 1,
    });

    // Если пользователей нет (первый запуск), создаем администратора по умолчанию
    if (users.totalDocs === 0) {
      await payload.create({
        collection: 'users',
        data: {
          name: 'Admin',
          username: process.env.CMS_SEED_ADMIN_LOGIN || 'admin',
          email: process.env.CMS_SEED_ADMIN_EMAIL || 'admin@example.com',
          password: process.env.CMS_SEED_ADMIN_PASSWORD || 'changeme',
          role: 'admin',
        } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      });
      payload.logger.info('✅ Seed admin user created');
    }
  },

  // Список коллекций данных
  collections: [Users, Media, Pages, Collections, MediaContents, Posts],

  // Список глобальных настроек (например, шапка и подвал сайта)
  globals: [HeaderGlobalConfig, FooterGlobalConfig],

  // Настройка редактора богатого текста (Lexical)
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(), // Добавляем закрепленную панель инструментов
    ],
  }),

  // Секретный ключ для подписи токенов и шифрования данных
  secret: process.env.PAYLOAD_SECRET || '',

  // Настройки генерации типов TypeScript на основе конфигурации Payload
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  // Адаптер базы данных (PostgreSQL)
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),

  // Библиотека для обработки изображений
  sharp,

  // Список плагинов Payload
  plugins: [
    // Плагин для хранения медиафайлов в S3-совместимом хранилище
    s3Storage({
      collections: {
        media: {
          prefix: 'media', // Префикс для путей файлов в бакете
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || '',
        endpoint: process.env.S3_ENDPOINT || '',
      },
    }),

    // Плагин импорта/экспорта данных (CSV, JSON)
    importExportPlugin({
      collections: [
        { slug: COLLECTION_SLUGS.mediaContents },
        { slug: COLLECTION_SLUGS.posts },
      ],
    }),

    // ВРЕМЕННО ОТКЛЮЧЕНО для импорта данных
    // searchPlugin({
    //   // Коллекции, данные которых будут индексироваться для поиска
    //   collections: [COLLECTION_SLUGS.mediaContents, COLLECTION_SLUGS.posts],
    //   // Веса коллекций в результатах поиска
    //   defaultPriorities: {
    //     [COLLECTION_SLUGS.mediaContents]: 10,
    //     [COLLECTION_SLUGS.posts]: 5,
    //   },
    //   // Обработка данных перед синхронизацией с индексом поиска
    //   beforeSync: ({ originalDoc, searchDoc }) => ({
    //     ...searchDoc,
    //     title: originalDoc.title || searchDoc.title,
    //     // Сбор ключевых слов для улучшения результатов поиска
    //     keywords: [
    //       originalDoc.title,
    //       originalDoc.originalTitle,
    //       originalDoc.director,
    //     ]
    //       .filter(Boolean)
    //       .join(' '),
    //   }),
    //   // Переопределение настроек коллекции результатов поиска
    //   searchOverrides: {
    //     slug: 'search-results',
    //     labels: {
    //       singular: 'Результат поиска',
    //       plural: 'Результаты поиска',
    //     },
    //     admin: {
    //       group: 'Система',
    //     },
    //     fields: ({ defaultFields }) => [
    //       ...defaultFields,
    //       {
    //         name: 'keywords',
    //         type: 'text',
    //         admin: { readOnly: true },
    //       },
    //     ],
    //   },
    // }),
  ],
});
