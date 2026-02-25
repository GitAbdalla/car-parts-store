import { Suspense } from 'react'
import CarSelector from '@/components/home/CarSelector'
import CategoryGrid from '@/components/home/CategoryGrid'
import FeaturedParts from '@/components/home/FeaturedParts'
import HomeLayout from '@/components/home/HomeLayout'

const GridSkeleton = ({ cols, h }: { cols: string; h: string }) => (
  <div className={`grid ${cols} gap-4 animate-pulse`}>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className={`rounded-xl ${h}`} style={{ background: '#333338' }} />
    ))}
  </div>
)

export default function HomePage() {
  return (
    <HomeLayout
      carSelector={<CarSelector />}
      categoryGrid={<CategoryGrid />}
      featuredParts={
        <Suspense fallback={<GridSkeleton cols="grid-cols-1 md:grid-cols-3" h="h-64" />}>
          <FeaturedParts />
        </Suspense>
      }
    />
  )
}
