import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Проксирование запросов к Python-микросервису HDRezka
  async rewrites() {
    const rezkaApiUrl = process.env.REZKA_API_URL || 'http://localhost:8000';
    return [
      {
        source: '/api/rezka/:path*',
        destination: `${rezkaApiUrl}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kinopoiskapiunofficial.tech',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'ru-images-s.kinorium.com',
      },
      {
        protocol: 'https',
        hostname: 'ru-images.kinorium.com',
      },
      {
        protocol: 'https',
        hostname: 'kinopoisk-ru.clstorage.net',
      },
      {
        protocol: 'https',
        hostname: 'avatars.mds.yandex.net',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    };

    return webpackConfig;
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
