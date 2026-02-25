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
 * Проверяет, содержит ли Lexical JSON уже отформатированные узлы
 * (заголовки, списки, цитаты и т.д.), что означает —
 * контент уже был сконвертирован и не нужно его трогать.
 */
const hasRichFormatting = (state: LexicalState): boolean => {
  const richNodeTypes = new Set([
    'heading',
    'list',
    'listitem',
    'quote',
    'horizontalrule',
    'upload',
    'link',
    'relationship',
    'block',
  ]);

  const checkNode = (node: LexicalNode): boolean => {
    if (node.type && richNodeTypes.has(node.type)) return true;
    // Текстовый узел с форматированием (жирный, курсив и т.д.)
    if (
      node.type === 'text' &&
      typeof node.format === 'number' &&
      node.format > 0
    )
      return true;
    if (node.children) return node.children.some(checkNode);
    return false;
  };

  const root = state?.root;
  if (!root?.children) return false;
  return root.children.some(checkNode);
};

/**
 * Field hook для поля `review` (richText).
 *
 * Если вставленный текст содержит Markdown-разметку (##, **, ***, > и т.д.),
 * хук автоматически конвертирует его в Lexical JSON перед сохранением.
 *
 * Это позволяет вставлять текст из AI (ChatGPT/Claude) в формате Markdown
 * и получать корректно отформатированный контент в редакторе.
 *
 * Если контент уже содержит Lexical-форматирование (heading, list, quote и т.д.),
 * хук НЕ перезаписывает его — чтобы не терять существующее форматирование.
 */
export const convertMarkdownReview: FieldHook = async ({
  value,
  field,
  req,
}) => {
  // Если значение пустое — пропускаем
  if (!value) return value;

  const lexicalState = value as LexicalState;

  // Если контент уже содержит отформатированные узлы — не трогаем
  if (hasRichFormatting(lexicalState)) {
    return value;
  }

  // Извлекаем текст из Lexical JSON
  const rawText = extractTextFromLexical(lexicalState);
  if (!rawText.trim()) return value;

  // Если текст не содержит Markdown — оставляем как есть
  if (!looksLikeMarkdown(rawText)) return value;

  try {
    // Получаем конфиг редактора из поля
    const editorConfig = editorConfigFactory.fromField({
      field: field as RichTextField,
    });

    // Конвертируем Markdown в Lexical JSON
    const convertedState = convertMarkdownToLexical({
      editorConfig,
      markdown: rawText,
    });

    req.payload.logger.info(
      '[convertMarkdownReview] Markdown detected and converted to Lexical'
    );

    return convertedState;
  } catch (error) {
    req.payload.logger.error(
      `[convertMarkdownReview] Failed to convert markdown: ${String(error)}`
    );
    // При ошибке возвращаем оригинальное значение
    return value;
  }
};
