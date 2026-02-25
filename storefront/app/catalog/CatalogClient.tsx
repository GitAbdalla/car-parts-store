'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PartCard from '@/components/ui/PartCard'
import { store } from '@/lib/store'
import { useLang } from '@/providers/LangProvider'

interface Category {
  _id: string
  name: string
  nameAr?: string
  productCount: number
}

interface Product {
  _id: string
  name: string
  nameAr?: string
  basePrice: number
  images: string[]
  stock?: number
  specifications?: Record<string, string | number | boolean | string[]>
}

interface Props {
  categories: Category[]
  initialProducts: Product[]
  initialParams: Record<string, string | undefined>
  heading: string
}

export default function CatalogClient({ categories, initialProducts, initialParams, heading }: Props) {
  const router = useRouter()
  const { t, lang } = useLang()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [activeCat, setActiveCat] = useState(initialParams.categoryId ?? '')
  const [sort, setSort] = useState(initialParams.sort ?? 'name_asc')
  const [search, setSearch] = useState(initialParams.q ?? '')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!search.trim()) {
      startTransition(async () => {
        const result = initialParams.modelId
          ? await store.fitment.getProducts({
              modelId: initialParams.modelId!,
              year: initialParams.year ? Number(initialParams.year) : undefined,
              categoryId: activeCat || undefined,
            })
          : await store.products.list({ categoryId: activeCat || undefined, sortBy: sort as any })
        setProducts(Array.isArray(result) ? result : (result as any).products ?? [])
      })
      return
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const results = await store.oem.search(search.trim())
        setProducts(results as any)
      })
    }, 350)

    return () => clearTimeout(timer)
  }, [search])

  async function handleCat(catId: string) {
    setActiveCat(catId)
    startTransition(async () => {
      const result = initialParams.modelId
        ? await store.fitment.getProducts({
            modelId: initialParams.modelId!,
            year: initialParams.year ? Number(initialParams.year) : undefined,
            categoryId: catId || undefined,
          })
        : await store.products.list({ categoryId: catId || undefined, sortBy: sort as any })
      setProducts(Array.isArray(result) ? result : (result as any).products ?? [])
    })
  }

  async function handleSort(s: string) {
    setSort(s)
    startTransition(async () => {
      const result = await store.products.list({ categoryId: activeCat || undefined, sortBy: s as any })
      setProducts((result as any).products ?? [])
    })
  }

  const catBtnClass = (id: string) =>
    `font-cairo text-sm py-2 px-4 rounded-lg text-right transition-all w-full ${
      activeCat === id ? 'font-bold' : 'hover:opacity-80'
    }`

  return (
    <>
      {/* Sidebar */}
      <aside className="md:w-72 shrink-0">
        <div className="sticky top-24">
          {/* Search */}
          <div className="mb-6 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.catalog.searchPlaceholder}
              className="input-dark font-cairo pe-4 ps-10"
            />
            <i className="fa-solid fa-search absolute top-1/2 -translate-y-1/2 inset-s-3" style={{ color: '#9a9a9e' }} />
          </div>

          {/* Categories */}
          <h3 className="font-cairo text-lg font-bold mb-4 text-white">{t.catalog.categories}</h3>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => handleCat('')}
              className={catBtnClass('')}
              style={{
                color: activeCat === '' ? '#1c1c1e' : '#c9a96e',
                background: activeCat === '' ? '#c9a96e' : 'transparent',
              }}
            >
              {t.catalog.all}
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                onClick={() => handleCat(c._id)}
                className={catBtnClass(c._id)}
                style={{
                  color: activeCat === c._id ? '#1c1c1e' : '#c9a96e',
                  background: activeCat === c._id ? '#c9a96e' : 'transparent',
                }}
              >
                {lang === 'ar' ? (c.nameAr ?? c.name) : c.name}
                <span className="font-inter text-xs opacity-60 ms-1">({c.productCount})</span>
              </button>
            ))}
          </div>

          {/* Sort */}
          <h3 className="font-cairo text-lg font-bold mt-8 mb-4 text-white">{t.catalog.sort}</h3>
          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value)}
            className="input-dark font-cairo cursor-pointer"
          >
            <option value="name_asc">{t.catalog.sortName}</option>
            <option value="price_asc">{t.catalog.sortPriceAsc}</option>
            <option value="price_desc">{t.catalog.sortPriceDesc}</option>
            <option value="newest">{t.catalog.sortNewest}</option>
          </select>
        </div>
      </aside>

      {/* Grid */}
      <main className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-cairo text-2xl font-bold text-white">{heading}</h1>
          <span className="font-cairo text-sm" style={{ color: '#9a9a9e' }}>
            {isPending ? t.catalog.searching : t.catalog.partsCount(products.length)}
          </span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-24">
            <i className="fa-solid fa-box-open text-5xl mb-4" style={{ color: '#333338' }} />
            <p className="font-cairo text-xl" style={{ color: '#9a9a9e' }}>{t.catalog.noResults}</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
            {products.map((p) => (
              <PartCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
