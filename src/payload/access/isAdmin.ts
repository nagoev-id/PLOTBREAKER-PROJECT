import type { Access } from 'payload';

/**
 * Открытый доступ — без ограничений.
 */
export const anyone: Access = () => true;

/**
 * Доступ только для аутентифицированных пользователей.
 * В данном проекте единственный пользователь — администратор,
 * поэтому проверка авторизации эквивалентна проверке роли admin.
 */
export const admin: Access = ({ req: { user } }) => {
  return !!user;
};
