import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

const THEME_KEY = 'barbara-theme'

interface ThemeContextValue {
  isDark: boolean
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readInitialTheme(): boolean {
  try {
    const stored = window.localStorage.getItem(THEME_KEY)
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(readInitialTheme)

  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark')
        window.localStorage.setItem(THEME_KEY, 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        window.localStorage.setItem(THEME_KEY, 'light')
      }
    } catch {
      // storage indisponível
    }
  }, [isDark])

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setIsDark(theme === 'dark')
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev)
  }, [])

  return (
    <ThemeContext.Provider value={{ isDark, theme: isDark ? 'dark' : 'light', setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
