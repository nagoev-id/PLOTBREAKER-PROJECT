'use client';

import React, { FC, useMemo } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/shared';
import type { Footer as FooterGlobal } from '@/payload-types';

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
 * @param data - Данные глобала футера из Payload CMS,
 */

export const FooterClient: FC<FooterClientProps> = ({ data }) => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  if (!data) {
    return null;
  }

  const logoIcon = data?.logo?.logoIcon;
  const logoText = data?.logo?.logoText;

  return (
    <footer className="border-t-3 bg-zinc-950 py-12 text-white">
      <div className="container mx-auto grid place-items-center gap-6 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          aria-label="Переход на главную страницу"
        >
          {logoIcon ? (
            <span
              className="[&>svg]:h-8 [&>svg]:w-16 [&>svg]:fill-white"
              dangerouslySetInnerHTML={{ __html: logoIcon }}
              aria-label="Логотип сайта"
            />
          ) : (
            <span className="text-lg font-medium">{logoText}</span>
          )}
        </Link>

        <div className="grid place-items-center space-y-2 text-center text-sm opacity-70">
          <span className="leading-relaxed">{logoText}</span>
          <span className="text-xs">© {currentYear} Все права защищены</span>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
};
