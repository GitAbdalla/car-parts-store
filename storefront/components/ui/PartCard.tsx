'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import { useCart } from '@/lib/cart-store'
import { store } from '@/lib/store'
import { useStoreRate } from '@/providers/StoreProvider'
import { useLang } from '@/providers/LangProvider'

interface Props {
  product: {
    _id: string
    name: string
    nameAr?: string
    basePrice: number
    images: string[]
    specifications?: Record<string, string | number | boolean | string[]>
    stock?: number
  }
}

export default function PartCard({ product }: Props) {
  const addItem = useCart((s) => s.addItem)
  const rateLoaded = useStoreRate()
  const { t, lang } = useLang()

  const oem         = product.specifications?.oemNumber as string | undefined
  const displayName = lang === 'ar' ? (product.nameAr || product.name) : product.name
  const inStock     = (product.stock ?? 1) > 0
  const image       = product.images?.[0]
  const priceFormatted = rateLoaded
    ? store.pricing.formatPrice(product.basePrice, lang)
    : null

  function handleAdd() {
    addItem({
      productId: product._id,
      oem: oem ?? '',
      nameAr: product.nameAr ?? product.name,
      nameEn: product.name,
      priceUsd: product.basePrice,
      quantity: 1,
      image,
    })
    toast.success(lang === 'ar' ? 'تمت الاضافة للسلة' : 'Added to cart')
  }

  return (
    <div className="card flex flex-col">
      {/* Image */}
      <Link href={`/part/${oem || product._id}`}>
        <div
          className="flex items-center justify-center"
          style={{ background: '#2a2a2e', height: '160px' }}
        >
          {image ? (
            <img src={image} alt={displayName} className="h-full w-full object-contain p-4" />
          ) : (
            <i className="fa-solid fa-image text-3xl" style={{ color: '#333338' }} />
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <Link href={`/part/${oem || product._id}`} className="block mb-1 hover:text-gold transition-colors">
          <p className="font-cairo text-lg font-bold text-white">{displayName}</p>
        </Link>
        {lang === 'ar' && product.nameAr && (
          <p className="font-inter text-sm mb-2" style={{ color: '#9a9a9e' }}>{product.name}</p>
        )}

        {oem && (
          <span
            className="font-mono text-xs inline-block px-2 py-1 rounded mb-4 self-start"
            style={{ color: 'rgba(201,169,110,0.8)', background: '#2a2a2e' }}
          >
            {oem}
          </span>
        )}

        <div className="flex items-center justify-between mt-auto">
          <span className="price-gold">
            {priceFormatted ?? <span style={{ color: '#9a9a9e', fontSize: '0.9rem', fontWeight: 400 }}>…</span>}
          </span>
          <span className={`badge ${inStock ? 'badge-success' : 'badge-error'} text-xs`}>
            {inStock ? t.card.inStock : t.card.outOfStock}
          </span>
        </div>

        <button
          onClick={handleAdd}
          disabled={!inStock || !store.pricing.isPriceAvailable(product.basePrice)}
          className="btn-gold w-full mt-4 py-2 text-sm"
        >
          <i className="fa-solid fa-cart-plus" />
          {t.card.addToCart}
        </button>
      </div>
    </div>
  )
}
