import React, { JSX, ReactNode } from 'react';
import '@/app/(frontend)/globals.css';
import { Toaster } from '@/components/ui';
import { getAuthUser } from '@/lib/helpers';

import { User } from '@/payload-types';
import { METADATA } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { euclid, unbounded } from '@/lib/fonts';
import { Header, Footer } from '@/payload/globals';
import { Preloader } from '@/components/shared';
import { ThemeProvider, AuthProvider } from '@/components/context';

export const metadata = {
  metadataBase: new URL(METADATA.siteUrl),
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
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: METADATA.siteUrl,
    siteName: METADATA.siteName,
    title: METADATA.siteName,
    description: METADATA.siteDescription,
    images: [
      {
        url: '/images/preview-1.jpg',
        width: 1200,
        height: 630,
        alt: METADATA.siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: METADATA.siteName,
    description: METADATA.siteDescription,
    images: ['/images/preview-1.jpg'],
  },
};

/**
 * Корневой макет приложения
 *
 * Обеспечивает базовую структуру страницы.
 * Данные больше не загружаются в layout — каждая страница загружает свои данные самостоятельно.
 */
const RootLayout = async ({
  children,
}: {
  children: ReactNode;
}): Promise<JSX.Element> => {
  const user = await getAuthUser();

  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={cn(
          euclid.variable,
          unbounded.variable,
          'flex min-h-full w-full flex-auto flex-col antialiased font-sans'
        )}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
          storageKey={METADATA.siteKey}
        >
          <AuthProvider user={user as User | null}>
            <Preloader />
            <div className="flex min-h-screen flex-col selection:bg-foreground selection:text-background">
              <Header />
              <main className="animate-fade-in w-full flex-1">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
