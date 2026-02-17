/**
 * Получает URL на основе типа ссылки и ссылки
 * @param type Тип ссылки
 * @param url URL
 * @param reference Ссылка
 * @returns URL
 */
export const getURL = (
  type?: 'custom' | 'reference' | null,
  url?: string | null,
  reference?: {
    relationTo: string;
    value: string | number | { slug?: string | null };
  } | null
): string | null => {
  if (type === 'custom') {
    return url || null;
  }

  if (
    type === 'reference' &&
    reference &&
    typeof reference.value === 'object' &&
    reference.value.slug
  ) {
    if (reference.relationTo === 'pages' && reference.value.slug === 'home') {
      return '/';
    }
    const prefix =
      reference.relationTo !== 'pages' ? `/${reference.relationTo}` : '';
    return `${prefix}/${reference.value.slug}`;
  }

  return url || null;
};
