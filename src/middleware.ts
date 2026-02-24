import { NextRequest, NextResponse } from 'next/server';

/**
 * Конфигурация middleware для определения маршрутов, к которым применяется проверка.
 * Используется регулярное выражение для исключения путей: admin, api, статика Next.js, изображения, favicon и медиа.
 */
export const config = {
  matcher: ['/((?!admin|api|_next/static|_next/image|favicon.ico|media).*)'],
};

/**
 * Middleware для защиты маршрутов сайта.
 * Проверяет наличие сессионного токена Payload CMS.
 */
export const middleware = (_request: NextRequest): NextResponse => {
  // TODO: Временно отключена проверка авторизации — сайт доступен публично.
  // Админ-функции (Dashboard, ссылки) защищены через серверную проверку роли в layout
  // и AuthProvider. Чтобы получить доступ к админке — зайти на /admin и авторизоваться.

  // const token = request.cookies.get('payload-token');
  // if (!token) {
  //   return NextResponse.redirect(new URL('/admin/login', request.url));
  // }

  return NextResponse.next();
};

export default middleware;
