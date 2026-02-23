import { Suspense } from 'react'
import { store } from '@/lib/store'
import CatalogClient from './CatalogClient'

interface Props {
  searchParams: Promise<{
    modelId?: string
    year?: string
    categoryId?: string
    q?: string
    sort?: string
    brand?: string
  }>
}

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams
  const { modelId, year, categoryId, q, sort, brand } = params

  // Fetch categories and initial products in parallel
  const [categories, initialResult] = await Promise.all([
    store.categories.list(),
    modelId
      ? store.fitment.getProducts({
          modelId,
          year: year ? Number(year) : undefined,
          categoryId,
        })
      : store.products.list({
          categoryId,
          sortBy: (sort as any) || 'name_asc',
        }),
  ])

  const products = Array.isArray(initialResult)
    ? initialResult
    : (initialResult as any).products ?? []

  const heading = brand
    ? `قطع ${brand}`
    : categoryId
    ? (categories.find((c) => c._id === categoryId)?.nameAr ?? 'الكتالوج')
    : 'كل القطع'

  return (
    <div className="max-w-7xl mx-auto px-6 py-8" style={{ minHeight: '80vh' }}>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar + Grid — fully client-side for interactivity */}
        <CatalogClient
          categories={categories}
          initialProducts={products}
          initialParams={params}
          heading={heading}
        />
      </div>
    </div>
  )
}
