import React, { FC, JSX, ReactNode } from 'react';
import '@/app/(frontend)/globals.css';
import { METADATA } from '@/utilities/constants';
import { cn } from '@/utilities/utils';
import { euclid } from '@/utilities/fonts';
import { Header } from '@/globals/Header';
import { Footer } from '@/globals/Footer';
import { Preloader, ThemeProvider } from '@/components/shared';
import { Toaster } from '@/components/ui';

export const metadata = {
  description: METADATA.siteDescription,
  title: METADATA.siteName,
  keywords: METADATA.siteKeywords,
  icons: {
    icon: [
      {
        media: '(prefers-color-scheme: light)',
        url: '/favicon/favicon-white.svg',
      },
      {
        media: '(prefers-color-scheme: dark)',
        url: '/favicon/favicon-dark.svg',
      },
    ],
  },
};

/**
 * Тип пропсов для корневого макета
 */
type Props = {
  children: ReactNode;
};

/**
 * Корневой макет приложения
 *
 * Обеспечивает базовую структуру страницы
 *
 * @param props - Пропсы компонента
 * @param props.children - Дочерние элементы для отображения в основной части
 * @returns JSX элемент корневого макета
 */
const RootLayout: FC<Props> = ({ children }): JSX.Element => {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={cn(
          euclid.variable,
          'flex min-h-full w-full flex-auto flex-col antialiased font-sans'
        )}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey={METADATA.siteKey}
        >
          <Preloader />
          <div className="flex min-h-screen flex-col selection:bg-foreground selection:text-background">
            <Header />
            <main className="animate-fade-in w-full flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
