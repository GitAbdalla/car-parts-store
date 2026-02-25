'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Lang = 'ar' | 'en'

interface LangState {
  lang: Lang
  setLang: (l: Lang) => void
  toggleLang: () => void
}

export const useLangStore = create<LangState>()(
  persist(
    (set, get) => ({
      lang: 'ar',
      setLang: (l) => set({ lang: l }),
      toggleLang: () => set({ lang: get().lang === 'ar' ? 'en' : 'ar' }),
    }),
    { name: 'ap_lang' }
  )
)
