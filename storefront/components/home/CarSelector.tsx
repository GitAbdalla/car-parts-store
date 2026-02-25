'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { store } from '@/lib/store'
import { useLang } from '@/providers/LangProvider'
import type { VehicleBrand, VehicleModel } from '@mantaray-digital/plugin-automotive'

export default function CarSelector() {
  const router = useRouter()
  const { lang } = useLang()
  const ar = lang === 'ar'
  const [brands, setBrands]   = useState<VehicleBrand[]>([])
  const [models, setModels]   = useState<VehicleModel[]>([])
  const [years, setYears]     = useState<number[]>([])
  const [brand, setBrand]     = useState<VehicleBrand | null>(null)
  const [model, setModel]     = useState<VehicleModel | null>(null)
  const [year, setYear]       = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    store.fitment.getBrands()
      .then(setBrands)
      .finally(() => setLoading(false))
  }, [])

  async function handleBrand(brandId: string) {
    const b = brands.find((x) => x._id === brandId) ?? null
    setBrand(b)
    setModel(null)
    setYear(null)
    setModels([])
    setYears([])
    if (b) {
      const ms = await store.fitment.getModels(b._id)
      setModels(ms)
    }
  }

  function handleModel(modelId: string) {
    const m = models.find((x) => x._id === modelId) ?? null
    setModel(m)
    setYear(null)
    setYears(m ? store.fitment.getYears(m) : [])
  }

  function handleSearch() {
    if (!model) return
    const params = new URLSearchParams()
    params.set('modelId', model._id)
    if (year) params.set('year', String(year))
    if (brand) params.set('brand', brand.nameEn)
    router.push(`/catalog?${params.toString()}`)
  }

  const selectClass = 'input-dark font-cairo text-lg cursor-pointer'

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Brand */}
        <select
          className={selectClass}
          value={brand?._id ?? ''}
          onChange={(e) => handleBrand(e.target.value)}
          disabled={loading}
        >
          <option value="">{loading ? (ar ? 'جاري التحميل...' : 'Loading...') : (ar ? 'الماركة' : 'Make')}</option>
          {brands.map((b) => (
            <option key={b._id} value={b._id}>{ar ? b.nameAr : b.nameEn}</option>
          ))}
        </select>

        {/* Model */}
        <select
          className={selectClass}
          value={model?._id ?? ''}
          onChange={(e) => handleModel(e.target.value)}
          disabled={!brand}
        >
          <option value="">{ar ? 'الموديل' : 'Model'}</option>
          {models.map((m) => (
            <option key={m._id} value={m._id}>{ar ? (m as any).nameAr ?? m.nameEn : m.nameEn}</option>
          ))}
        </select>

        {/* Year */}
        <select
          className={selectClass}
          value={year ?? ''}
          onChange={(e) => setYear(Number(e.target.value))}
          disabled={!model}
        >
          <option value="">{ar ? 'السنة' : 'Year'}</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="text-center mt-6">
        <button
          onClick={handleSearch}
          disabled={!model}
          className="btn-gold px-10 py-3"
        >
          <i className="fa-solid fa-search" />
          {ar ? 'عرض القطع' : 'Find Parts'}
        </button>
      </div>
    </div>
  )
}
