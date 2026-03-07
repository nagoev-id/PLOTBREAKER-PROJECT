import type { Access } from 'payload';

/**
 * Доступ только для залогиненных пользователей (любая роль).
 */
export const authenticated: Access = ({ req: { user } }) => {
  return Boolean(user);
};
