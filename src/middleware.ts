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
export const middleware = (request: NextRequest): NextResponse => {
  // Пытаемся получить токен авторизации из кук
  const token = request.cookies.get('payload-token');

  // Если токен не найден, перенаправляем пользователя на страницу логина админки
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Если токен присутствует, разрешаем переход к следующему этапу обработки запроса
  return NextResponse.next();
};

export default middleware;
