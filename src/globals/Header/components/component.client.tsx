'use client';

import Link from 'next/link';
import React, { FC, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Search, ShieldUser, SquarePlus, X } from 'lucide-react';
import { CMSLink } from '@/components/shared/link';
import { getURL } from '@/utilities/getURL';
import { HeaderGlobal, NavItemCollection } from '@/utilities/types';
import { SearchModal } from '@/components/shared/searchModal';

// Тип свойств компонента HeaderClient
type HeaderClientProps = {
  data: HeaderGlobal;
};

/**
 * Клиентский компонент шапки сайта с адаптивным меню
 *
 * Компонент отображает логотип, навигационное меню и поиск.
 * Поддерживает мобильную версию с бургер-меню и блокировкой прокрутки.
 */
export const HeaderClient: FC<HeaderClientProps> = ({ data }) => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = (data?.navItems || []) as NavItemCollection[];
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  /**
   * Закрывает мобильное меню при изменении маршрута
   * Это обеспечивает корректное поведение при навигации
   */
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  /**
   * Управляет блокировкой прокрутки страницы при открытом мобильном меню
   * Предотвращает прокрутку фонового контента
   */
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    }

    // Очистка стиля при размонтировании компонента
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isMenuOpen]);

  /**
   * Обработчик переключения мобильного меню
   */
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  return (
    <>
      {/* Основная шапка сайта */}
      <header
        className="bg-background/80 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b-2 backdrop-blur transition-all duration-300"
        role="banner"
      >
        <div className="container mx-auto flex h-16 items-center gap-2 px-4">
          {/* Логотип сайта */}
          <Link
            href="/"
            className="mr-auto flex items-center gap-2"
            aria-label="На главную страницу"
          >
            {data?.logo?.logoIcon ? (
              <span
                className="[&>svg]:h-8 [&>svg]:w-8 dark:[&>svg]:fill-white"
                dangerouslySetInnerHTML={{ __html: data?.logo?.logoIcon }}
                aria-hidden="true"
              />
            ) : (
              <span className="font-bold">{data?.logo?.logoText}</span>
            )}
            {data?.logo?.logoText && (
              <span className="text-sm font-bold tracking-tight uppercase sm:text-xl">
                {data?.logo?.logoText}
              </span>
            )}
          </Link>

          {/* Десктопная навигация */}
          <nav
            className="text-muted-foreground hidden items-center gap-4 text-sm font-medium md:flex"
            aria-label="Основная навигация"
          >
            {navItems.map(({ link }, i) => {
              const href = getURL(link.type, link.url, link.reference as any);
              const isActive =
                href &&
                (pathname === href ||
                  (href !== '/' && pathname?.startsWith(href)));

              return (
                <CMSLink
                  key={`nav-${i}`}
                  {...link}
                  appearance="inline"
                  className={isActive ? 'text-foreground' : ''}
                />
              );
            })}
          </nav>

          {/* Кнопки поиска и мобильного меню */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSearch}
              className="hover:bg-accent rounded-full p-2 transition-colors"
              aria-label="Поиск по сайту"
              type="button"
            >
              <Search size={18} />
            </button>
            <button
              onClick={toggleMenu}
              className="hover:bg-accent relative z-50 rounded-full p-2 transition-colors md:hidden"
              aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={isMenuOpen}
              type="button"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Мобильное навигационное меню */}
      <div
        className={`bg-background/95 fixed inset-0 z-40 backdrop-blur-sm transition-all duration-300 md:hidden ${
          isMenuOpen
            ? 'visible opacity-100'
            : 'pointer-events-none invisible opacity-0'
        }`}
        role="navigation"
        aria-label="Мобильное меню"
      >
        <nav className="text-muted-foreground flex h-full flex-col items-center justify-center gap-4 md:text-xl font-medium">
          {navItems.map(({ link }, i) => {
            const href = getURL(link.type, link.url, link.reference as any);
            const isActive =
              href &&
              (pathname === href ||
                (href !== '/' && pathname?.startsWith(href)));

            return (
              <CMSLink
                key={`nav-${i}`}
                {...link}
                appearance="inline"
                className={isActive ? 'text-foreground' : ''}
              />
            );
          })}
        </nav>
      </div>
      <SearchModal
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
      />
    </>
  );
};
