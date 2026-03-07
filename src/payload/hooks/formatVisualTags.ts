import type { FieldHook } from 'payload';

// ============================================================================
// formatVisualTags
// ============================================================================

export const formatVisualTags: FieldHook = ({ value }) => {
  if (typeof value === 'string') {
    const elements = value.split(/[•, ]+/);
    const tags = elements
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    return tags.join(', ');
  }
  return value;
};
