import type { Field } from 'payload';
import { convertMarkdownReview } from '@/payload/hooks/convertMarkdownReview';

type RichTextFieldOptions = {
  name?: string;
  label?: string;
  description?: string;
  required?: boolean;
};

/**
 * Фабричная функция для создания richText-поля с хуком конвертации Markdown.
 *
 * По умолчанию подключает `convertMarkdownReview` в `beforeChange`,
 * что позволяет вводить текст в формате Markdown и автоматически
 * конвертировать его в Lexical richText при сохранении.
 *
 * @param options - Настройки поля
 * @param options.name - Имя поля (по умолчанию `'review'`)
 * @param options.label - Отображаемая метка в админке
 * @param options.description - Описание поля в админке
 * @param options.required - Обязательность заполнения
 * @returns Объект конфигурации поля {@link Field}
 *
 * @example
 * // Стандартное использование — поле «Мой отзыв»
 * richTextField({ label: 'Мой отзыв', description: 'Мой отзыв о фильме или сериале' })
 *
 * @example
 * // Кастомное имя и обязательность
 * richTextField({ name: 'body', label: 'Текст статьи', required: true })
 */
export const richTextField = ({
  name = 'review',
  label,
  description,
  required,
}: RichTextFieldOptions = {}): Field => ({
  name,
  type: 'richText',
  ...(label && { label }),
  ...(required && { required }),
  ...(description && {
    admin: { description },
  }),
  hooks: {
    beforeChange: [convertMarkdownReview],
  },
});
