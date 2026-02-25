'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCart } from '@/lib/cart-store'
import { store } from '@/lib/store'
import { useAuth } from '@/lib/auth-store'
import { useStoreRate } from '@/providers/StoreProvider'
import { useLang } from '@/providers/LangProvider'
import { parseConvexError } from '@mantaray-digital/store-sdk'

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p className="font-cairo text-xs mt-1.5 flex items-center gap-1.5" style={{ color: '#ef4444' }}>
      <i className="fa-solid fa-circle-exclamation shrink-0" />
      {msg}
    </p>
  )
}

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الاسكندرية', 'الدقهلية', 'البحر الاحمر', 'البحيرة',
  'الفيوم', 'الغربية', 'الاسماعيلية', 'المنوفية', 'المنيا', 'القليوبية',
  'الوادي الجديد', 'السويس', 'اسوان', 'اسيوط', 'بني سويف', 'بورسعيد',
  'دمياط', 'الشرقية', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الاقصر',
  'قنا', 'شمال سيناء',
]

interface CheckoutForm {
  fullName: string; phone: string; city: string; area: string; address: string; notes: string;
}

interface SavedAddress {
  id: string; label: string; name: string; phone: string
  addressLine1: string; addressLine2?: string; city: string; isDefault: boolean
}

const EMPTY: CheckoutForm = { fullName: '', phone: '', city: '', area: '', address: '', notes: '' }

export default function CartPage() {
  const { items, removeItem, updateQty, clear } = useCart()
  const rateLoaded = useStoreRate()
  const { t, lang } = useLang()
  const customerId = useAuth((s) => s.customerId)
  const hasHydrated = useAuth((s) => s._hasHydrated)
  const router = useRouter()
  const [form, setForm] = useState<CheckoutForm>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new' | null>(null)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CheckoutForm | 'general', string>>>({})

  const totalUsd = items.reduce((s, i) => s + i.priceUsd * i.quantity, 0)
  const totalEgp = rateLoaded ? store.pricing.toDisplayPrice(totalUsd) : null
  const totalFormatted = totalEgp
    ? `${new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-EG').format(totalEgp)} ${lang === 'ar' ? 'ج.م' : 'EGP'}`
    : '…'

  // Load saved addresses when logged in
  useEffect(() => {
    if (!hasHydrated || !customerId) return
    store.customer.getProfile().then((prof: any) => {
      const addrs: SavedAddress[] = prof?.addresses ?? []
      setSavedAddresses(addrs)
      if (addrs.length > 0) {
        // Pre-select default address or first one
        const def = addrs.find((a) => a.isDefault) ?? addrs[0]
        setSelectedAddressId(def.id)
        setForm({
          fullName: def.name,
          phone: def.phone,
          city: def.city,
          area: def.addressLine2 ?? '',
          address: def.addressLine1,
          notes: '',
        })
      } else {
        setSelectedAddressId('new')
      }
    }).catch(() => {
      setSelectedAddressId('new')
    })
  }, [customerId, hasHydrated])

  function selectSavedAddress(addr: SavedAddress) {
    setSelectedAddressId(addr.id)
    setForm({
      fullName: addr.name,
      phone: addr.phone,
      city: addr.city,
      area: addr.addressLine2 ?? '',
      address: addr.addressLine1,
      notes: form.notes,
    })
  }

  function selectNew() {
    setSelectedAddressId('new')
    setForm(EMPTY)
  }

  function setField(f: keyof CheckoutForm, v: string) {
    setForm((prev) => ({ ...prev, [f]: v }))
    setFormErrors((e) => ({ ...e, [f]: undefined }))
  }

  function validateForm() {
    const ar = lang === 'ar'
    const errs: typeof formErrors = {}
    if (!form.fullName.trim())
      errs.fullName = ar ? 'يرجى ادخال الاسم الكامل' : 'Full name is required'
    if (!form.phone.trim())
      errs.phone = ar ? 'يرجى ادخال رقم الموبايل' : 'Mobile number is required'
    else if (!/^01[0125]\d{8}$/.test(form.phone))
      errs.phone = ar ? 'يقبل أرقام 010/011/012/015 فقط' : 'Must be a valid Egyptian number (010/011/012/015)'
    if (!form.city)
      errs.city = ar ? 'يرجى اختيار المحافظة' : 'Please select a governorate'
    if (!form.area.trim())
      errs.area = ar ? 'يرجى ادخال المنطقة أو الحي' : 'Area / district is required'
    if (!form.address.trim())
      errs.address = ar ? 'يرجى ادخال العنوان بالتفصيل' : 'Detailed address is required'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedAddressId === 'new' || !selectedAddressId) {
      if (!validateForm()) return
    }
    if (!items.length) return
    if (!customerId) {
      router.push('/login')
      return
    }

    setSubmitting(true)
    try {
      // Sync local cart to SDK server-side cart
      await (store as any).cart.clear()
      await Promise.all(
        items.map((item) =>
          (store as any).cart.addItem(item.productId, { quantity: item.quantity })
        )
      )

      await (store as any).checkout.createOrder({
        customerId,
        notes: form.notes || undefined,
        shippingAddress: {
          name: form.fullName,
          phone: form.phone,
          city: form.city,
          addressLine1: form.address,
          addressLine2: form.area || undefined,
        },
      })

      // Auto-save address if it's a new one (not already saved)
      if (selectedAddressId === 'new') {
        const alreadyExists = savedAddresses.some(
          (a) => a.addressLine1 === form.address && a.city === form.city
        )
        if (!alreadyExists) {
          store.customer.addAddress({
            id: crypto.randomUUID(),
            label: form.area ? `${form.area}، ${form.city}` : form.city,
            name: form.fullName,
            phone: form.phone,
            addressLine1: form.address,
            addressLine2: form.area || undefined,
            city: form.city,
            isDefault: savedAddresses.length === 0,
          } as any).then(() => {
            toast.success(t.addresses.autoSaved, { duration: 2500 })
          }).catch(() => {/* silent */})
        }
      }

      clear()
      toast.success(lang === 'ar' ? 'تم تأكيد طلبك بنجاح!' : 'Order placed successfully!')
      router.push('/order-success')
    } catch (err: unknown) {
      const parsed = parseConvexError(err instanceof Error ? err : new Error(String(err)))
      setFormErrors({ general: lang === 'ar'
        ? `حدث خطأ: ${parsed.message}`
        : `Error: ${parsed.message}` })
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6" style={{ background: '#1c1c1e' }}>
        <i className="fa-solid fa-cart-shopping text-7xl mb-6" style={{ color: '#333338' }} />
        <h2 className="font-cairo text-3xl font-bold text-white mb-3">{t.cart.empty}</h2>
        <p className="font-cairo mb-8" style={{ color: '#9a9a9e' }}>{t.cart.emptyDesc}</p>
        <Link href="/catalog" className="btn-gold">
          <i className="fa-solid fa-magnifying-glass" />{t.cart.browse}
        </Link>
      </div>
    )
  }

  return (
    <div style={{ background: '#1c1c1e', minHeight: '80vh' }}>
      {/* Delivery banner */}
      <div className="text-center py-3 font-cairo text-sm font-bold" style={{ background: 'linear-gradient(135deg, #c9a96e, #b8944f)', color: '#1c1c1e' }}>
        <i className="fa-solid fa-truck-fast ms-2" />{t.cart.delivery}
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-cairo text-4xl font-black text-white mb-8">
          <i className="fa-solid fa-cart-shopping ms-3" style={{ color: '#c9a96e' }} />{t.cart.title}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const lineEgp = rateLoaded ? store.pricing.toDisplayPrice(item.priceUsd * item.quantity) : null
              const displayName = lang === 'ar' ? item.nameAr : item.nameEn

              return (
                <div key={item.productId} className="rounded-xl border p-4 flex gap-4" style={{ background: '#2a2a2e', borderColor: '#333338' }}>
                  <div className="w-20 h-20 shrink-0 rounded-lg flex items-center justify-center" style={{ background: '#1c1c1e' }}>
                    {item.image
                      ? <img src={item.image} alt={displayName} className="w-full h-full object-contain rounded-lg p-1" />
                      : <i className="fa-solid fa-image text-2xl" style={{ color: '#333338' }} />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-cairo font-bold text-white truncate">{displayName}</p>
                    <p className="font-inter text-sm truncate mb-1" style={{ color: '#9a9a9e' }}>{item.nameEn}</p>
                    <span className="font-mono text-xs px-2 py-0.5 rounded inline-block mb-2" style={{ background: '#333338', color: '#c9a96e' }}>
                      {item.oem}
                    </span>

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center rounded-lg overflow-hidden border" style={{ borderColor: '#333338' }}>
                        <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center" style={{ background: '#1c1c1e', color: '#c9a96e' }}>
                          <i className="fa-solid fa-minus text-xs" />
                        </button>
                        <span className="w-10 text-center font-mono text-sm font-bold text-white" style={{ background: '#2a2a2e' }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center" style={{ background: '#1c1c1e', color: '#c9a96e' }}>
                          <i className="fa-solid fa-plus text-xs" />
                        </button>
                      </div>

                      <span className="price-gold text-base">
                        {lineEgp ? `${new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-EG').format(lineEgp)} ${lang === 'ar' ? 'ج.م' : 'EGP'}` : '…'}
                      </span>

                      <button onClick={() => removeItem(item.productId)} className="text-xs font-cairo ms-auto transition-colors" style={{ color: '#9a9a9e' }}>
                        <i className="fa-solid fa-trash ms-1" />{t.cart.remove}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary + Form */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="rounded-xl border p-6" style={{ background: '#2a2a2e', borderColor: '#333338' }}>
              <h2 className="font-cairo text-xl font-bold text-white mb-4">{t.cart.summary}</h2>
              <div className="flex justify-between mb-2">
                <span className="font-cairo text-sm" style={{ color: '#9a9a9e' }}>{t.cart.partsCount}</span>
                <span className="font-mono text-white">{items.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-cairo text-sm" style={{ color: '#9a9a9e' }}>{t.cart.shipping}</span>
                <span className="font-cairo text-sm" style={{ color: '#4ade80' }}>{t.cart.shippingFree}</span>
              </div>
              <div className="border-t pt-4 mt-4 flex justify-between items-center" style={{ borderColor: '#333338' }}>
                <span className="font-cairo font-bold text-white">{t.cart.total}</span>
                <span className="price-gold text-2xl">{totalFormatted}</span>
              </div>
            </div>

            {/* Checkout form */}
            <form onSubmit={handleSubmit} noValidate className="rounded-xl border p-6 space-y-4" style={{ background: '#2a2a2e', borderColor: '#333338' }}>
              <h2 className="font-cairo text-xl font-bold text-white mb-2">{t.cart.shippingForm}</h2>

              {formErrors.general && (
                <div className="rounded-lg px-4 py-3 flex items-center gap-2 font-cairo text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                  <i className="fa-solid fa-triangle-exclamation shrink-0" />
                  {formErrors.general}
                </div>
              )}

              {/* Saved address selector */}
              {customerId && savedAddresses.length > 0 && (
                <div className="space-y-2">
                  <p className="font-cairo text-sm font-bold" style={{ color: '#9a9a9e' }}>
                    <i className="fa-solid fa-location-dot ms-1" style={{ color: '#c9a96e' }} />
                    {t.addresses.savedAddresses}
                  </p>

                  <div className="space-y-2">
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => selectSavedAddress(addr)}
                        className="w-full text-start p-3 rounded-lg border transition-all"
                        style={{
                          background: selectedAddressId === addr.id ? 'rgba(201,169,110,0.1)' : '#1c1c1e',
                          borderColor: selectedAddressId === addr.id ? '#c9a96e' : '#333338',
                        }}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-cairo text-sm font-bold text-white">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-cairo" style={{ background: 'rgba(201,169,110,0.15)', color: '#c9a96e' }}>
                              {t.addresses.defaultBadge}
                            </span>
                          )}
                        </div>
                        <p className="font-cairo text-xs truncate" style={{ color: '#9a9a9e' }}>
                          {addr.addressLine1}{addr.addressLine2 ? `، ${addr.addressLine2}` : ''}، {addr.city}
                        </p>
                      </button>
                    ))}

                    {/* New address option */}
                    <button
                      type="button"
                      onClick={selectNew}
                      className="w-full text-start p-3 rounded-lg border transition-all flex items-center gap-2"
                      style={{
                        background: selectedAddressId === 'new' ? 'rgba(201,169,110,0.1)' : '#1c1c1e',
                        borderColor: selectedAddressId === 'new' ? '#c9a96e' : '#333338',
                      }}
                    >
                      <i className="fa-solid fa-plus text-xs" style={{ color: '#c9a96e' }} />
                      <span className="font-cairo text-sm" style={{ color: selectedAddressId === 'new' ? '#c9a96e' : '#9a9a9e' }}>
                        {t.addresses.newAddress}
                      </span>
                    </button>
                  </div>

                  {selectedAddressId !== 'new' && (
                    <div className="h-px my-2" style={{ background: '#333338' }} />
                  )}
                </div>
              )}

              {/* Form fields — always shown for editing */}
              {(selectedAddressId === 'new' || !customerId || savedAddresses.length === 0) && (
                <>
                  <div>
                    <label className="font-cairo text-sm block mb-1" style={{ color: '#9a9a9e' }}>{t.cart.fullName}</label>
                    <input type="text" className="input-dark w-full" style={formErrors.fullName ? { borderColor: '#ef4444' } : {}} placeholder={lang === 'ar' ? 'محمد احمد' : 'John Smith'} value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} />
                    <FieldError msg={formErrors.fullName} />
                  </div>
                  <div>
                    <label className="font-cairo text-sm block mb-1" style={{ color: '#9a9a9e' }}>{t.cart.phone}</label>
                    <input type="tel" className="input-dark w-full font-mono" style={formErrors.phone ? { borderColor: '#ef4444' } : {}} placeholder="01012345678" dir="ltr" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
                    <FieldError msg={formErrors.phone} />
                  </div>
                  <div>
                    <label className="font-cairo text-sm block mb-1" style={{ color: '#9a9a9e' }}>{t.cart.governorate}</label>
                    <select className="input-dark w-full" style={formErrors.city ? { borderColor: '#ef4444' } : {}} value={form.city} onChange={(e) => setField('city', e.target.value)}>
                      <option value="">{t.cart.govPlaceholder}</option>
                      {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <FieldError msg={formErrors.city} />
                  </div>
                  <div>
                    <label className="font-cairo text-sm block mb-1" style={{ color: '#9a9a9e' }}>{t.cart.area}</label>
                    <input type="text" className="input-dark w-full" style={formErrors.area ? { borderColor: '#ef4444' } : {}} placeholder={t.cart.areaPlaceholder} value={form.area} onChange={(e) => setField('area', e.target.value)} />
                    <FieldError msg={formErrors.area} />
                  </div>
                  <div>
                    <label className="font-cairo text-sm block mb-1" style={{ color: '#9a9a9e' }}>{t.cart.address}</label>
                    <textarea className="input-dark w-full resize-none" style={formErrors.address ? { borderColor: '#ef4444' } : {}} rows={3} placeholder={t.cart.addressPlaceholder} value={form.address} onChange={(e) => setField('address', e.target.value)} />
                    <FieldError msg={formErrors.address} />
                  </div>
                </>
              )}

              {/* If saved address is selected, show a compact summary */}
              {selectedAddressId && selectedAddressId !== 'new' && savedAddresses.length > 0 && (
                <div className="rounded-lg p-3 space-y-0.5" style={{ background: '#1c1c1e', border: '1px solid #333338' }}>
                  <p className="font-cairo text-sm font-bold text-white">{form.fullName}</p>
                  <p className="font-mono text-xs" style={{ color: '#9a9a9e' }} dir="ltr">{form.phone}</p>
                  <p className="font-cairo text-xs" style={{ color: '#9a9a9e' }}>
                    {form.address}{form.area ? `، ${form.area}` : ''}، {form.city}
                  </p>
                </div>
              )}

              <div>
                <label className="font-cairo text-sm block mb-1" style={{ color: '#9a9a9e' }}>{t.cart.notes}</label>
                <textarea className="input-dark w-full resize-none" rows={2} placeholder={t.cart.notesPlaceholder} value={form.notes} onChange={(e) => setField('notes', e.target.value)} />
              </div>

              {!customerId && (
                <div className="rounded-lg p-3 text-sm font-cairo flex items-center gap-2" style={{ background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.3)', color: '#c9a96e' }}>
                  <i className="fa-solid fa-circle-info shrink-0" />
                  <span>
                    {lang === 'ar' ? 'يجب ' : 'You need to '}
                    <Link href="/login" className="underline font-bold">{lang === 'ar' ? 'تسجيل الدخول' : 'sign in'}</Link>
                    {lang === 'ar' ? ' لإتمام الطلب' : ' to place an order'}
                  </span>
                </div>
              )}

              <button type="submit" disabled={submitting} className="btn-gold w-full text-lg py-4 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting
                  ? <><i className="fa-solid fa-spinner fa-spin" /> {t.cart.submitting}</>
                  : <><i className="fa-solid fa-check-circle" /> {t.cart.submit}</>
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
