'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { store } from '@/lib/store'
import { useAuth } from '@/lib/auth-store'

interface StoreContextValue {
  rateLoaded: boolean
}

const StoreContext = createContext<StoreContextValue>({ rateLoaded: false })

export function StoreProvider({ children }: { children: ReactNode }) {
  const [rateLoaded, setRateLoaded] = useState(false)
  const customerId = useAuth((s) => s.customerId)

  // Restore SDK session from persisted customerId
  useEffect(() => {
    if (customerId) {
      store.customer.setCurrentCustomerId(customerId as Parameters<typeof store.customer.setCurrentCustomerId>[0])
    }
  }, [customerId])

  // Fetch exchange rate once on mount
  useEffect(() => {
    store.pricing.getRate()
      .then(() => setRateLoaded(true))
      .catch(() => setRateLoaded(true))
  }, [])

  return (
    <StoreContext.Provider value={{ rateLoaded }}>
      {children}
    </StoreContext.Provider>
  )
}

export const useStoreContext = () => useContext(StoreContext)
export const useStoreRate = () => useContext(StoreContext).rateLoaded
