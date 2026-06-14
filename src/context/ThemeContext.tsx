import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Theme } from '../types'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

const STORAGE_KEY = 'PomoZen-theme'
const OLD_STORAGE_KEY = 'pomito-theme'
const DEFAULT_THEME: Theme = 'dark'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && ['dark', 'stone', 'amoled', 'neon', 'ocean', 'forest', 'sunset', 'paper'].includes(stored)) {
      return stored as Theme
    }
    const oldStored = localStorage.getItem(OLD_STORAGE_KEY)
    if (oldStored && ['dark', 'stone', 'amoled', 'neon', 'ocean', 'forest', 'sunset', 'paper'].includes(oldStored)) {
      localStorage.setItem(STORAGE_KEY, oldStored)
      localStorage.removeItem(OLD_STORAGE_KEY)
      return oldStored as Theme
    }
    return DEFAULT_THEME
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const setTheme = (t: Theme) => {
    setThemeState(t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
