'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  customerId: string | null
  _hasHydrated: boolean
  setCustomerId: (id: string | null) => void
  logout: () => void
  setHasHydrated: (v: boolean) => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      customerId: null,
      _hasHydrated: false,
      setCustomerId: (id) => set({ customerId: id }),
      logout: () => set({ customerId: null }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: 'ap_auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
