"use client"

import type React from "react"

import { useEffect } from "react"
import { useThemeStore } from "@/lib/store"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDark, setTheme } = useThemeStore()

  useEffect(() => {
    // Check system preference on mount
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    setTheme(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [setTheme])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  return <>{children}</>
}
