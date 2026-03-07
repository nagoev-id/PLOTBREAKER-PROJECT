import { s3Storage } from '@payloadcms/storage-s3';

/**
 * Конфигурация плагина S3-хранилища для медиафайлов.
 *
 * Все загруженные файлы коллекции `media` сохраняются в S3-совместимое
 * хранилище с префиксом `media/`. Параметры подключения читаются
 * из переменных окружения.
 *
 * Переменные окружения:
 * - `S3_BUCKET` — имя бакета
 * - `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` — ключи доступа
 * - `S3_REGION` — регион
 * - `S3_ENDPOINT` — кастомный endpoint (для MinIO, Supabase и т.д.)
 */
export const storage = s3Storage({
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
});
