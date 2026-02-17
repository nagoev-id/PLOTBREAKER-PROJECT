import type { GlobalAfterChangeHook } from "payload";

/**
 * Hook для инвалидации кеша глобального объекта Header после его изменения.
 *
 * Выполняет следующие задачи:
 * - Проверяет, отключена ли ревалидация в контексте запроса
 * - Логирует процесс ревалидации для мониторинга
 * - Инвалидирует кеш по тегу 'global_header' для обновления данных
 *
 * @param params - Параметры hook
 * @param params.doc - Обновленный документ
 * @param params.req - Объект запроса с payload и context
 * @returns Обновленный документ без изменений
 */

export const revalidateHeader: GlobalAfterChangeHook = async ({ doc, req: { payload, context } }) => {
  // Проверяем, не отключена ли ревалидация в контексте
  if (!context.disableRevalidate) {
    // Логируем процесс ревалидации для мониторинга
    payload.logger.info(`Revalidating header`);

    // Инвалидируем кеш по тегу для обновления данных
    const { revalidateTag } = await import("next/cache");
    revalidateTag("global_header");
  }

  // Возвращаем документ без изменений
  return doc;
};
