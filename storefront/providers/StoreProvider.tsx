'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { store } from '@/lib/store'

interface StoreContextValue {
  rateLoaded: boolean
}

const StoreContext = createContext<StoreContextValue>({ rateLoaded: false })

export function StoreProvider({ children }: { children: ReactNode }) {
  const [rateLoaded, setRateLoaded] = useState(false)

  useEffect(() => {
    store.pricing.getRate()
      .then(() => setRateLoaded(true))
      .catch(() => setRateLoaded(true)) // continue even if rate fails
  }, [])

  return (
    <StoreContext.Provider value={{ rateLoaded }}>
      {children}
    </StoreContext.Provider>
  )
}

export const useStoreContext = () => useContext(StoreContext)
export const useStoreRate = () => useContext(StoreContext).rateLoaded
