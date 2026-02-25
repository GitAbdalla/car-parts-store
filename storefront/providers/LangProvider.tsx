'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useLangStore, type Lang } from '@/lib/lang-store'
import { translations, type Translations } from '@/lib/i18n'

interface LangContextValue {
  lang: Lang
  t: Translations
  toggleLang: () => void
  isRtl: boolean
}

const LangContext = createContext<LangContextValue>({
  lang: 'ar',
  t: translations.ar,
  toggleLang: () => {},
  isRtl: true,
})

export function LangProvider({ children }: { children: ReactNode }) {
  const { lang, toggleLang } = useLangStore()
  const isRtl = lang === 'ar'

  // Sync html element attributes on lang change
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
  }, [lang, isRtl])

  return (
    <LangContext.Provider value={{ lang, t: translations[lang], toggleLang, isRtl }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
