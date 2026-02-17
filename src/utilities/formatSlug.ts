import type { FieldHook } from 'payload'
import { slugify } from 'transliteration'

/**
 * Утилита для форматирования slug-идентификаторов.
 *
 * Предоставляет функции для автоматического создания человекопонятных URL
 * из текстовых полей с использованием транслитерации.
 */

/**
 * Форматирует строку в slug-идентификатор.
 *
 * Выполняет транслитерацию кириллицы в латиницу, приводит к нижнему регистру,
 * заменяет пробелы на дефисы и удаляет лишние пробелы по краям.
 *
 * @param val - Исходная строка для форматирования
 * @returns Отформатированный slug-идентификатор
 *
 */
export const formatSlugString = (val: string): string =>
  slugify(val, {
    lowercase: true,
    separator: '-',
    trim: true,
  })

/**
 * Создает hook для автоматического форматирования slug-полей в Payload CMS.
 *
 * Hook выполняет следующие задачи:
 * - Если в slug-поле уже есть значение, форматирует его
 * - При создании новой записи использует значение из fallback-поля
 * - Сохраняет существующее значение при редактировании, если slug не изменен
 *
 * @param fallback - Имя поля, из которого брать значение для slug при создании
 * @returns FieldHook для использования в конфигурации полей Payload CMS
 */
export const formatSlug =
  (fallback: string): FieldHook =>
  ({ data, operation, originalDoc, value }) => {
    if (typeof value === 'string') {
      return formatSlugString(value)
    }

    if (operation === 'create' || operation === 'update') {
      const fallbackData = data?.[fallback] || originalDoc?.[fallback]

      if (fallbackData && typeof fallbackData === 'string') {
        if (operation === 'create' || !originalDoc?.slug) {
          return formatSlugString(fallbackData)
        }
      }
    }

    return value
  }
