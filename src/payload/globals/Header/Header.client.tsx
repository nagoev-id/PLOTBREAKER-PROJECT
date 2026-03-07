'use client';

import Link from 'next/link';
import { FC, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Menu, Search, ShieldUser, X } from 'lucide-react';

import { getURL } from '@/lib/utils';
import { CMSLink } from '@/components/shared';

import type { Header as HeaderGlobal, User } from '@/payload-types';
import { SearchModal } from '@/features/search/components/SearchModal';

type NavItemCollection = NonNullable<HeaderGlobal['navItems']>[number];

type HeaderClientProps = {
  data: HeaderGlobal;
  user: User | null;
};

/**
 * Клиентский компонент шапки приложения.
 *
 * Отображает sticky-хедер с логотипом, десктопной навигацией,
 * мобильным бургер-меню и кнопкой поиска.
 *
 * Побочные эффекты:
 * - Закрывает мобильное меню при смене маршрута (`pathname`)
 * - Блокирует прокрутку страницы (`overflow: hidden`) при открытом
 *   мобильном меню и восстанавливает её при закрытии или размонтировании
 *
 * Авторизованным пользователям (`user !== null`) дополнительно
 * отображаются ссылки на `/dashboard` и `/admin` (открывается в новой вкладке).
 *
 * @component
 * @param props - Пропсы компонента
 * @param props.data - Данные глобала хедера из Payload CMS:
 *                     логотип (SVG или текст) и массив навигационных элементов
 * @param props.user - Авторизованный пользователь или `null`,
 *                     если пользователь не вошёл в систему
 */
export const HeaderClient: FC<HeaderClientProps> = ({ data, user }) => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isMenuOpen]);

  if (!data) {
    return null;
  }

  const navItems = (data.navItems || []) as NavItemCollection[];

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const toggleSearch = () => setIsSearchOpen((prev) => !prev);

  const renderedNavItems = navItems.map(({ link }, i) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const href = getURL(link.type, link.url, link.reference as any);
    const isActive =
      href &&
      (pathname === href || (href !== '/' && pathname?.startsWith(href)));

    return (
      <CMSLink
        key={`nav-${i}`}
        {...link}
        appearance="inline"
        className={isActive ? 'text-foreground' : ''}
      />
    );
  });

  return (
    <>
      <header
        className="bg-background/80  supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur transition-all duration-300"
        role="banner"
      >
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          {/* Логотип */}
          <Link
            href="/"
            className="mr-auto flex items-center gap-2"
            aria-label="На главную страницу"
          >
            {data.logo?.logoIcon ? (
              <span
                className="[&>svg]:h-8 [&>svg]:w-8 dark:[&>svg]:fill-white"
                dangerouslySetInnerHTML={{ __html: data.logo.logoIcon }}
                aria-hidden="true"
              />
            ) : data.logo?.logoText ? (
              <span className="text-xl font-bold tracking-tight uppercase">
                {data.logo.logoText}
              </span>
            ) : null}

            {data.logo?.logoIcon && data.logo?.logoText && (
              <span className="hidden text-sm font-bold tracking-tight uppercase sm:text-xl sm:block">
                {data.logo.logoText}
              </span>
            )}
          </Link>

          {/* Десктопное меню */}
          <nav
            className="text-muted-foreground hidden items-center gap-6 text-sm font-medium md:flex"
            aria-label="Основная навигация"
          >
            {renderedNavItems}
            {user && (
              <div className="flex items-center gap-2 border-l pl-4">
                <Link
                  href="/dashboard"
                  className={`transition-colors hover:text-foreground ${
                    pathname?.startsWith('/dashboard')
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                  aria-label="Перейти в дэшборд"
                >
                  <LayoutDashboard size={18} />
                </Link>
                <Link
                  href="/admin"
                  aria-label="Перейти в панель управления"
                  target="_blank"
                  className="hover:bg-accent rounded-full p-2 transition-colors"
                >
                  <ShieldUser size={18} />
                </Link>
              </div>
            )}
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
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
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Мобильное меню */}
      <div
        className={`bg-background/95 fixed inset-0 z-40 backdrop-blur-sm transition-all duration-300 md:hidden ${
          isMenuOpen
            ? 'visible opacity-100'
            : 'pointer-events-none invisible opacity-0'
        }`}
        role="navigation"
        aria-label="Мобильное меню"
      >
        <nav className="text-muted-foreground flex h-full flex-col items-center justify-center gap-6 text-lg font-medium">
          {renderedNavItems}
          {user && (
            <div className="flex items-center gap-4 mt-4 border-t pt-4">
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-2 transition-colors hover:text-foreground ${
                  pathname?.startsWith('/dashboard')
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                <LayoutDashboard size={20} />
                <span>Дэшборд</span>
              </Link>
              <Link
                href="/admin"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Перейти в панель управления"
                target="_blank"
                className="flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <ShieldUser size={20} />
                <span>Админка</span>
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Поиск */}
      <SearchModal
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
      />
    </>
  );
};
