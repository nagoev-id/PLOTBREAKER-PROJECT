"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Тип пропсов для провайдера темы
 * Наследует все пропсы от NextThemesProvider
 */
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

/**
 * Провайдер темы приложения
 *
 * Обертка над next-themes ThemeProvider для управления темой приложения.
 * Поддерживает светлую, темную и системную темы с сохранением выбора пользователя.
 *
 * @param props - Пропсы компонента
 * @param props.children - Дочерние элементы, для которых применяется тема
 * @param props.attribute - HTML атрибут для хранения темы (по умолчанию 'class')
 * @param props.defaultTheme - Тема по умолчанию
 * @param props.enableSystem - Включить системную тему
 * @param props.disableTransitionOnChange - Отключить анимацию при смене темы
 * @param props.storageKey - Ключ для хранения темы в localStorage
 * @returns JSX элемент провайдера темы
 */
export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
};
