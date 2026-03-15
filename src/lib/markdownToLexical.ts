import {
  convertMarkdownToLexical,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

/**
 * Конвертирует markdown-строку в Lexical JSON state.
 * Используется в API routes для dashboard-формы.
 */
export async function convertReviewMarkdown(markdown: string) {
  const payload = await getPayload({ config: configPromise });
  const editorConfig = await editorConfigFactory.default({
    config: payload.config,
  });

  return convertMarkdownToLexical({
    editorConfig,
    markdown,
  });
}
