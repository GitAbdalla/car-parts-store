'use client'

import Link from 'next/link'
import { useLang } from '@/providers/LangProvider'

export default function OrderSuccessPage() {
  const { t } = useLang()

  return (
    <div
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6"
      style={{ background: '#1c1c1e' }}
    >
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
        style={{ background: 'rgba(74,222,128,0.12)' }}
      >
        <i className="fa-solid fa-check text-5xl" style={{ color: '#4ade80' }} />
      </div>

      <h1 className="font-cairo text-4xl font-black text-white mb-3">{t.orderSuccess.title}</h1>
      <p className="font-cairo text-lg mb-2" style={{ color: '#9a9a9e' }}>
        {t.orderSuccess.subtitle}
      </p>
      <p className="font-cairo text-sm mb-10" style={{ color: '#9a9a9e' }}>
        <i className="fa-solid fa-truck-fast ml-2" style={{ color: '#c9a96e' }} />
        {t.orderSuccess.delivery}
      </p>

      <div className="flex gap-4 flex-wrap justify-center">
        <Link href="/catalog" className="btn-gold">
          <i className="fa-solid fa-arrow-right" />
          {t.orderSuccess.continueShopping}
        </Link>
        <Link href="/" className="btn-outline">
          {t.orderSuccess.home}
        </Link>
      </div>
    </div>
  )
}
