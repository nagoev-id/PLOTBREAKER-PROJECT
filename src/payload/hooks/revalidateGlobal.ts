import type { GlobalAfterChangeHook } from 'payload';

/**
 * Универсальный хук ревалидации кэша для глобалов Payload CMS.
 *
 * Вызывается после изменения глобала и инвалидирует соответствующий
 * Next.js тег кэша `global_<slug>`, если ревалидация не отключена
 * через `context.disableRevalidate`.
 *
 * @param slug - Уникальный идентификатор (слаг) глобала,
 *               используется для формирования тега кэша `global_<slug>`
 * @returns `GlobalAfterChangeHook` — хук, который можно передать
 *          в поле `hooks.afterChange` конфигурации глобала
 */
export const revalidateGlobal = (slug: string): GlobalAfterChangeHook => {
  return async ({ doc, req: { payload, context } }) => {
    if (!context.disableRevalidate) {
      payload.logger.info(`Revalidating ${slug}`);
      const { revalidateTag } = await import('next/cache');
      revalidateTag(`global_${slug}`);
    }
    return doc;
  };
};
