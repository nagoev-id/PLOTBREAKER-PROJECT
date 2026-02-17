import type { FieldHook } from 'payload';
import type { User } from '@/payload-types';

// Хук для защиты поля role от изменения не-администраторами
export const protectRoles: FieldHook<User> = ({ req, value, originalDoc }) => {
  const isAdmin =
    req.user?.collection === 'users' && (req.user as User).role === 'admin';

  if (isAdmin) {
    return value;
  }

  // При создании пользователя, если не админ - роль всегда 'user'
  if (!originalDoc) {
    return 'user';
  }

  // При обновлении, если не админ - роль не меняется
  return originalDoc.role;
};
