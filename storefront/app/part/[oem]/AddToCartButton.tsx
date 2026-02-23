'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useCart } from '@/lib/cart-store'
import { store } from '@/lib/store'

interface Product {
  _id: string
  name: string
  nameAr?: string
  basePrice: number | null
  images?: string[]
  specifications?: {
    oemNumber?: string
    thumbnailUrl?: string
    diagramUrl?: string
  }
  stock?: number
}

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem)
  const [qty, setQty] = useState(1)
  const inStock = (product.stock ?? 1) > 0

  function handleAdd() {
    const oem =
      product.specifications?.oemNumber ?? product._id
    const image =
      product.specifications?.diagramUrl ??
      product.specifications?.thumbnailUrl ??
      product.images?.[0]

    addItem({
      productId: product._id,
      oem,
      nameAr: (product as any).nameAr ?? product.name,
      nameEn: product.name,
      priceUsd: product.basePrice ?? 0,
      quantity: qty,
      image,
    })

    toast.success(`تمت الاضافة: ${(product as any).nameAr ?? product.name}`)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Quantity */}
      <div className="flex items-center gap-3">
        <span className="font-cairo text-sm" style={{ color: '#9a9a9e' }}>الكمية:</span>
        <div className="flex items-center rounded-lg overflow-hidden border" style={{ borderColor: '#333338' }}>
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center transition-colors"
            style={{ background: '#2a2a2e', color: '#c9a96e' }}
          >
            <i className="fa-solid fa-minus text-xs" />
          </button>
          <span
            className="w-12 text-center font-mono font-bold text-white"
            style={{ background: '#1c1c1e' }}
          >
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="w-10 h-10 flex items-center justify-center transition-colors"
            style={{ background: '#2a2a2e', color: '#c9a96e' }}
          >
            <i className="fa-solid fa-plus text-xs" />
          </button>
        </div>
      </div>

      {/* Add to cart button */}
      <button
        onClick={handleAdd}
        disabled={!inStock}
        className="btn-gold w-full text-lg py-4 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {inStock ? (
          <>
            <i className="fa-solid fa-cart-plus" />
            اضف للسلة
          </>
        ) : (
          <>
            <i className="fa-solid fa-ban" />
            غير متوفر
          </>
        )}
      </button>

      {/* WhatsApp enquiry */}
      <a
        href={`https://wa.me/201000000000?text=${encodeURIComponent(`استفسار عن قطعة: ${(product as any).nameAr ?? product.name} — OEM: ${product.specifications?.oemNumber ?? '—'}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-outline w-full text-center py-3"
      >
        <i className="fa-brands fa-whatsapp" style={{ color: '#25d366' }} />
        تواصل عبر واتساب
      </a>
    </div>
  )
}
