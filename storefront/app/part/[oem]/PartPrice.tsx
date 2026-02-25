'use client'

import { store } from '@/lib/store'
import { useStoreRate } from '@/providers/StoreProvider'
import { useLang } from '@/providers/LangProvider'

interface Props {
  basePrice: number
  priceAvailable: boolean
}

export default function PartPrice({ basePrice, priceAvailable }: Props) {
  const rateLoaded = useStoreRate()
  const { lang } = useLang()
  const ar = lang === 'ar'

  return (
    <div
      className="rounded-2xl p-6 mb-6"
      style={{
        background: 'linear-gradient(135deg, rgba(201,169,110,0.08), rgba(201,169,110,0.03))',
        border: '1px solid rgba(201,169,110,0.2)',
      }}
    >
      <p className="font-cairo text-sm mb-3" style={{ color: '#9a9a9e' }}>
        <i className="fa-solid fa-truck ms-2" style={{ color: '#c9a96e' }} />
        {ar ? 'السعر شامل التوصيل للباب في كل مصر' : 'Price includes door-to-door delivery across Egypt'}
      </p>

      {!priceAvailable ? (
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-phone-volume text-xl" style={{ color: '#c9a96e' }} />
          <span className="font-cairo text-2xl font-bold" style={{ color: '#c9a96e' }}>
            {ar ? 'اتصل للسعر' : 'Call for price'}
          </span>
        </div>
      ) : !rateLoaded ? (
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-spinner fa-spin" style={{ color: '#c9a96e' }} />
          <span className="font-cairo text-lg" style={{ color: '#9a9a9e' }}>
            {ar ? 'جاري تحميل السعر...' : 'Loading price...'}
          </span>
        </div>
      ) : (
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="price-gold" style={{ fontSize: '2.5rem' }}>
            {new Intl.NumberFormat(ar ? 'ar-EG' : 'en-EG').format(
              store.pricing.toDisplayPrice(basePrice)
            )}
            <span className="text-xl ms-2">{ar ? 'ج.م' : 'EGP'}</span>
          </span>
        </div>
      )}
    </div>
  )
}
