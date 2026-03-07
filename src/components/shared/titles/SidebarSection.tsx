import { FC, JSX } from 'react';

type SidebarSectionProps = {
  title: string;
  children: React.ReactNode;
  contentClassName?: string;
};
/**
 * Компонент секции сайдбара
 *
 * @param title - Заголовок секции
 * @param children - Дочерние элементы секции
 * @param contentClassName - Классы для контента секции
 * @returns Секция сайдбара
 */
export const SidebarSection: FC<SidebarSectionProps> = ({
  title,
  children,
  contentClassName,
}): JSX.Element => (
  <div className="space-y-1.5">
    <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
    <div className={contentClassName}>{children}</div>
  </div>
);
