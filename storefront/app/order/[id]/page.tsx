'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { store } from '@/lib/store'
import { useAuth } from '@/lib/auth-store'
import { useStoreRate } from '@/providers/StoreProvider'
import { useLang } from '@/providers/LangProvider'

interface OrderItem {
  productId?: string
  name?: string
  nameAr?: string
  quantity: number
  priceUsd: number
  image?: string
  oem?: string
  oemNumber?: string
  specifications?: { oemNumber?: string; thumbnailUrl?: string }
}

interface ShippingAddress {
  name?: string
  fullName?: string
  phone?: string
  city?: string
  addressLine1?: string
  addressLine2?: string
  address?: string
  area?: string
}

interface Order {
  _id: string
  orderNumber?: string
  createdAt: number
  status: string
  totalUsd?: number
  subtotalUsd?: number
  items?: OrderItem[]
  shippingAddress?: ShippingAddress
  notes?: string
}

const STATUS_LABEL: Record<string, [string, string]> = {
  pending:    ['قيد المراجعة', 'Pending'],
  confirmed:  ['مؤكد',         'Confirmed'],
  processing: ['جاري التجهيز', 'Processing'],
  shipped:    ['في الطريق',    'Shipped'],
  delivered:  ['تم التسليم',   'Delivered'],
  cancelled:  ['ملغي',         'Cancelled'],
}

const STATUS_COLOR: Record<string, string> = {
  pending: '#9a9a9e', confirmed: '#60a5fa', processing: '#c9a96e',
  shipped: '#c9a96e', delivered: '#4ade80', cancelled: '#ef4444',
}

const STATUS_ICON: Record<string, string> = {
  pending: 'fa-clock', confirmed: 'fa-circle-check', processing: 'fa-gears',
  shipped: 'fa-truck-fast', delivered: 'fa-box-open', cancelled: 'fa-ban',
}

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { customerId, _hasHydrated: hasHydrated } = useAuth()
  const rateLoaded = useStoreRate()
  const { lang } = useLang()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!hasHydrated) return
    if (!customerId) { router.replace('/login'); return }

    async function load() {
      try {
        // First: try checkout.getOrder with the ID directly
        let full: Order | null = null
        try {
          full = await (store as any).checkout.getOrder(id, customerId) as Order
        } catch {
          // orderNumber may differ from _id — fall back to list search
        }

        // Fallback: search listOrders
        if (!full) {
          const orders = await store.customer.listOrders(50) as unknown as Order[]
          const found = orders.find((o) => o._id === id || o.orderNumber === id) ?? null
          if (!found) { setNotFound(true); setLoading(false); return }

          // Try getOrder with the orderNumber field if available
          const num = found.orderNumber ?? found._id
          try {
            full = await (store as any).checkout.getOrder(num, customerId) as Order
          } catch {
            full = found
          }
        }

        setOrder(full)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, customerId, hasHydrated, router])

  function fmt(egp: number) {
    return `${new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-EG').format(egp)} ${lang === 'ar' ? 'ج.م' : 'EGP'}`
  }

  if (loading || !hasHydrated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: '#1c1c1e' }}>
        <i className="fa-solid fa-spinner fa-spin text-4xl" style={{ color: '#c9a96e' }} />
      </div>
    )
  }

  if (notFound || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6" style={{ background: '#1c1c1e' }}>
        <i className="fa-solid fa-box-open text-6xl mb-4" style={{ color: '#333338' }} />
        <h2 className="font-cairo text-2xl font-bold text-white mb-3">
          {lang === 'ar' ? 'الطلب غير موجود' : 'Order not found'}
        </h2>
        <Link href="/profile" className="btn-gold mt-4">
          <i className="fa-solid fa-arrow-right" />
          {lang === 'ar' ? 'طلباتي' : 'My Orders'}
        </Link>
      </div>
    )
  }

  const [labelAr, labelEn] = STATUS_LABEL[order.status] ?? [order.status, order.status]
  const statusLabel = lang === 'ar' ? labelAr : labelEn
  const statusColor = STATUS_COLOR[order.status] ?? '#9a9a9e'
  const statusIcon  = STATUS_ICON[order.status]  ?? 'fa-circle'
  const date = new Date(order.createdAt).toLocaleDateString(
    lang === 'ar' ? 'ar-EG' : 'en-GB',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
  const totalUsd = order.totalUsd ?? order.subtotalUsd
  const totalEgp = rateLoaded && totalUsd ? store.pricing.toDisplayPrice(totalUsd) : null

  const isCancelled = order.status === 'cancelled'
  const currentStep = isCancelled ? -1 : STEPS.indexOf(order.status)

  // Normalize shipping address field names (API returns different names)
  const addr = order.shippingAddress
  const addrName     = addr?.name ?? addr?.fullName
  const addrLine1    = addr?.addressLine1 ?? addr?.address
  const addrLine2    = addr?.addressLine2 ?? addr?.area
  const addrCity     = addr?.city
  const addrPhone    = addr?.phone

  return (
    <div style={{ background: '#1c1c1e', minHeight: '80vh' }}>

      {/* Header */}
      <div style={{ background: '#16161a', borderBottom: '1px solid #222226' }}>
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/profile" className="text-sm font-cairo hover:underline" style={{ color: '#9a9a9e' }}>
              <i className="fa-solid fa-arrow-right ms-1" />
              {lang === 'ar' ? 'طلباتي' : 'My Orders'}
            </Link>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-cairo text-2xl font-black text-white mb-1">
                {lang === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-sm px-3 py-1 rounded-full" style={{ background: '#2a2a2e', color: '#c9a96e' }}>
                  #{order.orderNumber ?? order._id.slice(-8).toUpperCase()}
                </span>
                <span className="font-cairo text-sm" style={{ color: '#9a9a9e' }}>{date}</span>
              </div>
            </div>
            <span
              className="flex items-center gap-2 px-4 py-2 rounded-full font-cairo text-sm font-bold"
              style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}40` }}
            >
              <i className={`fa-solid ${statusIcon}`} />
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Progress tracker */}
        {!isCancelled && (
          <div className="rounded-2xl border p-6" style={{ background: '#2a2a2e', borderColor: '#333338' }}>
            <h2 className="font-cairo font-bold text-white mb-5">
              {lang === 'ar' ? 'حالة الطلب' : 'Order Status'}
            </h2>
            <div className="flex items-start justify-between relative">
              {/* connecting line */}
              <div
                className="absolute top-4 h-0.5 z-0"
                style={{
                  background: '#333338',
                  insetInlineStart: '24px',
                  insetInlineEnd: '24px',
                }}
              />
              {STEPS.map((step, i) => {
                const done   = i <= currentStep
                const active = i === currentStep
                const [arLabel, enLabel] = STATUS_LABEL[step] ?? [step, step]
                return (
                  <div key={step} className="flex flex-col items-center gap-2 z-10 flex-1">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                      style={{
                        background: done ? statusColor : '#333338',
                        color:      done ? '#1c1c1e'   : '#9a9a9e',
                        boxShadow:  active ? `0 0 12px ${statusColor}80` : 'none',
                      }}
                    >
                      {done
                        ? <i className="fa-solid fa-check text-[10px]" />
                        : <span className="text-[10px]">{i + 1}</span>
                      }
                    </div>
                    <span
                      className="font-cairo text-[10px] text-center leading-tight"
                      style={{ color: done ? '#ffffff' : '#9a9a9e', maxWidth: '60px' }}
                    >
                      {lang === 'ar' ? arLabel : enLabel}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Items */}
        {order.items && order.items.length > 0 ? (
          <div className="rounded-2xl border overflow-hidden" style={{ background: '#2a2a2e', borderColor: '#333338' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid #333338', background: '#222226' }}>
              <h2 className="font-cairo font-bold text-white">
                <i className="fa-solid fa-box ms-2" style={{ color: '#c9a96e' }} />
                {lang === 'ar' ? 'القطع المطلوبة' : 'Ordered Parts'} ({order.items.length})
              </h2>
            </div>
            <div className="divide-y" style={{ borderColor: '#333338' }}>
              {order.items.map((item, i) => {
                const displayName = lang === 'ar'
                  ? (item.nameAr ?? item.name ?? '—')
                  : (item.name ?? '—')
                const oemNum = item.oem ?? item.oemNumber ?? item.specifications?.oemNumber
                const thumb  = item.image ?? item.specifications?.thumbnailUrl
                const lineEgp = rateLoaded && item.priceUsd
                  ? store.pricing.toDisplayPrice(item.priceUsd * item.quantity)
                  : null
                return (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <div
                      className="w-14 h-14 shrink-0 rounded-lg flex items-center justify-center"
                      style={{ background: '#1c1c1e' }}
                    >
                      {thumb
                        ? <img src={thumb} alt={displayName} className="w-full h-full object-contain p-1 rounded-lg" />
                        : <i className="fa-solid fa-image text-xl" style={{ color: '#333338' }} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-cairo font-bold text-white truncate">{displayName}</p>
                      {oemNum && (
                        <span className="font-mono text-xs px-2 py-0.5 rounded inline-block mt-0.5" style={{ background: '#333338', color: '#c9a96e' }}>
                          {oemNum}
                        </span>
                      )}
                      <p className="font-cairo text-xs mt-1" style={{ color: '#9a9a9e' }}>
                        {lang === 'ar' ? `الكمية: ${item.quantity}` : `Qty: ${item.quantity}`}
                      </p>
                    </div>
                    {lineEgp && (
                      <span className="price-gold text-base shrink-0">{fmt(lineEgp)}</span>
                    )}
                  </div>
                )
              })}
            </div>

            {totalEgp && (
              <div
                className="flex justify-between items-center px-6 py-4"
                style={{ borderTop: '1px solid #333338', background: '#222226' }}
              >
                <span className="font-cairo font-bold text-white">
                  {lang === 'ar' ? 'الإجمالي' : 'Total'}
                </span>
                <span className="price-gold text-xl">{fmt(totalEgp)}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border px-6 py-8 text-center" style={{ background: '#2a2a2e', borderColor: '#333338' }}>
            <i className="fa-solid fa-box text-3xl mb-3" style={{ color: '#333338' }} />
            <p className="font-cairo text-sm" style={{ color: '#9a9a9e' }}>
              {lang === 'ar' ? 'لا توجد تفاصيل للقطع' : 'No item details available'}
            </p>
          </div>
        )}

        {/* Shipping + Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addr && (addrName || addrLine1 || addrCity) && (
            <div className="rounded-2xl border p-6" style={{ background: '#2a2a2e', borderColor: '#333338' }}>
              <h2 className="font-cairo font-bold text-white mb-4">
                <i className="fa-solid fa-location-dot ms-2" style={{ color: '#c9a96e' }} />
                {lang === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'}
              </h2>
              <div className="space-y-1.5 font-cairo text-sm">
                {addrName    && <p className="text-white font-bold">{addrName}</p>}
                {addrPhone   && <p className="font-mono" dir="ltr" style={{ color: '#9a9a9e' }}>{addrPhone}</p>}
                {addrLine1   && <p style={{ color: '#9a9a9e' }}>{addrLine1}</p>}
                {addrLine2   && <p style={{ color: '#9a9a9e' }}>{addrLine2}</p>}
                {addrCity    && <p style={{ color: '#9a9a9e' }}>{addrCity}</p>}
              </div>
            </div>
          )}

          {order.notes && (
            <div className="rounded-2xl border p-6" style={{ background: '#2a2a2e', borderColor: '#333338' }}>
              <h2 className="font-cairo font-bold text-white mb-4">
                <i className="fa-solid fa-note-sticky ms-2" style={{ color: '#c9a96e' }} />
                {lang === 'ar' ? 'ملاحظات' : 'Notes'}
              </h2>
              <p className="font-cairo text-sm" style={{ color: '#9a9a9e' }}>{order.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 flex-wrap">
          <Link href="/profile" className="btn-outline py-2 px-5 text-sm">
            <i className="fa-solid fa-arrow-right" />
            {lang === 'ar' ? 'العودة للطلبات' : 'Back to Orders'}
          </Link>
          <Link href="/catalog" className="btn-gold py-2 px-5 text-sm">
            <i className="fa-solid fa-magnifying-glass" />
            {lang === 'ar' ? 'تسوق المزيد' : 'Shop More'}
          </Link>
        </div>

      </div>
    </div>
  )
}
