import type { Footer as FooterType } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { FC } from 'react'
import { FooterClient } from '@/globals/Footer/components/component.client'
import { METADATA } from '@/utilities/constants'

/**
 * Серверный компонент подвала сайта
 *
 * Компонент выполняет на сервере следующие задачи:
 * - Загружает данные подвала из кешированного глобального объекта Payload CMS
 * - Передает данные в клиентский компонент для рендеринга
 * - Обеспечивает SSR и кеширование для оптимальной производительности
 *
 * @returns Отрендеренный подвал сайта
 */
export const Footer: FC = async () => {
  try {
    // Загружаем данные подвала из кешированного глобального объекта
    // getCachedGlobal обеспечивает оптимальную производительность через кеширование
    const footerData: FooterType = (await getCachedGlobal('footer', 1)()) as unknown as FooterType

    // Передаем данные в клиентский компонент для интерактивной функциональности
    return <FooterClient data={footerData} />
  } catch (error) {
    console.error('Error loading footer data:', error)

    // В случае ошибки возвращаем подвал с данными по умолчанию
    // Это обеспечивает отказоустойчивость компонента
    const fallbackData: Partial<FooterType> = {
      logo: {
        logoText: METADATA.siteName,
        logoIcon: null,
      },
    }

    return <FooterClient data={fallbackData as FooterType} />
  }
}
