import { notFound } from 'next/navigation'
import Link from 'next/link'
import { store } from '@/lib/store'
import AddToCartButton from './AddToCartButton'

interface Props {
  params: Promise<{ oem: string }>
}

export default async function PartPage({ params }: Props) {
  const { oem } = await params

  // Search by OEM to find the product
  const results = await store.oem.search(oem)
  const product = results[0]

  if (!product) notFound()

  const spec = (product as any).specifications ?? {}
  const oemNumber   = spec.oemNumber as string | undefined
  const condition   = spec.condition as string | undefined
  const origin      = spec.origin as string | undefined
  const leadDays    = spec.leadTimeDays as number | undefined
  const diagramUrl  = spec.diagramUrl as string | undefined
  const thumbUrl    = spec.thumbnailUrl as string | undefined
  const altOems     = spec.alternativeOems as string[] | undefined

  const nameAr = (product as any).nameAr ?? product.name
  const priceFormatted = store.pricing.formatPrice(product.basePrice, 'ar')
  const priceEn = store.pricing.formatPrice(product.basePrice, 'en')
  const inStock = ((product as any).stock ?? 1) > 0

  // Compatible vehicles
  const vehicles = await store.fitment.getCompatibleVehicles(product._id)

  // Related parts (same category)
  const relatedResult = (product as any).categoryId
    ? await store.products.list({ categoryId: (product as any).categoryId })
    : { products: [] }
  const related = ((relatedResult as any).products ?? [])
    .filter((p: any) => p._id !== product._id)
    .slice(0, 4)

  const mainImage = diagramUrl ?? thumbUrl ?? product.images?.[0]

  return (
    <div style={{ background: '#1c1c1e', minHeight: '80vh' }}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Image */}
          <div
            className="rounded-2xl flex items-center justify-center border"
            style={{
              background: '#2a2a2e',
              borderColor: '#333338',
              minHeight: '400px',
            }}
          >
            {mainImage ? (
              <img
                src={mainImage}
                alt={nameAr}
                className="max-h-[480px] object-contain p-6"
              />
            ) : (
              <i className="fa-solid fa-image text-6xl" style={{ color: '#333338' }} />
            )}
          </div>

          {/* Info */}
          <div>
            {/* Badges */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className={`badge ${inStock ? 'badge-success' : 'badge-error'}`}>
                {inStock ? (
                  <><i className="fa-solid fa-check" />متوفر</>
                ) : 'غير متوفر'}
              </span>
              {condition && (
                <span className="badge badge-gold">{condition}</span>
              )}
              {origin && (
                <span className="badge badge-info">{origin}</span>
              )}
            </div>

            {/* Names */}
            <h1 className="font-cairo text-4xl md:text-5xl font-black text-white mb-2">
              {nameAr}
            </h1>
            <p className="font-inter text-lg mb-4" style={{ color: '#9a9a9e' }}>
              {product.name}
            </p>

            {/* OEM */}
            {oemNumber && (
              <div
                className="inline-block px-4 py-2 rounded-lg mb-6"
                style={{ background: '#2a2a2e' }}
              >
                <span className="font-cairo text-sm mr-2" style={{ color: '#9a9a9e' }}>
                  رقم OEM:
                </span>
                <span className="font-mono text-lg font-semibold" style={{ color: '#c9a96e' }}>
                  {oemNumber}
                </span>
              </div>
            )}

            {/* Alternative OEMs */}
            {altOems && altOems.length > 0 && (
              <div className="mb-4">
                <p className="font-cairo text-sm mb-2" style={{ color: '#9a9a9e' }}>
                  ارقام بديلة:
                </p>
                <div className="flex flex-wrap gap-2">
                  {altOems.map((alt) => (
                    <span
                      key={alt}
                      className="font-mono text-xs px-2 py-1 rounded"
                      style={{ background: '#333338', color: '#9a9a9e' }}
                    >
                      {alt}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mb-8">
              <span className="font-cairo text-sm block mb-1" style={{ color: '#9a9a9e' }}>
                السعر شامل التوصيل
              </span>
              {store.pricing.isPriceAvailable(product.basePrice) ? (
                <span className="price-gold text-4xl">{priceFormatted}</span>
              ) : (
                <span className="font-cairo text-2xl font-bold" style={{ color: '#c9a96e' }}>
                  اتصل للسعر
                </span>
              )}
            </div>

            {/* Lead time */}
            {leadDays && (
              <p className="font-cairo text-sm mb-6" style={{ color: '#9a9a9e' }}>
                <i className="fa-solid fa-clock ml-2" style={{ color: '#c9a96e' }} />
                وقت التوصيل المتوقع: {leadDays}–{leadDays + 7} يوم
              </p>
            )}

            {/* Add to cart */}
            <AddToCartButton product={product as any} />

            {/* Compatibility */}
            {vehicles.length > 0 && (
              <div
                className="mt-10 rounded-xl p-6 border"
                style={{ background: '#2a2a2e', borderColor: '#333338' }}
              >
                <h3 className="font-cairo text-xl font-bold mb-4 text-white">
                  <i className="fa-solid fa-car ml-2" style={{ color: '#c9a96e' }} />
                  التوافق
                </h3>
                <table className="w-full text-sm">
                  <tbody>
                    {vehicles.map((v: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid #333338' }}>
                        <td className="py-2 font-cairo" style={{ color: '#9a9a9e' }}>
                          {(v as any).brand?.nameEn ?? 'الماركة'}
                        </td>
                        <td className="py-2 font-inter text-white">
                          {(v as any).model?.nameEn ?? '—'}
                        </td>
                        <td className="py-2 font-mono text-xs" style={{ color: '#9a9a9e' }}>
                          {(v as any).model?.chassis}
                        </td>
                        <td className="py-2 font-inter text-sm" style={{ color: '#9a9a9e' }}>
                          {(v as any).yearFrom}–{(v as any).yearTo}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Parts */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <h2 className="font-cairo text-2xl font-bold mb-6 text-white">قطع مشابهة</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {related.map((p: any) => (
              <Link
                key={p._id}
                href={`/part/${p.specifications?.oemNumber ?? p._id}`}
                className="card block"
              >
                <div
                  className="flex items-center justify-center"
                  style={{ background: '#2a2a2e', height: '128px' }}
                >
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.nameAr ?? p.name} className="h-full object-contain p-3" />
                  ) : (
                    <i className="fa-solid fa-image text-2xl" style={{ color: '#333338' }} />
                  )}
                </div>
                <div className="p-4">
                  <p className="font-cairo font-bold text-sm mb-1 text-white">{p.nameAr ?? p.name}</p>
                  {p.specifications?.oemNumber && (
                    <p className="font-mono text-xs" style={{ color: 'rgba(201,169,110,0.6)' }}>
                      {p.specifications.oemNumber}
                    </p>
                  )}
                  <span className="price-gold text-lg mt-2 block">
                    {store.pricing.formatPrice(p.basePrice, 'ar')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
