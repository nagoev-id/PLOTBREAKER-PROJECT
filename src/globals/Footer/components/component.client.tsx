'use client'

import React, { FC, useMemo } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import type { Footer } from '@/payload-types'

/** Данные подвала из Payload CMS */
type FooterClientProps = {
  data: Footer
}

/**
 * Клиентский компонент подвала сайта.
 *
 * Компонент выполняет следующие задачи:
 * - Отображает логотип сайта с возможностью перехода на главную
 * - Показывает текстовую информацию и копирайт
 * - Предоставляет переключатель темы
 * - Обеспечивает адаптивность и доступность
 *
 * @param props - Свойства компонента
 * @param props.data - Данные подвала из CMS
 * @returns Отрендеренный подвал сайта
 */
export const FooterClient: FC<FooterClientProps> = ({ data }) => {
  const currentYear = useMemo(() => new Date().getFullYear(), [])

  return (
    <footer className="border-t-3 bg-zinc-950 py-12 text-white">
      <div className="container mx-auto grid place-items-center gap-6 px-4">
        {/* Логотип сайта с ссылкой на главную */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          aria-label="Переход на главную страницу"
        >
          {data?.logo?.logoIcon ? (
            <span
              className="[&>svg]:h-8 [&>svg]:w-16 [&>svg]:fill-white"
              dangerouslySetInnerHTML={{ __html: data.logo.logoIcon }}
              aria-label="Логотип сайта"
            />
          ) : (
            <span className="text-lg font-medium">{data?.logo?.logoText}</span>
          )}
        </Link>

        {/* Информационный блок с текстом и копирайтом */}
        <div className="grid place-items-center space-y-2 text-center text-sm opacity-70">
          <span className="leading-relaxed">{data?.logo?.logoText}</span>
          <span className="text-xs">© {currentYear} Все права защищены</span>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  )
}
