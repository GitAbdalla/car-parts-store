'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useLang } from '@/providers/LangProvider'

interface Props {
  carSelector: ReactNode
  categoryGrid: ReactNode
  featuredParts: ReactNode
}

const TRUST = {
  ar: [
    { icon: 'fa-truck-fast',    title: 'توصيل سريع',  desc: 'توصيل لباب بيتك في كل محافظات مصر' },
    { icon: 'fa-certificate',   title: 'قطع اصلية',   desc: 'كل القطع بأرقام OEM اصلية من المصنع' },
    { icon: 'fa-shield-halved', title: 'ضمان',         desc: 'ضمان على كل القطع ضد عيوب الصناعة' },
  ],
  en: [
    { icon: 'fa-truck-fast',    title: 'Fast Delivery',    desc: 'Door-to-door delivery across all Egypt' },
    { icon: 'fa-certificate',   title: 'Genuine Parts',    desc: 'Every part with authentic OEM numbers from the manufacturer' },
    { icon: 'fa-shield-halved', title: 'Warranty',          desc: 'Warranty on every part against manufacturing defects' },
  ],
}

export default function HomeLayout({ carSelector, categoryGrid, featuredParts }: Props) {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const trust = TRUST[lang]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32" style={{ background: '#1c1c1e' }}>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'rgba(201,169,110,0.05)' }}
        />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <p className="font-inter text-sm tracking-widest uppercase mb-4" style={{ color: '#9a9a9e' }}>
            {ar ? 'كل الماركات — كل الموديلات' : 'All Makes — All Models'}
          </p>
          <h1 className="font-cairo text-5xl md:text-7xl font-black text-white mb-6">
            {ar ? <>قطع غيار{' '}<span style={{ color: '#c9a96e' }}>اصلية</span></> : <><span style={{ color: '#c9a96e' }}>Genuine</span>{' '}Spare Parts</>}
          </h1>
          <p className="font-cairo text-xl mb-10 max-w-2xl mx-auto" style={{ color: '#9a9a9e' }}>
            {ar
              ? 'قطع غيار اصلية لكل الماركات بارقام OEM حقيقية وأسعار مباشرة مع توصيل لباب بيتك في كل مصر'
              : 'Genuine spare parts for all car makes with authentic OEM numbers, competitive prices, and door-to-door delivery across Egypt'}
          </p>
          <Link href="/catalog" className="btn-gold text-lg px-12 py-4">
            <i className="fa-solid fa-magnifying-glass" />
            {ar ? 'اختار عربيتك' : 'Find Your Parts'}
          </Link>
        </div>
      </section>

      {/* Car Selector */}
      <section className="py-16" style={{ background: '#2a2a2e' }}>
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-cairo text-3xl font-bold text-center mb-10 text-white">
            <i className="fa-solid fa-car ms-3" style={{ color: '#c9a96e' }} />
            {ar ? 'ابحث بموديل عربيتك' : 'Search by Your Vehicle'}
          </h2>
          {carSelector}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20" style={{ background: '#1c1c1e' }}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-cairo text-3xl font-bold text-center mb-12 text-white">
            {ar ? 'التصنيفات' : 'Categories'}
          </h2>
          {categoryGrid}
        </div>
      </section>

      {/* Featured Parts */}
      <section className="py-20" style={{ background: '#2a2a2e' }}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-cairo text-3xl font-bold text-center mb-4 text-white">
            {ar ? <>قطع{' '}<span style={{ color: '#c9a96e' }}>مميزة</span></> : <><span style={{ color: '#c9a96e' }}>Featured</span>{' '}Parts</>}
          </h2>
          <p className="font-cairo text-center mb-12" style={{ color: '#9a9a9e' }}>
            {ar ? 'الاكثر طلبا من عملائنا' : 'Most requested by our customers'}
          </p>
          {featuredParts}
          <div className="text-center mt-10">
            <Link href="/catalog" className="btn-outline">
              {ar ? 'عرض كل القطع' : 'View All Parts'}
              <i className="fa-solid fa-arrow-left ms-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-20" style={{ background: '#1c1c1e' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trust.map((item) => (
              <div
                key={item.icon}
                className="text-center p-8 rounded-xl border"
                style={{ background: '#2a2a2e', borderColor: '#333338' }}
              >
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(201,169,110,0.1)' }}
                >
                  <i className={`fa-solid ${item.icon} text-2xl`} style={{ color: '#c9a96e' }} />
                </div>
                <h3 className="font-cairo text-xl font-bold mb-2 text-white">{item.title}</h3>
                <p className="font-cairo text-sm" style={{ color: '#9a9a9e' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
