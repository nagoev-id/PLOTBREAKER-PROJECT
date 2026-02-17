import type { GlobalAfterChangeHook } from "payload";

/**
 * Hook для инвалидации кеша глобального объекта Footer после его изменения.
 *
 * Выполняет следующие задачи:
 * - Проверяет, отключена ли ревалидация в контексте запроса
 * - Логирует процесс ревалидации для мониторинга
 * - Инвалидирует кеш по тегу 'global_footer' для обновления данных
 *
 * @param params - Параметры hook
 * @param params.doc - Обновленный документ Footer
 * @param params.req - Объект запроса с payload и context
 * @returns Обновленный документ без изменений
 */
export const revalidateFooter: GlobalAfterChangeHook = async ({ doc, req: { payload, context } }) => {
  // Проверяем, не отключена ли ревалидация в контексте
  if (!context.disableRevalidate) {
    // Логируем процесс ревалидации для мониторинга
    payload.logger.info(`Revalidating Footer`);

    // Инвалидируем кеш по тегу для обновления данных
    const { revalidateTag } = await import("next/cache");
    revalidateTag("global_footer");
  }

  // Возвращаем документ без изменений
  return doc;
};
