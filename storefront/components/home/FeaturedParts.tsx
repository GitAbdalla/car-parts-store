import PartCard from '@/components/ui/PartCard'
import { store } from '@/lib/store'

export default async function FeaturedParts() {
  const { products } = await store.products.list({
    sortBy: 'price_desc',
    inStockOnly: true,
  })

  const featured = products.slice(0, 6)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {featured.map((p) => (
        <PartCard key={p._id} product={p} />
      ))}
    </div>
  )
}
