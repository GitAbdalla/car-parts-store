import { Suspense } from 'react'
import Link from 'next/link'
import CarSelector from '@/components/home/CarSelector'
import CategoryGrid from '@/components/home/CategoryGrid'
import FeaturedParts from '@/components/home/FeaturedParts'

export default function HomePage() {
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
            Mercedes-Benz W205 C-Class
          </p>
          <h1 className="font-cairo text-5xl md:text-7xl font-black text-white mb-6">
            قطع غيار{' '}
            <span style={{ color: '#c9a96e' }}>اصلية</span>
          </h1>
          <p className="font-cairo text-xl mb-10 max-w-2xl mx-auto" style={{ color: '#9a9a9e' }}>
            قطع غيار اصلية لمرسيدس بنز بارقام OEM حقيقية وأسعار مباشرة مع توصيل لباب بيتك
          </p>
          <Link href="/catalog" className="btn-gold text-lg px-12 py-4">
            <i className="fa-solid fa-magnifying-glass" />
            اختار عربيتك
          </Link>
        </div>
      </section>

      {/* Car Selector */}
      <section className="py-16" style={{ background: '#2a2a2e' }}>
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-cairo text-3xl font-bold text-center mb-10 text-white">
            <i className="fa-solid fa-car ml-3" style={{ color: '#c9a96e' }} />
            ابحث بموديل عربيتك
          </h2>
          <CarSelector />
        </div>
      </section>

      {/* Categories */}
      <section className="py-20" style={{ background: '#1c1c1e' }}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-cairo text-3xl font-bold text-center mb-12 text-white">
            التصنيفات
          </h2>
          <Suspense fallback={
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-pulse">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="rounded-xl h-32" style={{ background: '#333338' }} />
              ))}
            </div>
          }>
            <CategoryGrid />
          </Suspense>
        </div>
      </section>

      {/* Featured Parts */}
      <section className="py-20" style={{ background: '#2a2a2e' }}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-cairo text-3xl font-bold text-center mb-4 text-white">
            قطع <span style={{ color: '#c9a96e' }}>مميزة</span>
          </h2>
          <p className="font-cairo text-center mb-12" style={{ color: '#9a9a9e' }}>
            الاكثر طلبا من عملائنا
          </p>
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl h-64" style={{ background: '#333338' }} />
              ))}
            </div>
          }>
            <FeaturedParts />
          </Suspense>
          <div className="text-center mt-10">
            <Link href="/catalog" className="btn-outline">
              عرض كل القطع
              <i className="fa-solid fa-arrow-left" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-20" style={{ background: '#1c1c1e' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'fa-truck-fast', title: 'توصيل سريع', desc: 'توصيل لباب بيتك في كل محافظات مصر' },
              { icon: 'fa-certificate', title: 'قطع اصلية', desc: 'كل القطع بأرقام OEM اصلية من المصنع' },
              { icon: 'fa-shield-halved', title: 'ضمان', desc: 'ضمان على كل القطع ضد عيوب الصناعة' },
            ].map((item) => (
              <div
                key={item.title}
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
