'use client';

import type { SerializedEditorState } from 'lexical';
import {
  JSXConverters,
  RichText as PayloadRichText,
} from '@payloadcms/richtext-lexical/react';

type RichTextProps = {
  content: SerializedEditorState | string | null | undefined;
  className?: string;
  converters?: JSXConverters;
};

/**
 * Компонент для рендеринга Lexical richText на фронтенде
 * Поддерживает как новый формат richText, так и старый формат textarea (string)
 */
export function RichText({ content, className, converters }: RichTextProps) {
  if (!content) {
    return null;
  }

  // Если content - строка (старый формат textarea), рендерим как обычный текст
  if (typeof content === 'string') {
    return (
      <p
        className={`leading-relaxed text-justify whitespace-pre-line ${className || ''}`}
      >
        {content}
      </p>
    );
  }

  // Если content - richText (новый формат), рендерим через Payload RichText
  return (
    <div className={className}>
      <PayloadRichText data={content} converters={converters} />
    </div>
  );
}
