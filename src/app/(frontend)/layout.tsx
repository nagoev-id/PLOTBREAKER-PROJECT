import React, { FC, JSX, ReactNode } from 'react';
import '@/app/(frontend)/globals.css';
import { Toaster } from '@/components/ui';
import { getPayload } from 'payload';
import { headers } from 'next/headers';
import configPromise from '@payload-config';

import {
  CollectionCollection,
  UserCollection,
  PostCollection,
} from '@/utilities/types';
import { METADATA } from '@/utilities/constants';
import { cn } from '@/utilities/utils';
import { euclid } from '@/utilities/fonts';
import { Header } from '@/globals/Header';
import { Footer } from '@/globals/Footer';
import {
  Preloader,
  ThemeProvider,
  // TelegramProvider,
  AuthProvider,
  CollectionsProvider,
  MediaContentsProvider,
  PostsProvider,
} from '@/components/shared';
import {
  getCachedCollectionsLists,
  getCachedGlobal,
  getCachedMediaContents,
  getCachedPostsLists,
} from '@/utilities/helpers';
import { MediaContent } from '@/payload-types';

// Настройки метаданных для SEO
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
 * Обеспечивает базовую структуру страницы
 *
 * @param props - Пропсы компонента
 * @param props.children - Дочерние элементы для отображения в основной части
 * @returns JSX элемент корневого макета
 */
const RootLayout = async ({
  children,
}: {
  children: ReactNode;
}): Promise<JSX.Element> => {
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: await headers() });
  const collections = await getCachedCollectionsLists()();
  const mediaContents = await getCachedMediaContents()();
  const posts = await getCachedPostsLists()();
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
          <AuthProvider user={user as UserCollection | null}>
            <CollectionsProvider
              collections={collections as CollectionCollection[] | null}
            >
              <MediaContentsProvider
                mediaContents={mediaContents as MediaContent[] | null}
              >
                <PostsProvider posts={posts as PostCollection[] | null}>
                  {/* <TelegramProvider> */}
                  <Preloader />
                  <div className="flex min-h-screen flex-col selection:bg-foreground selection:text-background">
                    <Header />
                    <main className="animate-fade-in w-full flex-1">
                      {children}
                    </main>
                    <Footer />
                  </div>
                </PostsProvider>
                {/* </TelegramProvider> */}
              </MediaContentsProvider>
            </CollectionsProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
