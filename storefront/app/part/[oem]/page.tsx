import { notFound } from 'next/navigation'
import Link from 'next/link'
import { store } from '@/lib/store'
import AddToCartButton from './AddToCartButton'
import PartPrice from './PartPrice'
import PartCard from '@/components/ui/PartCard'

interface Props {
  params: Promise<{ oem: string }>
}

export default async function PartPage({ params }: Props) {
  const { oem } = await params

  // Try OEM/name search first; fall back to direct ID lookup
  const results = await store.oem.search(oem)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let product: Awaited<ReturnType<typeof store.oem.search>>[number] | Awaited<ReturnType<typeof store.products.get>> | null = results[0] ?? null
  if (!product) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      product = await store.products.get(oem as Parameters<typeof store.products.get>[0])
    } catch { /* not found by ID either */ }
  }

  if (!product) notFound()

  const spec = (product as any).specifications ?? {}
  const oemNumber  = spec.oemNumber as string | undefined
  const condition  = spec.condition as string | undefined
  const origin     = spec.origin as string | undefined
  const leadDays   = spec.leadTimeDays as number | undefined
  const diagramUrl = spec.diagramUrl as string | undefined
  const thumbUrl   = spec.thumbnailUrl as string | undefined
  const altOems    = spec.alternativeOems as string[] | undefined
  const weight     = spec.weight as number | undefined

  const nameAr  = (product as any).nameAr ?? product.name
  const inStock = ((product as any).stock ?? 1) > 0

  const priceAvailable = store.pricing.isPriceAvailable(product.basePrice)

  // Compatible vehicles
  const vehicles = await store.fitment.getCompatibleVehicles(product._id)

  // Related parts (same category, max 4)
  const relatedResult = (product as any).categoryId
    ? await store.products.list({ categoryId: (product as any).categoryId })
    : { products: [] }
  const related = ((relatedResult as any).products ?? [])
    .filter((p: any) => p._id !== product._id)
    .slice(0, 4)

  const mainImage = diagramUrl ?? thumbUrl ?? product.images?.[0]

  // Category name for breadcrumb — may be a string or a full object {_id, name, nameAr, slug}
  const categoryRaw = (product as any).categoryName ?? (product as any).category ?? null
  const categoryName: string | null = typeof categoryRaw === 'string'
    ? categoryRaw
    : categoryRaw?.nameAr ?? categoryRaw?.name ?? null

  return (
    <div style={{ background: '#1c1c1e', minHeight: '80vh' }}>

      {/* Breadcrumb */}
      <div style={{ background: '#16161a', borderBottom: '1px solid #222226' }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-2 text-sm font-cairo flex-wrap" style={{ color: '#9a9a9e' }}>
          <Link href="/" className="hover:text-gold transition-colors">الرئيسية</Link>
          <i className="fa-solid fa-chevron-left text-xs" style={{ color: '#444' }} />
          <Link href="/catalog" className="hover:text-gold transition-colors">الكتالوج</Link>
          {categoryName && (
            <>
              <i className="fa-solid fa-chevron-left text-xs" style={{ color: '#444' }} />
              <span style={{ color: '#9a9a9e' }}>{categoryName}</span>
            </>
          )}
          <i className="fa-solid fa-chevron-left text-xs" style={{ color: '#444' }} />
          <span className="text-white truncate max-w-45">{nameAr}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Image panel ── */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div
              className="rounded-2xl overflow-hidden relative"
              style={{
                background: 'linear-gradient(145deg, #2a2a2e, #222226)',
                border: '1px solid #333338',
                minHeight: '420px',
              }}
            >
              {/* Gold corner accent */}
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-bl-full pointer-events-none"
                style={{ background: 'rgba(201,169,110,0.06)' }}
              />

              {mainImage ? (
                <img
                  src={mainImage}
                  alt={nameAr}
                  className="w-full object-contain p-8"
                  style={{ maxHeight: '480px' }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center" style={{ minHeight: '420px' }}>
                  <i className="fa-solid fa-circle-nodes text-7xl mb-4" style={{ color: '#333338' }} />
                  <p className="font-cairo text-sm" style={{ color: '#444' }}>لا توجد صورة</p>
                </div>
              )}

              {/* OEM watermark on image */}
              {oemNumber && (
                <div
                  className="absolute bottom-4 left-4 font-mono text-xs px-3 py-1 rounded-full"
                  style={{ background: 'rgba(28,28,30,0.85)', color: '#c9a96e', border: '1px solid #333338' }}
                >
                  {oemNumber}
                </div>
              )}
            </div>

            {/* Trust badges below image */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { icon: 'fa-shield-halved', label: 'ضمان الجودة' },
                { icon: 'fa-truck-fast',    label: 'توصيل سريع' },
                { icon: 'fa-certificate',  label: 'قطعة اصلية' },
              ].map((b) => (
                <div
                  key={b.label}
                  className="rounded-xl p-3 text-center"
                  style={{ background: '#2a2a2e', border: '1px solid #333338' }}
                >
                  <i className={`fa-solid ${b.icon} text-base mb-1`} style={{ color: '#c9a96e' }} />
                  <p className="font-cairo text-xs text-white">{b.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Info panel ── */}
          <div>

            {/* Status badges */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <span
                className="badge"
                style={{
                  background: inStock ? 'rgba(74,222,128,0.12)' : 'rgba(239,68,68,0.12)',
                  color: inStock ? '#4ade80' : '#ef4444',
                }}
              >
                <i className={`fa-solid ${inStock ? 'fa-circle-check' : 'fa-circle-xmark'} text-xs`} />
                {inStock ? 'متوفر في المخزن' : 'غير متوفر'}
              </span>
              {condition && (
                <span className="badge badge-gold">
                  <i className="fa-solid fa-tag text-xs" />
                  {condition}
                </span>
              )}
              {origin && (
                <span className="badge badge-info">
                  <i className="fa-solid fa-globe text-xs" />
                  {origin}
                </span>
              )}
            </div>

            {/* Part name */}
            <h1 className="font-cairo text-4xl md:text-5xl font-black text-white leading-tight mb-2">
              {nameAr}
            </h1>
            <p className="font-inter text-base mb-6" style={{ color: '#9a9a9e' }}>
              {product.name}
            </p>

            {/* OEM number */}
            {oemNumber && (
              <div
                className="inline-flex items-center gap-3 rounded-xl px-5 py-3 mb-4"
                style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)' }}
              >
                <i className="fa-solid fa-hashtag text-sm" style={{ color: '#c9a96e' }} />
                <div>
                  <span className="font-cairo text-xs block" style={{ color: '#9a9a9e' }}>رقم OEM</span>
                  <span className="font-mono text-xl font-bold" style={{ color: '#c9a96e' }}>{oemNumber}</span>
                </div>
              </div>
            )}

            {/* Alternative OEM numbers */}
            {altOems && altOems.length > 0 && (
              <div className="mb-5">
                <p className="font-cairo text-xs mb-2" style={{ color: '#9a9a9e' }}>
                  <i className="fa-solid fa-arrow-right-arrow-left ml-1" />
                  ارقام بديلة متوافقة:
                </p>
                <div className="flex flex-wrap gap-2">
                  {altOems.map((alt) => (
                    <span
                      key={alt}
                      className="font-mono text-xs px-3 py-1 rounded-full"
                      style={{ background: '#2a2a2e', color: '#9a9a9e', border: '1px solid #333338' }}
                    >
                      {alt}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div style={{ height: '1px', background: '#333338', margin: '20px 0' }} />

            {/* Price card */}
            <PartPrice basePrice={product.basePrice} priceAvailable={priceAvailable} />

            {/* Specs mini-grid */}
            {(leadDays || weight || condition || origin) && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {leadDays && (
                  <div
                    className="rounded-xl p-4"
                    style={{ background: '#2a2a2e', border: '1px solid #333338' }}
                  >
                    <p className="font-cairo text-xs mb-1" style={{ color: '#9a9a9e' }}>
                      <i className="fa-solid fa-clock ml-1" style={{ color: '#c9a96e' }} />
                      وقت التوصيل
                    </p>
                    <p className="font-cairo font-bold text-white text-sm">
                      {leadDays}–{leadDays + 7} يوم
                    </p>
                  </div>
                )}
                {weight && (
                  <div
                    className="rounded-xl p-4"
                    style={{ background: '#2a2a2e', border: '1px solid #333338' }}
                  >
                    <p className="font-cairo text-xs mb-1" style={{ color: '#9a9a9e' }}>
                      <i className="fa-solid fa-weight-hanging ml-1" style={{ color: '#c9a96e' }} />
                      الوزن
                    </p>
                    <p className="font-cairo font-bold text-white text-sm">{weight} كجم</p>
                  </div>
                )}
                {condition && (
                  <div
                    className="rounded-xl p-4"
                    style={{ background: '#2a2a2e', border: '1px solid #333338' }}
                  >
                    <p className="font-cairo text-xs mb-1" style={{ color: '#9a9a9e' }}>
                      <i className="fa-solid fa-star ml-1" style={{ color: '#c9a96e' }} />
                      الحالة
                    </p>
                    <p className="font-cairo font-bold text-white text-sm">{condition}</p>
                  </div>
                )}
                {origin && (
                  <div
                    className="rounded-xl p-4"
                    style={{ background: '#2a2a2e', border: '1px solid #333338' }}
                  >
                    <p className="font-cairo text-xs mb-1" style={{ color: '#9a9a9e' }}>
                      <i className="fa-solid fa-globe ml-1" style={{ color: '#c9a96e' }} />
                      المصدر
                    </p>
                    <p className="font-cairo font-bold text-white text-sm">{origin}</p>
                  </div>
                )}
              </div>
            )}

            {/* Add to cart */}
            <AddToCartButton product={product as any} />
          </div>
        </div>

        {/* ── Compatibility table ── */}
        {vehicles.length > 0 && (
          <div
            className="mt-16 rounded-2xl overflow-hidden"
            style={{ border: '1px solid #333338' }}
          >
            <div
              className="px-6 py-4 flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, #2a2a2e, #222226)', borderBottom: '1px solid #333338' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(201,169,110,0.12)' }}
              >
                <i className="fa-solid fa-car" style={{ color: '#c9a96e' }} />
              </div>
              <div>
                <h3 className="font-cairo text-lg font-bold text-white">السيارات المتوافقة</h3>
                <p className="font-cairo text-xs" style={{ color: '#9a9a9e' }}>
                  هذه القطعة متوافقة مع {vehicles.length} موديل
                </p>
              </div>
            </div>

            <div style={{ background: '#1c1c1e' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a2a2e' }}>
                    <th className="font-cairo text-right px-6 py-3 text-xs font-semibold" style={{ color: '#9a9a9e' }}>الماركة</th>
                    <th className="font-cairo text-right px-6 py-3 text-xs font-semibold" style={{ color: '#9a9a9e' }}>الموديل</th>
                    <th className="font-cairo text-right px-6 py-3 text-xs font-semibold" style={{ color: '#9a9a9e' }}>الشاسيه</th>
                    <th className="font-cairo text-right px-6 py-3 text-xs font-semibold" style={{ color: '#9a9a9e' }}>السنوات</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v: any, i: number) => (
                    <tr
                      key={i}
                      className="transition-colors"
                      style={{
                        borderBottom: '1px solid #222226',
                        background: i % 2 === 0 ? 'transparent' : 'rgba(42,42,46,0.3)',
                      }}
                    >
                      <td className="px-6 py-3 font-cairo font-semibold text-white">
                        {v.brand?.nameEn ?? '—'}
                      </td>
                      <td className="px-6 py-3 font-inter text-white">
                        {v.model?.nameEn ?? '—'}
                        {v.model?.nameAr && (
                          <span className="font-cairo text-xs block" style={{ color: '#9a9a9e' }}>{v.model.nameAr}</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        {v.model?.chassis ? (
                          <span
                            className="font-mono text-xs px-2 py-1 rounded"
                            style={{ background: '#2a2a2e', color: '#c9a96e' }}
                          >
                            {v.model.chassis}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-3 font-inter text-sm font-semibold" style={{ color: '#9a9a9e' }}>
                        {v.yearFrom} – {v.yearTo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Related Parts ── */}
      {related.length > 0 && (
        <section
          className="py-16"
          style={{ background: '#16161a', borderTop: '1px solid #222226', marginTop: '4rem' }}
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-cairo text-2xl font-bold text-white">
                <i className="fa-solid fa-layer-group ml-2" style={{ color: '#c9a96e' }} />
                قطع من نفس التصنيف
              </h2>
              <Link
                href={`/catalog${(product as any).categoryId ? `?categoryId=${(product as any).categoryId}` : ''}`}
                className="font-cairo text-sm"
                style={{ color: '#c9a96e' }}
              >
                عرض الكل
                <i className="fa-solid fa-arrow-left mr-2" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {related.map((p: any) => (
                <PartCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
