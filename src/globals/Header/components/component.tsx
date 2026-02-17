import { getCachedGlobal } from '@/utilities/getGlobals'
import { FC } from 'react'
import { HeaderClient } from '@/globals/Header/components/component.client'
import type { Header as HeaderType } from '@/payload-types'
import { METADATA } from '@/utilities/constants'

/**
 * Серверный компонент шапки сайта
 *
 * Компонент выполняет на сервере следующие задачи:
 * - Загружает данные шапки из кешированного глобального объекта Payload CMS
 * - Передает данные в клиентский компонент для рендеринга
 * - Обеспечивает SSR и кеширование для оптимальной производительности
 *
 * @returns Отрендеренная шапка сайта
 */
export const Header: FC = async () => {
  try {
    // Загружаем данные шапки из кешированного глобального объекта
    // getCachedGlobal обеспечивает оптимальную производительность через кеширование
    const headerData: HeaderType = (await getCachedGlobal('header', 1)()) as unknown as HeaderType

    // Передаем данные в клиентский компонент для интерактивной функциональности
    return <HeaderClient data={headerData} />
  } catch (error) {
    console.error('Error loading header data:', error)

    // В случае ошибки возвращаем шапку с данными по умолчанию
    // Это обеспечивает отказоустойчивость компонента
    const fallbackData: Partial<HeaderType> = {
      logo: {
        logoText: METADATA.siteName,
        logoIcon: null,
      },
      navItems: [],
    }

    return <HeaderClient data={fallbackData as HeaderType} />
  }
}
