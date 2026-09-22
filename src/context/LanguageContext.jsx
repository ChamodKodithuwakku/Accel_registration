import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { lookup } from '../i18n/translations'

const STORAGE_KEY = 'acel.language'
const LanguageContext = createContext(null)

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'si' || stored === 'en' ? stored : 'en'
  } catch {
    // Private mode / blocked storage - fall back to English.
    return 'en'
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(readStoredLanguage)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // Not being able to remember the choice is not worth breaking the page over.
    }
    document.documentElement.lang = language
  }, [language])

  const t = useCallback((path) => lookup(language, path), [language])

  const toggleLanguage = useCallback(() => {
    setLanguage((current) => (current === 'en' ? 'si' : 'en'))
  }, [])

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language, toggleLanguage, t]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used inside a LanguageProvider')
  }
  return context
}
