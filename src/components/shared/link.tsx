import Link from 'next/link';
import React, { FC } from 'react';
import { cn } from '@/lib';
import { Button, ButtonProps } from '@/components/ui';
import { getURL } from '@/utilities/getURL';

type CMSLinkType = {
  /** Внешний вид ссылки ("inline" или варианты Button) */
  appearance?: 'inline' | ButtonProps['variant'];
  /** Дочерние элементы (текст или компоненты) */
  children?: React.ReactNode;
  /** CSS классы */
  className?: string;
  /** Текст ссылки (если нет children) */
  label?: string | null;
  /** Открывать в новой вкладке */
  newTab?: boolean | null;
  /** Ссылка на внутренний документ CMS */
  reference?: {
    relationTo: 'pages' | 'books' | 'authors';
    value: string | number | { slug?: string | null };
  } | null;
  /** Размер кнопки (если appearance != inline) */
  size?: ButtonProps['size'] | null;
  /** Тип ссылки: кастомный URL или internal reference */
  type?: 'custom' | 'reference' | null;
  /** Прямой URL (для type="custom") */
  url?: string | null;
  /** Обработчик клика */
  onClick?: () => void;
};

/**
 * Универсальный компонент ссылки.
 * Умеет работать как с обычными URL, так и с внутренними ссылками CMS.
 * Может рендериться как текст или как кнопка.
 */
export const CMSLink: FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = 'inline',
    children,
    className,
    label,
    newTab,
    reference,
    size: sizeFromProps,
    url,
    onClick,
  } = props;

  const href = getURL(type, url, reference);

  if (!href) return null;

  const size = appearance === 'link' ? null : sizeFromProps;
  const newTabProps = newTab
    ? { rel: 'noopener noreferrer', target: '_blank' }
    : {};

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'inline') {
    return (
      <Link
        className={cn(className)}
        href={href || url || ''}
        {...newTabProps}
        onClick={onClick}
      >
        {label && label}
        {children && children}
      </Link>
    );
  }

  return (
    <Button
      asChild
      className={className}
      size={size}
      variant={appearance}
      onClick={onClick}
    >
      <Link className={cn(className)} href={href || url || ''} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    </Button>
  );
};
