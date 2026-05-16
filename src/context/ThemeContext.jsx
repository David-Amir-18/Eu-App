import { createContext, useContext, useState, useEffect } from 'react'

// ── Context ────────────────────────────────────────────────────────────────────
const ThemeContext = createContext(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function prefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(theme) {
  const html = document.documentElement
  if (theme === 'dark') {
    html.classList.add('dark')
  } else if (theme === 'light') {
    html.classList.remove('dark')
  } else {
    // 'system'
    html.classList.toggle('dark', prefersDark())
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }) {
  const [theme, setThemeRaw] = useState(
    () => localStorage.getItem('eu-theme') || 'system'
  )

  // Apply on mount and whenever theme changes
  useEffect(() => {
    applyTheme(theme)

    // When in 'system' mode, track OS preference changes live
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e) =>
        document.documentElement.classList.toggle('dark', e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  function setTheme(t) {
    localStorage.setItem('eu-theme', t)
    setThemeRaw(t)
    applyTheme(t)
  }

  // Derive a simple boolean for consumers
  const isDark = document.documentElement.classList.contains('dark')

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}
