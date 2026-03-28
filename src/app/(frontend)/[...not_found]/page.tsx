import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Страница не найдена — PlotBreaker',
  description: 'Запрашиваемая страница не существует.',
};

/**
 * Компонент для перехвата всех неопределенных маршрутов.
 * Принудительно вызывает функцию notFound() для отображения стандартной страницы 404.
 */
const NotFoundCatchAll = () => notFound();

export default NotFoundCatchAll;
