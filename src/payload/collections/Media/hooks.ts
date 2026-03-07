import type { CollectionAfterChangeHook } from 'payload';

import type { Media } from '@/payload-types';

/**
 * Хук Payload CMS, корректирующий поле `url` у документа коллекции
 * `MediaCollection` после его сохранения.
 *
 * Если Payload CMS не сформировал `url` автоматически, но файл уже
 * загружен (`filename` присутствует), хук вручную собирает путь
 * в формате `/media/<filename>` и присваивает его полю `doc.url`.
 *
 * Используется как fallback для случаев, когда стандартный механизм
 * генерации URL медиафайлов не отработал (например, при кастомном
 * хранилище или нестандартной конфигурации загрузки).
 *
 * @param doc - Сохранённый документ медиафайла
 * @returns Документ с гарантированно заполненным полем `url`
 *          (если доступен `filename`)
 */

export const replaceDocUrl: CollectionAfterChangeHook<Media> = ({ doc }) => {
  if (!doc.url && doc.filename) {
    doc.url = `/media/${doc.filename}`;
  }
  return doc;
};
