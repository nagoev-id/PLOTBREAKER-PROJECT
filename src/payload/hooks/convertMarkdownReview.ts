import type { FieldHook, RichTextField } from 'payload';
import {
  convertMarkdownToLexical,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical';

type LexicalNode = {
  type?: string;
  text?: string;
  format?: number;
  children?: LexicalNode[];
  [key: string]: unknown;
};

type LexicalState = {
  root?: {
    children?: LexicalNode[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

/**
 * Проверяет, является ли контент «сырым текстом без форматирования».
 * True = все корневые ноды — обычные параграфы, содержащие только
 * неформатированные текстовые ноды (format === 0 или отсутствует).
 *
 * Это означает, что пользователь вставил markdown как plain text,
 * а не через форматирование редактора.
 */
const isPlainTextOnly = (state: LexicalState): boolean => {
  const root = state?.root;
  if (!root?.children?.length) return false;

  return root.children.every((child) => {
    // Только параграфы и linebreak на уровне root
    if (child.type === 'linebreak') return true;
    if (child.type !== 'paragraph') return false;

    // Внутри параграфа — только text и linebreak, без форматирования
    if (!child.children) return true;
    return child.children.every(
      (node) =>
        node.type === 'linebreak' ||
        (node.type === 'text' && (!node.format || node.format === 0)),
    );
  });
};

/**
 * Извлекает весь текст из plain-text Lexical JSON.
 * Параграфы разделяются двойным переносом строки.
 */
const extractPlainText = (state: LexicalState): string => {
  const root = state?.root;
  if (!root?.children) return '';

  const lines: string[] = [];

  for (const child of root.children) {
    if (child.type === 'linebreak') {
      lines.push('');
      continue;
    }
    if (!child.children) {
      lines.push('');
      continue;
    }

    const parts: string[] = [];
    for (const node of child.children) {
      if (node.type === 'text') {
        parts.push(node.text ?? '');
      } else if (node.type === 'linebreak') {
        parts.push('\n');
      }
    }
    lines.push(parts.join(''));
  }

  return lines.join('\n');
};

/**
 * Проверяет, содержит ли текст Markdown-разметку.
 * Ищет характерные паттерны: заголовки (#), жирный (**), курсив (*),
 * горизонтальные линии (***), цитаты (>), списки (- ).
 */
const looksLikeMarkdown = (text: string): boolean => {
  const markdownPatterns = [
    /^#{1,6}\s/m, // Заголовки: # ## ###
    /\*\*[^*]+\*\*/, // Жирный: **text**
    /^\*{3,}$/m, // Горизонтальная линия: ***
    /^>\s/m, // Цитата: > text
    /^[-*]\s/m, // Список: - item или * item
    /^---$/m, // Горизонтальная линия: ---
  ];
  return markdownPatterns.some((pattern) => pattern.test(text));
};

/**
 * Field hook для поля `review` (richText).
 *
 * Конвертирует markdown в Lexical JSON ТОЛЬКО если вставленный текст —
 * это raw markdown (все ноды — plain paragraphs без форматирования).
 *
 * Если редактор уже распарсил контент (heading, list, formatted text),
 * хук НЕ трогает данные — они уже в правильном формате.
 */
export const convertMarkdownReview: FieldHook = async ({
  value,
  field,
  req,
}) => {
  // Если значение пустое — пропускаем
  if (!value) return value;

  const state = value as LexicalState;

  // Если контент уже содержит структурированные ноды (heading, list и т.д.)
  // — НЕ конвертируем, редактор уже распарсил markdown
  if (!isPlainTextOnly(state)) return value;

  // Извлекаем текст из plain-text нод
  const rawText = extractPlainText(state);
  if (!rawText.trim()) return value;

  // Если текст не содержит Markdown — оставляем как есть
  if (!looksLikeMarkdown(rawText)) return value;

  try {
    // Получаем конфиг редактора из поля
    const editorConfig = editorConfigFactory.fromField({
      field: field as RichTextField,
    });

    // Конвертируем Markdown в Lexical JSON
    const lexicalState = convertMarkdownToLexical({
      editorConfig,
      markdown: rawText,
    });

    req.payload.logger.info(
      '[convertMarkdownReview] Markdown detected and converted to Lexical',
    );

    return lexicalState;
  } catch (error) {
    req.payload.logger.error(
      `[convertMarkdownReview] Failed to convert markdown: ${String(error)}`,
    );
    // При ошибке возвращаем оригинальное значение
    return value;
  }
};
