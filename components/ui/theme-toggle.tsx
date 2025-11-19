"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useThemeStore } from "@/lib/store"

export function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeStore()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
    >
      {isDark ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-blue-600" />}
    </Button>
  )
}
