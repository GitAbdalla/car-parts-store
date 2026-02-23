import { MantarayStore } from '@mantaray-digital/store-sdk'
import { AutomotivePlugin } from '@mantaray-digital/plugin-automotive'

const apiKey    = process.env.NEXT_PUBLIC_MANTARAY_API_KEY!
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!

// Singleton store instance — shared across client-side usage
let _store: MantarayStore | null = null

export function getStore(): MantarayStore {
  if (!_store) {
    _store = new MantarayStore({
      apiKey,
      convexUrl,
      plugins: [AutomotivePlugin],
    })
  }
  return _store
}

// Pre-created instance for direct import in client components
export const store = new MantarayStore({
  apiKey,
  convexUrl,
  plugins: [AutomotivePlugin],
})
