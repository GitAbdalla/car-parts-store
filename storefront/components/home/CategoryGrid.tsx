'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { store } from '@/lib/store'
import { useLang } from '@/providers/LangProvider'

interface Category {
  _id: string
  name: string
  nameAr?: string
  icon?: string
  productCount?: number
}

export default function CategoryGrid() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const [categories, setCategories] = useState<Category[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    store.categories.list()
      .then((cats) => setCategories(cats as unknown as Category[]))
      .finally(() => setLoaded(true))
  }, [])

  if (!loaded) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-pulse">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-xl h-32" style={{ background: '#333338' }} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {categories.map((cat) => {
        const displayName = ar ? (cat.nameAr ?? cat.name) : cat.name
        return (
          <Link
            key={cat._id}
            href={`/catalog?categoryId=${cat._id}`}
            className="card p-6 text-center block hover:scale-105 transition-transform"
          >
            {cat.icon ? (
              <i className={`fa-solid ${cat.icon} text-3xl mb-3`} style={{ color: '#c9a96e' }} />
            ) : (
              <i className="fa-solid fa-gear text-3xl mb-3" style={{ color: '#c9a96e' }} />
            )}
            <h3 className="font-cairo text-base font-bold text-white">
              {displayName}
            </h3>
            {ar && cat.nameAr && (
              <p className="font-inter text-xs mt-0.5" style={{ color: '#9a9a9e' }}>{cat.name}</p>
            )}
            {cat.productCount !== undefined && (
              <span className="badge badge-gold mt-2">
                {cat.productCount} {ar ? 'قطعة' : 'parts'}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
