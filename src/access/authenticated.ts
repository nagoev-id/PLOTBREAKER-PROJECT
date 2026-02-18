import type { Access } from 'payload';

/**
 * Проверяет, авторизован ли пользователь.
 * Используется в качестве правила доступа (Access Control) в Payload CMS.
 *
 * @param args - Аргументы доступа, содержащие объект запроса с данными пользователя.
 * @returns Возвращает true, если пользователь авторизован, иначе false.
 */
export const authenticated: Access = ({ req: { user } }) => Boolean(user);
