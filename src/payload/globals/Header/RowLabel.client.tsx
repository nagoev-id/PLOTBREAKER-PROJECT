'use client';

import type { FC, JSX } from 'react';
import { RowLabelProps, useRowLabel } from '@payloadcms/ui';

import type { Header } from '@/payload-types';

type NavItem = NonNullable<Header['navItems']>[number];

/**
 * Клиентский компонент метки строки (Row Label) для массива навигационных
 * элементов в админ-панели Payload CMS.
 *
 * Использует хук `useRowLabel` для получения данных текущей строки массива
 * и формирует читаемую метку в формате `Nav item <номер>: <label>`.
 * Если метка ссылки отсутствует, отображается fallback-значение `'Row'`.
 *
 * @component
 * @returns `<div>` с меткой навигационного элемента, например:
 *          `"Nav item 1: Главная"` или `"Row"` при отсутствии данных
 */
export const RowLabel: FC<RowLabelProps> = (): JSX.Element => {
  const { data, rowNumber } = useRowLabel<NavItem>();
  const linkLabel = data?.link?.label;

  const label = linkLabel
    ? `Nav item${rowNumber !== undefined ? ` ${rowNumber + 1}` : ''}: ${linkLabel}`
    : 'Row';

  return <div>{label}</div>;
};
