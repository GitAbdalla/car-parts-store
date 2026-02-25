'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { store } from '@/lib/store'
import { useAuth } from '@/lib/auth-store'
import { useStoreRate } from '@/providers/StoreProvider'
import { useLang } from '@/providers/LangProvider'

interface Profile {
  name: string
  email: string
  phone?: string
  addresses?: SavedAddress[]
}

interface SavedAddress {
  id: string; label: string; name: string; phone: string
  addressLine1: string; addressLine2?: string; city: string; isDefault: boolean
}

interface Order {
  _id: string
  createdAt: number
  status: string
  totalUsd?: number
  items?: Array<{ nameAr?: string; name?: string; quantity: number; priceUsd: number }>
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

export default function ProfilePage() {
  const router = useRouter()
  const { customerId, logout } = useAuth()
  const rateLoaded = useStoreRate()
  const { t, lang } = useLang()

  const hasHydrated = useAuth((s) => s._hasHydrated)
  const [profile, setProfile]     = useState<Profile | null>(null)
  const [orders, setOrders]       = useState<Order[]>([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState<'orders' | 'addresses' | 'settings'>('orders')
  const [editName, setEditName]   = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [saving, setSaving]       = useState(false)
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [addrForm, setAddrForm]   = useState({ label: '', name: '', phone: '', addressLine1: '', addressLine2: '', city: '' })
  const [savingAddr, setSavingAddr] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!hasHydrated) return
    if (!customerId) { router.replace('/login'); return }

    async function load() {
      setLoading(true)
      try {
        const [prof, ords] = await Promise.all([
          store.customer.getProfile(),
          store.customer.listOrders(20),
        ])
        const profData = prof as unknown as Profile
        setProfile(profData)
        setOrders((ords as unknown as Order[]) ?? [])
        setEditName(profData.name ?? '')
        setEditPhone(profData.phone ?? '')
        setAddresses(profData.addresses ?? [])
      } catch {
        toast.error(lang === 'ar' ? 'تعذّر تحميل البيانات' : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [customerId, hasHydrated, router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await store.customer.updateProfile({ name: editName, phone: editPhone })
      setProfile((p) => p ? { ...p, name: editName, phone: editPhone } : p)
      toast.success(lang === 'ar' ? 'تم حفظ التغييرات' : 'Changes saved')
    } catch {
      toast.error(lang === 'ar' ? 'فشل الحفظ' : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault()
    setSavingAddr(true)
    try {
      await store.customer.addAddress({
        id: crypto.randomUUID(),
        label: addrForm.label || addrForm.city,
        name: addrForm.name,
        phone: addrForm.phone,
        addressLine1: addrForm.addressLine1,
        addressLine2: addrForm.addressLine2 || undefined,
        city: addrForm.city,
        isDefault: addresses.length === 0,
      } as any)
      const prof = await store.customer.getProfile() as unknown as Profile
      setAddresses(prof.addresses ?? [])
      setShowAddForm(false)
      setAddrForm({ label: '', name: '', phone: '', addressLine1: '', addressLine2: '', city: '' })
      toast.success(lang === 'ar' ? 'تم حفظ العنوان' : 'Address saved')
    } catch {
      toast.error(lang === 'ar' ? 'فشل حفظ العنوان' : 'Failed to save address')
    } finally {
      setSavingAddr(false)
    }
  }

  async function handleDeleteAddress(id: string) {
    setDeletingId(id)
    try {
      await store.customer.removeAddress(id)
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      toast.success(lang === 'ar' ? 'تم حذف العنوان' : 'Address deleted')
    } catch {
      toast.error(lang === 'ar' ? 'فشل حذف العنوان' : 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  function handleLogout() {
    store.customer.logout?.()
    logout()
    toast.success(lang === 'ar' ? 'تم تسجيل الخروج' : 'Signed out')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: '#1c1c1e' }}>
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-4xl mb-4" style={{ color: '#c9a96e' }} />
          <p className="font-cairo text-white">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div style={{ background: '#1c1c1e', minHeight: '80vh' }}>

      {/* Header */}
      <div style={{ background: '#16161a', borderBottom: '1px solid #222226' }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 text-2xl font-black"
            style={{ background: 'linear-gradient(135deg, #c9a96e, #b8944f)', color: '#1c1c1e' }}
          >
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-cairo text-2xl font-black text-white">{profile.name}</h1>
            <p className="font-inter text-sm" style={{ color: '#9a9a9e' }}>{profile.email}</p>
            {profile.phone && (
              <p className="font-mono text-sm" style={{ color: '#9a9a9e' }}>{profile.phone}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="btn-outline py-2 px-4 text-sm shrink-0"
            style={{ borderColor: '#ef4444', color: '#ef4444' }}
          >
            <i className="fa-solid fa-right-from-bracket" />
            {t.profile.logout}
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-6 flex border-t" style={{ borderColor: '#222226' }}>
          {(['orders', 'addresses', 'settings'] as const).map((tab_) => (
            <button
              key={tab_}
              onClick={() => setTab(tab_)}
              className="font-cairo text-sm font-bold px-6 py-3 border-b-2 transition-colors"
              style={{
                borderColor: tab === tab_ ? '#c9a96e' : 'transparent',
                color: tab === tab_ ? '#c9a96e' : '#9a9a9e',
              }}
            >
              {tab_ === 'orders'
                ? <><i className="fa-solid fa-box ms-2" />{t.profile.orders} ({orders.length})</>
                : tab_ === 'addresses'
                ? <><i className="fa-solid fa-location-dot ms-2" />{t.addresses.tab} ({addresses.length})</>
                : <><i className="fa-solid fa-gear ms-2" />{t.profile.settings}</>
              }
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Orders tab */}
        {tab === 'orders' && (
          orders.length === 0 ? (
            <div className="text-center py-20">
              <i className="fa-solid fa-box-open text-6xl mb-4" style={{ color: '#333338' }} />
              <p className="font-cairo text-xl font-bold text-white mb-2">{t.profile.noOrders}</p>
              <p className="font-cairo text-sm mb-6" style={{ color: '#9a9a9e' }}>{t.profile.noOrdersDesc}</p>
              <Link href="/catalog" className="btn-gold">
                <i className="fa-solid fa-magnifying-glass" />{t.profile.browseCatalog}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const [labelAr, labelEn] = STATUS_LABEL[order.status] ?? [order.status, order.status]
                const statusLabel = lang === 'ar' ? labelAr : labelEn
                const statusColor = STATUS_COLOR[order.status] ?? '#9a9a9e'
                const date = new Date(order.createdAt).toLocaleDateString(
                  lang === 'ar' ? 'ar-EG' : 'en-GB',
                  { day: 'numeric', month: 'long', year: 'numeric' }
                )
                const totalEgp = rateLoaded && order.totalUsd
                  ? store.pricing.toDisplayPrice(order.totalUsd)
                  : null

                return (
                  <div key={order._id} className="rounded-2xl border overflow-hidden" style={{ background: '#2a2a2e', borderColor: '#333338' }}>
                    <div
                      className="flex items-center justify-between px-6 py-4 flex-wrap gap-3"
                      style={{ borderBottom: '1px solid #333338', background: '#222226' }}
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-xs px-3 py-1 rounded-full" style={{ background: '#1c1c1e', color: '#c9a96e' }}>
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="font-cairo text-sm" style={{ color: '#9a9a9e' }}>{date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {totalEgp && (
                          <span className="price-gold text-base">
                            {new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-EG').format(totalEgp)} {lang === 'ar' ? 'ج.م' : 'EGP'}
                          </span>
                        )}
                        <span className="badge text-xs" style={{ background: `${statusColor}18`, color: statusColor }}>
                          {statusLabel}
                        </span>
                        <Link
                          href={`/order/${order._id}`}
                          className="font-cairo text-xs font-bold hover:underline"
                          style={{ color: '#c9a96e' }}
                        >
                          {lang === 'ar' ? 'التفاصيل' : 'Details'}
                          <i className="fa-solid fa-chevron-left ms-1 text-[10px]" />
                        </Link>
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="divide-y" style={{ borderColor: '#333338' }}>
                        {order.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="flex items-center justify-between px-6 py-3">
                            <div>
                              <p className="font-cairo text-sm text-white">
                                {lang === 'ar' ? ((item as any).nameAr ?? item.name) : item.name} {/* eslint-disable-line */}
                              </p>
                              <p className="font-cairo text-xs" style={{ color: '#9a9a9e' }}>
                                {lang === 'ar' ? `الكمية: ${item.quantity}` : `Qty: ${item.quantity}`}
                              </p>
                            </div>
                            {rateLoaded && item.priceUsd && (
                              <span className="font-cairo text-sm font-bold" style={{ color: '#c9a96e' }}>
                                {new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-EG').format(
                                  store.pricing.toDisplayPrice(item.priceUsd * item.quantity)
                                )} {lang === 'ar' ? 'ج.م' : 'EGP'}
                              </span>
                            )}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="px-6 py-2 font-cairo text-xs" style={{ color: '#9a9a9e' }}>
                            +{order.items.length - 3} {lang === 'ar' ? 'قطع أخرى' : 'more parts'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* Addresses tab */}
        {tab === 'addresses' && (
          <div className="max-w-lg space-y-4">

            {addresses.length === 0 && !showAddForm && (
              <div className="text-center py-14 rounded-2xl border" style={{ background: '#2a2a2e', borderColor: '#333338' }}>
                <i className="fa-solid fa-location-dot text-5xl mb-4" style={{ color: '#333338' }} />
                <p className="font-cairo text-lg font-bold text-white mb-1">{t.addresses.noAddresses}</p>
                <p className="font-cairo text-sm mb-6" style={{ color: '#9a9a9e' }}>{t.addresses.noAddressesDesc}</p>
                <button onClick={() => setShowAddForm(true)} className="btn-gold">
                  <i className="fa-solid fa-plus" />{t.addresses.addNew}
                </button>
              </div>
            )}

            {addresses.map((addr) => (
              <div key={addr.id} className="rounded-2xl border p-5" style={{ background: '#2a2a2e', borderColor: '#333338' }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-location-dot shrink-0" style={{ color: '#c9a96e' }} />
                    <span className="font-cairo font-bold text-white">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-cairo" style={{ background: 'rgba(201,169,110,0.15)', color: '#c9a96e' }}>
                        {t.addresses.defaultBadge}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    disabled={deletingId === addr.id}
                    className="font-cairo text-xs flex items-center gap-1 transition-colors disabled:opacity-40"
                    style={{ color: '#ef4444' }}
                  >
                    {deletingId === addr.id
                      ? <i className="fa-solid fa-spinner fa-spin" />
                      : <i className="fa-solid fa-trash" />
                    }
                    {t.addresses.delete}
                  </button>
                </div>
                <div className="space-y-0.5 font-cairo text-sm ps-6">
                  <p className="font-bold text-white">{addr.name}</p>
                  <p className="font-mono text-xs" style={{ color: '#9a9a9e' }} dir="ltr">{addr.phone}</p>
                  <p style={{ color: '#9a9a9e' }}>{addr.addressLine1}{addr.addressLine2 ? `، ${addr.addressLine2}` : ''}، {addr.city}</p>
                </div>
              </div>
            ))}

            {/* Add form */}
            {showAddForm ? (
              <form onSubmit={handleAddAddress} className="rounded-2xl border p-6 space-y-4" style={{ background: '#2a2a2e', borderColor: '#c9a96e' }}>
                <h3 className="font-cairo font-bold text-white">
                  <i className="fa-solid fa-plus ms-2" style={{ color: '#c9a96e' }} />
                  {t.addresses.addNew}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-cairo text-xs block mb-1" style={{ color: '#9a9a9e' }}>{t.addresses.label}</label>
                    <input className="input-dark w-full" placeholder={t.addresses.labelPlaceholder} value={addrForm.label} onChange={(e) => setAddrForm((f) => ({ ...f, label: e.target.value }))} />
                  </div>
                  <div>
                    <label className="font-cairo text-xs block mb-1" style={{ color: '#9a9a9e' }}>{t.addresses.city}</label>
                    <input className="input-dark w-full" placeholder={lang === 'ar' ? 'القاهرة' : 'Cairo'} value={addrForm.city} onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))} required />
                  </div>
                </div>
                <div>
                  <label className="font-cairo text-xs block mb-1" style={{ color: '#9a9a9e' }}>{t.addresses.name}</label>
                  <input className="input-dark w-full" value={addrForm.name} onChange={(e) => setAddrForm((f) => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="font-cairo text-xs block mb-1" style={{ color: '#9a9a9e' }}>{t.addresses.phone}</label>
                  <input className="input-dark w-full font-mono" dir="ltr" placeholder="01012345678" value={addrForm.phone} onChange={(e) => setAddrForm((f) => ({ ...f, phone: e.target.value }))} required />
                </div>
                <div>
                  <label className="font-cairo text-xs block mb-1" style={{ color: '#9a9a9e' }}>{t.addresses.addressLine1}</label>
                  <input className="input-dark w-full" value={addrForm.addressLine1} onChange={(e) => setAddrForm((f) => ({ ...f, addressLine1: e.target.value }))} required />
                </div>
                <div>
                  <label className="font-cairo text-xs block mb-1" style={{ color: '#9a9a9e' }}>{t.addresses.addressLine2}</label>
                  <input className="input-dark w-full" value={addrForm.addressLine2} onChange={(e) => setAddrForm((f) => ({ ...f, addressLine2: e.target.value }))} />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={savingAddr} className="btn-gold flex-1 disabled:opacity-50">
                    {savingAddr ? <><i className="fa-solid fa-spinner fa-spin" />{t.addresses.saving}</> : <><i className="fa-solid fa-floppy-disk" />{t.addresses.save}</>}
                  </button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="btn-outline px-5">
                    {t.addresses.cancel}
                  </button>
                </div>
              </form>
            ) : addresses.length > 0 && (
              <button onClick={() => setShowAddForm(true)} className="btn-outline w-full py-3">
                <i className="fa-solid fa-plus" />{t.addresses.addNew}
              </button>
            )}
          </div>
        )}

        {/* Settings tab */}
        {tab === 'settings' && (
          <div className="max-w-lg">
            <form
              onSubmit={handleSave}
              className="rounded-2xl border p-6 space-y-5"
              style={{ background: '#2a2a2e', borderColor: '#333338' }}
            >
              <h2 className="font-cairo text-xl font-bold text-white mb-2">
                <i className="fa-solid fa-user-pen ms-2" style={{ color: '#c9a96e' }} />
                {t.profile.editProfile}
              </h2>

              <div>
                <label className="font-cairo text-sm block mb-2" style={{ color: '#9a9a9e' }}>{t.profile.fullName}</label>
                <input type="text" className="input-dark w-full" value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </div>

              <div>
                <label className="font-cairo text-sm block mb-2" style={{ color: '#9a9a9e' }}>
                  {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input type="email" className="input-dark w-full opacity-50 cursor-not-allowed" value={profile.email} dir="ltr" disabled />
                <p className="font-cairo text-xs mt-1" style={{ color: '#9a9a9e' }}>{t.profile.emailReadonly}</p>
              </div>

              <div>
                <label className="font-cairo text-sm block mb-2" style={{ color: '#9a9a9e' }}>{t.profile.phone}</label>
                <input type="tel" className="input-dark w-full font-mono" value={editPhone} dir="ltr" onChange={(e) => setEditPhone(e.target.value)} placeholder="01012345678" />
              </div>

              <button type="submit" disabled={saving} className="btn-gold w-full py-3">
                {saving
                  ? <><i className="fa-solid fa-spinner fa-spin" /> {t.profile.saving}</>
                  : <><i className="fa-solid fa-floppy-disk" /> {t.profile.save}</>
                }
              </button>
            </form>

            <div className="rounded-2xl border p-6 mt-5" style={{ background: '#2a2a2e', borderColor: '#333338' }}>
              <h3 className="font-cairo font-bold text-white mb-1">{t.profile.logoutSection}</h3>
              <p className="font-cairo text-sm mb-4" style={{ color: '#9a9a9e' }}>{t.profile.logoutDesc}</p>
              <button onClick={handleLogout} className="btn-outline py-2 px-6 text-sm" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                <i className="fa-solid fa-right-from-bracket" />{t.profile.logout}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
