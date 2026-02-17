import type { Access, FieldAccess } from 'payload';
import type { User } from '@/payload-types';

/**
 * Проверка, является ли пользователь администратором
 */
export const admin: Access = ({ req: { user } }) => {
  // Если пользователь не аутентифицирован - доступ запрещён
  if (!user) return false;
  // Разрешаем доступ только администраторам
  return user.collection === 'users' && (user as User).role === 'admin';
};

/**
 * Проверка, является ли пользователь администратором (для полей)
 */
export const adminField: FieldAccess = ({ req: { user } }) => {
  return !!(
    user &&
    user.collection === 'users' &&
    (user as User).role === 'admin'
  );
};

/**
 * Только администратор может читать, создавать, обновлять, удалять
 */
export const adminOnly: Access = ({ req: { user } }) => {
  return !!(
    user &&
    user.collection === 'users' &&
    (user as User).role === 'admin'
  );
};
