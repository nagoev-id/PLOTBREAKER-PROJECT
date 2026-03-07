import { importExportPlugin } from '@payloadcms/plugin-import-export';
import { COLLECTION_SLUGS } from '@/payload/config/collections';

/**
 * Конфигурация плагина импорта/экспорта данных.
 *
 * Позволяет экспортировать и импортировать документы
 * коллекций {@link COLLECTION_SLUGS.titles} и {@link COLLECTION_SLUGS.posts}
 * через админ-панель Payload CMS.
 */
export const importExport = importExportPlugin({
  collections: [
    { slug: COLLECTION_SLUGS.titles },
    { slug: COLLECTION_SLUGS.posts },
  ],
});
