'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/cart-store'
import { useAuth } from '@/lib/auth-store'
import { useLang } from '@/providers/LangProvider'

export default function Navbar() {
  const pathname   = usePathname()
  const totalItems = useCart((s) => s.totalItems())
  const customerId = useAuth((s) => s.customerId)
  const { t, lang, toggleLang } = useLang()

  const linkClass = (href: string) =>
    `font-cairo font-semibold transition-colors text-sm ${
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
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <i className="fa-solid fa-gear text-xl" style={{ color: '#c9a96e' }} />
          <span className="font-inter font-black text-xl text-white">
            Auto<span style={{ color: '#c9a96e' }}>Parts</span>
            <span className="font-mono text-xs ms-1" style={{ color: 'rgba(201,169,110,0.7)' }}>EG</span>
          </span>
        </Link>

        {/* Right side controls */}
        <div className="flex items-center gap-5">
          <Link href="/" className={linkClass('/')}>{t.nav.home}</Link>
          <Link href="/catalog" className={linkClass('/catalog')}>{t.nav.catalog}</Link>

          {/* Lang toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer"
            style={{
              borderColor: 'rgba(201,169,110,0.3)',
              color: '#c9a96e',
              background: 'rgba(201,169,110,0.06)',
            }}
            title={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
          >
            <i className="fa-solid fa-globe text-xs" />
            {lang === 'ar' ? 'EN' : 'AR'}
          </button>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative transition-colors"
            style={{ color: pathname === '/cart' ? '#c9a96e' : '#9a9a9e' }}
          >
            <i className="fa-solid fa-cart-shopping text-lg" />
            {totalItems > 0 && (
              <span
                className="absolute -top-2 -right-2 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: '#c9a96e', color: '#1c1c1e' }}
              >
                {totalItems}
              </span>
            )}
          </Link>

          {/* Auth */}
          {customerId ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 transition-colors"
              style={{ color: pathname === '/profile' ? '#c9a96e' : '#9a9a9e' }}
              title={t.nav.myAccount}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: 'rgba(201,169,110,0.15)', color: '#c9a96e', border: '1.5px solid rgba(201,169,110,0.3)' }}
              >
                <i className="fa-solid fa-user text-xs" />
              </div>
              <span
                className="font-cairo text-sm font-semibold hidden md:block"
                style={{ color: pathname === '/profile' ? '#c9a96e' : '#9a9a9e' }}
              >
                {t.nav.myAccount}
              </span>
            </Link>
          ) : (
            <Link href="/login" className="btn-gold py-2 px-4 text-sm">
              <i className="fa-solid fa-right-to-bracket" />
              {t.nav.login}
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
