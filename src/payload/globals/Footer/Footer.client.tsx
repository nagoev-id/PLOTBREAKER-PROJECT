'use client';

import React, { FC, useMemo } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/shared';
import type { Footer as FooterGlobal } from '@/payload-types';
import { cn } from '@/lib/utils';

type FooterClientProps = {
  data: FooterGlobal;
};

/**
 * Клиентский компонент футера приложения.
 *
 * Если в `data.logo.logoIcon` передан SVG-код, он рендерится напрямую
 * через `dangerouslySetInnerHTML`; в противном случае отображается
 * текстовое название `data.logo.logoText`.
 *
 * @component
 * @param data - Данные глобала футера из Payload CMS
 */
export const FooterClient: FC<FooterClientProps> = ({ data }) => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const footerColumns = useMemo(
    () => [
      {
        title: 'Разделы',
        links: [
          { label: 'Главная', href: '/' },
          { label: 'Коллекции', href: '/collections' },
          { label: 'Блог', href: '/blog' },
          { label: 'О проекте', href: '/about' },
        ],
      },
      {
        title: 'Категории',
        links: [
          { label: 'Фильмы', href: '/?type=film' },
          { label: 'Сериалы', href: '/?type=series' },
          { label: 'Мультфильмы', href: '/?type=cartoon' },
        ],
      },
      {
        title: 'Навигация',
        links: [
          { label: 'Последние записи', href: '/?status=watched' },
          { label: 'Планирую', href: '/?status=planned' },
        ],
      },
    ],
    []
  );

  if (!data) {
    return null;
  }

  const logoIcon = data?.logo?.logoIcon;
  const logoText = data?.logo?.logoText || 'ПРОСМОТРЕНО';
  const watermarkText = 'ПРОСМОТРЕНО';

  return (
    <footer className="relative w-full overflow-hidden border-t border-border/80 bg-background px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-10 text-sm text-muted-foreground md:flex-row md:gap-8">
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
            aria-label="Переход на главную страницу"
          >
            {logoIcon ? (
              <span
                className="shrink-0 [&>svg]:h-8 [&>svg]:w-16 [&>svg]:fill-black dark:[&>svg]:fill-white"
                dangerouslySetInnerHTML={{ __html: logoIcon }}
                aria-label="Логотип сайта"
              />
            ) : null}
            <span className="text-base font-semibold tracking-tight text-foreground">
              {logoText}
            </span>
          </Link>
          <p className="max-w-md text-sm leading-relaxed">
            © {currentYear}. Все права защищены.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title} className="space-y-3">
              <p className="text-xs font-bold tracking-[0.12em] text-foreground uppercase">
                {column.title}
              </p>
              <ul className="space-y-2.5">
                {column.links.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <p
        className={cn(
          'mt-12 select-none bg-gradient-to-b from-zinc-200 via-zinc-300 to-zinc-50 bg-clip-text text-center text-5xl font-bold tracking-tight text-transparent sm:text-6xl md:mt-16 md:text-8xl lg:text-[10rem] xl:text-[12rem]',
          'dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-950'
        )}
      >
        {watermarkText}
      </p>
    </footer>
  );
};
