'use client';

import { RowLabelProps, useRowLabel } from '@payloadcms/ui';
import { FC, JSX } from 'react';
import { HeaderGlobal } from '@/utilities/types';

/**
 * Компонент для отображения метки строки навигации в админ-панели Payload CMS.
 *
 * Компонент выполняет следующие задачи:
 * - Получает данные элемента навигации через useRowLabel hook
 * - Формирует читаемую метку с номером строки и названием ссылки
 * - Отображает метку в интерфейсе админ-панели
 *
 * @returns {JSX.Element} Метка строки с информацией об элементе навигации
 */

export const RowLabel: FC<RowLabelProps> = (): JSX.Element => {
  // Получаем данные элемента навигации из контекста строки
  const data = useRowLabel<NonNullable<HeaderGlobal['navItems']>[number]>();

  // Формируем метку с номером строки и названием ссылки
  const label = data?.data?.link?.label
    ? `Nav item ${data.rowNumber !== undefined ? data.rowNumber + 1 : ''}: ${data?.data?.link?.label}`
    : 'Row';

  return <div>{label}</div>;
};
