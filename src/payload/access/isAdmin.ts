import type { Access, FieldAccess } from 'payload';

/**
 * Доступ для всех — без ограничений.
 */
export const anyone: Access = () => true;

/**
 * Доступ для аутентифицированных пользователей.
 * Единственный пользователь — админ, поэтому достаточно проверить авторизацию.
 */
export const admin: Access = ({ req: { user } }) => {
  return !!user;
};

/**
 * Полный запрет доступа, кроме авторизованного пользователя.
 */
export const adminOnly: Access = ({ req: { user } }) => {
  return !!user;
};

/**
 * Доступ на уровне поля — только для авторизованного пользователя.
 */
export const adminField: FieldAccess = ({ req: { user } }) => {
  return !!user;
};
