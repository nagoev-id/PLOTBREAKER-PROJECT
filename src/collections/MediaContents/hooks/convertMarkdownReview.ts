import type { FieldHook, RichTextField } from 'payload';
import {
  convertMarkdownToLexical,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical';

type LexicalNode = {
  type?: string;
  text?: string;
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
 * Извлекает весь текст из Lexical JSON в виде строки.
 * Параграфы разделяются двойным переносом строки.
 */
const extractTextFromLexical = (state: LexicalState): string => {
  const root = state?.root;
  if (!root?.children) return '';

  const lines: string[] = [];

  const extractNode = (node: LexicalNode): string => {
    if (node.type === 'text') return node.text ?? '';
    if (node.children) return node.children.map(extractNode).join('');
    return '';
  };

  for (const child of root.children) {
    lines.push(extractNode(child));
  }

  return lines.join('\n\n');
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
 * Если вставленный текст содержит Markdown-разметку (##, **, ***, > и т.д.),
 * хук автоматически конвертирует его в Lexical JSON перед сохранением.
 *
 * Это позволяет вставлять текст из AI (ChatGPT/Claude) в формате Markdown
 * и получать корректно отформатированный контент в редакторе.
 */
export const convertMarkdownReview: FieldHook = async ({
  value,
  field,
  req,
}) => {
  // Если значение пустое — пропускаем
  if (!value) return value;

  // Извлекаем текст из Lexical JSON
  const rawText = extractTextFromLexical(value as LexicalState);
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
      '[convertMarkdownReview] Markdown detected and converted to Lexical'
    );

    return lexicalState;
  } catch (error) {
    req.payload.logger.error(
      `[convertMarkdownReview] Failed to convert markdown: ${String(error)}`
    );
    // При ошибке возвращаем оригинальное значение
    return value;
  }
};
