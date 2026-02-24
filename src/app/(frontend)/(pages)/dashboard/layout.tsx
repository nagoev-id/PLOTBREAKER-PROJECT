import { FC, ReactNode } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getPayload } from 'payload';
import { headers } from 'next/headers';
import configPromise from '@payload-config';
import { redirect } from 'next/navigation';
import type { User } from '@/payload-types';
import { List, Film } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ПРОСМОТРЕНО | DASHBOARD',
  description: 'Панель управления контентом',
};

/**
 * Layout для dashboard.
 * Проверяет admin-доступ на уровне сервера.
 */
const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: await headers() });

  // Редирект если не admin
  if (!user || (user as User).role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Управление контентом сайта</p>
      </div>

      {/* Навигация */}
      <nav className="mb-8 flex gap-2">
        <DashboardNavLink href="/dashboard" icon={<List className="h-4 w-4" />}>
          Списки
        </DashboardNavLink>
        <DashboardNavLink
          href="/dashboard/entries"
          icon={<Film className="h-4 w-4" />}
        >
          Записи
        </DashboardNavLink>
      </nav>

      {children}
    </div>
  );
};

/**
 * Компонент навигационной ссылки для dashboard.
 */
const DashboardNavLink: FC<{
  href: string;
  icon: ReactNode;
  children: ReactNode;
}> = ({ href, icon, children }) => {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {icon}
      {children}
    </Link>
  );
};

export default DashboardLayout;
