'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/cart-store'

export default function Navbar() {
  const pathname = usePathname()
  const totalItems = useCart((s) => s.totalItems())

  const linkClass = (href: string) =>
    `font-cairo font-semibold transition-colors ${
      pathname === href
        ? 'text-gold border-b-2 border-gold pb-1'
        : 'text-muted hover:text-gold'
    }`

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{ background: '#2a2a2e', borderColor: '#333338' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <i className="fa-solid fa-gear text-2xl" style={{ color: '#c9a96e' }} />
          <span className="font-cairo text-2xl font-bold text-white">
            AutoParts <span style={{ color: '#c9a96e' }}>EG</span>
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className={linkClass('/')}>
            الرئيسية
          </Link>
          <Link href="/catalog" className={linkClass('/catalog')}>
            الكتالوج
          </Link>

          {/* Cart */}
          <Link href="/cart" className="relative transition-colors text-muted hover:text-gold"
            style={{ color: pathname === '/cart' ? '#c9a96e' : undefined }}>
            <i className="fa-solid fa-cart-shopping text-xl" />
            {totalItems > 0 && (
              <span
                className="absolute -top-2 -right-2 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: '#c9a96e', color: '#1c1c1e' }}
              >
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}
