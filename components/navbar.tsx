"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useAuthStore } from "@/lib/store"
import { LogOut, Mic } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()
  const { isAuthenticated, logout, user } = useAuthStore()

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VOICE
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {pathname !== "/conversation" && (
                  <Link href="/conversation">
                    <Button variant="outline" className="bg-white dark:bg-gray-800">
                      Start Conversation
                    </Button>
                  </Link>
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">Welcome, {user?.name}</span>
                <Button variant="outline" size="icon" onClick={logout} className="bg-white dark:bg-gray-800">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              pathname !== "/auth" && (
                <Link href="/auth">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    Get Started
                  </Button>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
