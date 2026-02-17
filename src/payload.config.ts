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

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    ...(process.env.NODE_ENV !== 'production' && {
      autoLogin: {
        email: process.env.CMS_SEED_ADMIN_EMAIL,
        password: process.env.CMS_SEED_ADMIN_PASSWORD,
      },
    }),
    autoRefresh: true,
    components: {
      afterNavLinks: ['@/components/admin/OpenSiteLink'],
    },
  },
  onInit: async (payload) => {
    const users = await payload.find({
      collection: 'users',
      limit: 1,
    });

    if (users.totalDocs === 0) {
      await payload.create({
        collection: 'users',
        data: {
          name: 'Admin',
          username: process.env.CMS_SEED_ADMIN_LOGIN || 'admin',
          email: process.env.CMS_SEED_ADMIN_EMAIL || 'admin@example.com',
          password: process.env.CMS_SEED_ADMIN_PASSWORD || 'changeme',
          role: 'admin',
        } as any,
      });
      payload.logger.info('✅ Seed admin user created');
    }
  },
  collections: [Users, Media, Pages, Collections, MediaContents, Posts],
  globals: [HeaderGlobalConfig, FooterGlobalConfig],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
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
  ],
});
