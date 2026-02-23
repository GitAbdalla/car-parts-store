import Link from 'next/link'
import { store } from '@/lib/store'

export default async function CategoryGrid() {
  const categories = await store.categories.list()

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {categories.map((cat) => {
        const icon = (cat as any).icon as string | undefined
        return (
          <Link
            key={cat._id}
            href={`/catalog?categoryId=${cat._id}`}
            className="card p-6 text-center block hover:scale-105 transition-transform"
          >
            {icon ? (
              <i className={`fa-solid ${icon} text-3xl mb-3`} style={{ color: '#c9a96e' }} />
            ) : (
              <i className="fa-solid fa-gear text-3xl mb-3" style={{ color: '#c9a96e' }} />
            )}
            <h3 className="font-cairo text-base font-bold text-white">
              {cat.nameAr ?? cat.name}
            </h3>
            <p className="font-inter text-xs mt-1" style={{ color: '#9a9a9e' }}>{cat.name}</p>
            <span className="badge badge-gold mt-2">
              {cat.productCount} قطعة
            </span>
          </Link>
        )
      })}
    </div>
  )
}
