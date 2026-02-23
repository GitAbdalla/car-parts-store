'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCart } from '@/lib/cart-store'
import { store } from '@/lib/store'
import { useStoreRate } from '@/providers/StoreProvider'

// 26 Egyptian governorates
const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الاسكندرية', 'الدقهلية', 'البحر الاحمر', 'البحيرة',
  'الفيوم', 'الغربية', 'الاسماعيلية', 'المنوفية', 'المنيا', 'القليوبية',
  'الوادي الجديد', 'السويس', 'اسوان', 'اسيوط', 'بني سويف', 'بورسعيد',
  'دمياط', 'الشرقية', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الاقصر',
  'قنا', 'شمال سيناء',
]

interface CheckoutForm {
  fullName: string
  phone: string
  city: string
  area: string
  address: string
  notes: string
}

const EMPTY_FORM: CheckoutForm = {
  fullName: '',
  phone: '',
  city: '',
  area: '',
  address: '',
  notes: '',
}

export default function CartPage() {
  const { items, removeItem, updateQty, clear } = useCart()
  const rateLoaded = useStoreRate()
  const router = useRouter()
  const [form, setForm] = useState<CheckoutForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const totalUsd = items.reduce((s, i) => s + i.priceUsd * i.quantity, 0)
  const totalEgp = rateLoaded
    ? store.pricing.toDisplayPrice(totalUsd)
    : null

  const totalFormatted = totalEgp
    ? new Intl.NumberFormat('ar-EG').format(totalEgp) + ' ج.م'
    : '…'

  function handleField(field: keyof CheckoutForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Basic validation
    if (!form.fullName.trim()) return toast.error('يرجى ادخال الاسم')
    if (!/^01[0125]\d{8}$/.test(form.phone)) return toast.error('رقم الموبايل غير صحيح')
    if (!form.city) return toast.error('يرجى اختيار المحافظة')
    if (!form.area.trim()) return toast.error('يرجى ادخال المنطقة')
    if (!form.address.trim()) return toast.error('يرجى ادخال العنوان')
    if (items.length === 0) return toast.error('السلة فارغة')

    setSubmitting(true)
    try {
      const orderItems = items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        priceUsd: i.priceUsd,
      }))

      await (store as any).checkout.createOrder({
        items: orderItems,
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          city: form.city,
          area: form.area,
          address: form.address,
          notes: form.notes || undefined,
        },
      })

      clear()
      toast.success('تم تأكيد طلبك بنجاح!')
      router.push('/order-success')
    } catch (err) {
      console.error(err)
      toast.error('حدث خطأ، يرجى المحاولة مجدداً')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div
        className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6"
        style={{ background: '#1c1c1e' }}
      >
        <i className="fa-solid fa-cart-shopping text-7xl mb-6" style={{ color: '#333338' }} />
        <h2 className="font-cairo text-3xl font-bold text-white mb-3">السلة فارغة</h2>
        <p className="font-cairo mb-8" style={{ color: '#9a9a9e' }}>
          لم تقم بإضافة أي قطعة بعد
        </p>
        <Link href="/catalog" className="btn-gold">
          <i className="fa-solid fa-magnifying-glass" />
          تصفح القطع
        </Link>
      </div>
    )
  }

  return (
    <div style={{ background: '#1c1c1e', minHeight: '80vh' }}>
      {/* Delivery banner */}
      <div
        className="text-center py-3 font-cairo text-sm font-bold"
        style={{ background: 'linear-gradient(135deg, #c9a96e, #b8944f)', color: '#1c1c1e' }}
      >
        <i className="fa-solid fa-truck-fast ml-2" />
        السعر شامل التوصيل للباب في كل محافظات مصر
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-cairo text-4xl font-black text-white mb-8">
          <i className="fa-solid fa-cart-shopping ml-3" style={{ color: '#c9a96e' }} />
          سلة الطلب
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const lineEgp = rateLoaded
                ? store.pricing.toDisplayPrice(item.priceUsd * item.quantity)
                : null

              return (
                <div
                  key={item.productId}
                  className="rounded-xl border p-4 flex gap-4"
                  style={{ background: '#2a2a2e', borderColor: '#333338' }}
                >
                  {/* Image */}
                  <div
                    className="w-20 h-20 flex-shrink-0 rounded-lg flex items-center justify-center"
                    style={{ background: '#1c1c1e' }}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.nameAr}
                        className="w-full h-full object-contain rounded-lg p-1"
                      />
                    ) : (
                      <i className="fa-solid fa-image text-2xl" style={{ color: '#333338' }} />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-cairo font-bold text-white truncate">{item.nameAr}</p>
                    <p className="font-inter text-sm truncate mb-1" style={{ color: '#9a9a9e' }}>
                      {item.nameEn}
                    </p>
                    <span
                      className="font-mono text-xs px-2 py-0.5 rounded inline-block mb-2"
                      style={{ background: '#333338', color: '#c9a96e' }}
                    >
                      {item.oem}
                    </span>

                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Qty controls */}
                      <div
                        className="flex items-center rounded-lg overflow-hidden border"
                        style={{ borderColor: '#333338' }}
                      >
                        <button
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center"
                          style={{ background: '#1c1c1e', color: '#c9a96e' }}
                        >
                          <i className="fa-solid fa-minus text-xs" />
                        </button>
                        <span
                          className="w-10 text-center font-mono text-sm font-bold text-white"
                          style={{ background: '#2a2a2e' }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center"
                          style={{ background: '#1c1c1e', color: '#c9a96e' }}
                        >
                          <i className="fa-solid fa-plus text-xs" />
                        </button>
                      </div>

                      {/* Line price */}
                      <span className="price-gold text-base">
                        {lineEgp
                          ? new Intl.NumberFormat('ar-EG').format(lineEgp) + ' ج.م'
                          : '…'}
                      </span>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-xs font-cairo transition-colors mr-auto"
                        style={{ color: '#9a9a9e' }}
                      >
                        <i className="fa-solid fa-trash ml-1" />
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary + Checkout form */}
          <div className="space-y-6">
            {/* Order summary */}
            <div
              className="rounded-xl border p-6"
              style={{ background: '#2a2a2e', borderColor: '#333338' }}
            >
              <h2 className="font-cairo text-xl font-bold text-white mb-4">ملخص الطلب</h2>
              <div className="flex justify-between mb-2">
                <span className="font-cairo text-sm" style={{ color: '#9a9a9e' }}>
                  عدد القطع
                </span>
                <span className="font-mono text-white">
                  {items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-cairo text-sm" style={{ color: '#9a9a9e' }}>
                  التوصيل
                </span>
                <span className="font-cairo text-sm" style={{ color: '#4ade80' }}>
                  مجاني
                </span>
              </div>
              <div
                className="border-t pt-4 mt-4 flex justify-between items-center"
                style={{ borderColor: '#333338' }}
              >
                <span className="font-cairo font-bold text-white">الاجمالي</span>
                <span className="price-gold text-2xl">{totalFormatted}</span>
              </div>
            </div>

            {/* Checkout form */}
            <form
              onSubmit={handleSubmit}
              className="rounded-xl border p-6 space-y-4"
              style={{ background: '#2a2a2e', borderColor: '#333338' }}
            >
              <h2 className="font-cairo text-xl font-bold text-white mb-2">بيانات التوصيل</h2>

              <div>
                <label className="font-cairo text-sm block mb-1" style={{ color: '#9a9a9e' }}>
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  className="input-dark w-full"
                  placeholder="محمد احمد"
                  value={form.fullName}
                  onChange={(e) => handleField('fullName', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="font-cairo text-sm block mb-1" style={{ color: '#9a9a9e' }}>
                  رقم الموبايل *
                </label>
                <input
                  type="tel"
                  className="input-dark w-full font-mono"
                  placeholder="01012345678"
                  dir="ltr"
                  value={form.phone}
                  onChange={(e) => handleField('phone', e.target.value)}
                  required
                />
                <p className="font-cairo text-xs mt-1" style={{ color: '#9a9a9e' }}>
                  يقبل 010 / 011 / 012 / 015
                </p>
              </div>

              <div>
                <label className="font-cairo text-sm block mb-1" style={{ color: '#9a9a9e' }}>
                  المحافظة *
                </label>
                <select
                  className="input-dark w-full"
                  value={form.city}
                  onChange={(e) => handleField('city', e.target.value)}
                  required
                >
                  <option value="">اختر المحافظة</option>
                  {GOVERNORATES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-cairo text-sm block mb-1" style={{ color: '#9a9a9e' }}>
                  المنطقة / الحي *
                </label>
                <input
                  type="text"
                  className="input-dark w-full"
                  placeholder="مدينة نصر، الزقازيق..."
                  value={form.area}
                  onChange={(e) => handleField('area', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="font-cairo text-sm block mb-1" style={{ color: '#9a9a9e' }}>
                  العنوان بالتفصيل *
                </label>
                <textarea
                  className="input-dark w-full resize-none"
                  rows={3}
                  placeholder="الشارع، المبنى، الشقة"
                  value={form.address}
                  onChange={(e) => handleField('address', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="font-cairo text-sm block mb-1" style={{ color: '#9a9a9e' }}>
                  ملاحظات (اختياري)
                </label>
                <textarea
                  className="input-dark w-full resize-none"
                  rows={2}
                  placeholder="أي تعليمات للمندوب..."
                  value={form.notes}
                  onChange={(e) => handleField('notes', e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-gold w-full text-lg py-4 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    جاري الارسال...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check-circle" />
                    تأكيد الطلب
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
