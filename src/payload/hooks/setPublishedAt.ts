import type { FieldHook } from 'payload';

// ============================================================================
// setPublishedAt
// ============================================================================

export const setPublishedAt: FieldHook = ({ value }) => {
  if (!value) return new Date().toISOString();
  return value;
};
