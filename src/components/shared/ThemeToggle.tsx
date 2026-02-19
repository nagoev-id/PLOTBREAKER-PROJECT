"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { FC } from "react";
import { Button } from "../ui";

/**
 * Кнопка переключения темы (светлая/темная).
 * Использует next-themes для управления состоянием.
 */
export const ThemeToggle: FC = () => {
  const { setTheme, theme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full transition-all duration-300 hover:scale-110"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-6 w-[1.3rem] transition-transform duration-300 dark:hidden" />
      <Moon className="hidden h-5 w-5 transition-transform duration-300 dark:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
