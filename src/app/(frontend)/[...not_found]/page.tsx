import { notFound } from 'next/navigation';

/**
 * Компонент для перехвата всех неопределенных маршрутов.
 * Принудительно вызывает функцию notFound() для отображения стандартной страницы 404.
 */
const NotFoundCatchAll = () => {
  notFound();
};

export default NotFoundCatchAll;
