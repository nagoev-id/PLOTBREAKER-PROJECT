/**
 * Конвертирует Lexical JSON state обратно в Markdown.
 * Используется для предзаполнения textarea при редактировании записи.
 */

interface LexicalNode {
  type: string;
  text?: string;
  tag?: string;
  format?: number | string;
  listType?: string;
  children?: LexicalNode[];
  value?: number;
  url?: string;
  fields?: { url?: string; newTab?: boolean };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LexicalState = Record<string, any>;

// Lexical format bitmask constants
const IS_BOLD = 1;
const IS_ITALIC = 2;
const IS_STRIKETHROUGH = 4;
const IS_CODE = 16;

function formatText(text: string, format: number | string | undefined): string {
  if (!format || typeof format === 'string') return text;
  let result = text;
  if (format & IS_CODE) result = `\`${result}\``;
  if (format & IS_STRIKETHROUGH) result = `~~${result}~~`;
  if (format & IS_BOLD) result = `**${result}**`;
  if (format & IS_ITALIC) result = `*${result}*`;
  return result;
}

function serializeChildren(children: LexicalNode[]): string {
  return children.map((child) => serializeNode(child)).join('');
}

function serializeNode(node: LexicalNode): string {
  // Text node
  if (node.type === 'text') {
    return formatText(node.text || '', node.format);
  }

  // Link node
  if (node.type === 'link') {
    const url = node.fields?.url || node.url || '';
    const content = node.children ? serializeChildren(node.children) : '';
    return `[${content}](${url})`;
  }

  // Line break
  if (node.type === 'linebreak') {
    return '\n';
  }

  // Paragraph
  if (node.type === 'paragraph') {
    const content = node.children ? serializeChildren(node.children) : '';
    return `${content}\n\n`;
  }

  // Heading
  if (node.type === 'heading') {
    const level = node.tag ? parseInt(node.tag.replace('h', ''), 10) : 2;
    const hashes = '#'.repeat(level);
    const content = node.children ? serializeChildren(node.children) : '';
    return `${hashes} ${content}\n\n`;
  }

  // Quote
  if (node.type === 'quote') {
    const content = node.children ? serializeChildren(node.children) : '';
    const lines = content.trim().split('\n');
    return lines.map((line) => `> ${line}`).join('\n') + '\n\n';
  }

  // List
  if (node.type === 'list') {
    const items = (node.children || [])
      .map((item, index) => {
        const content = item.children ? serializeChildren(item.children).trim() : '';
        if (node.listType === 'number') {
          return `${index + 1}. ${content}`;
        }
        return `- ${content}`;
      })
      .join('\n');
    return `${items}\n\n`;
  }

  // List item (handled by list, but just in case)
  if (node.type === 'listitem') {
    const content = node.children ? serializeChildren(node.children) : '';
    return content;
  }

  // Horizontal rule
  if (node.type === 'horizontalrule') {
    return '---\n\n';
  }

  // Fallback: try to serialize children
  if (node.children) {
    return serializeChildren(node.children);
  }

  return node.text || '';
}

export function lexicalToMarkdown(state: LexicalState | null | undefined): string {
  if (!state?.root?.children) return '';
  return serializeChildren(state.root.children).trim();
}
