import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      className="border-t py-12"
      style={{ background: '#2a2a2e', borderColor: '#333338' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-cairo text-xl font-bold mb-4" style={{ color: '#c9a96e' }}>
              AutoParts EG
            </h3>
            <p className="font-cairo text-sm leading-relaxed" style={{ color: '#9a9a9e' }}>
              متجر متخصص في قطع غيار مرسيدس بنز الاصلية في مصر. ارقام OEM حقيقية واسعار منافسة.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-cairo font-bold mb-4 text-white">روابط سريعة</h4>
            <div className="flex flex-col gap-2">
              <Link href="/catalog" className="font-cairo text-sm transition-colors hover:text-gold" style={{ color: '#9a9a9e' }}>
                الكتالوج
              </Link>
              <Link href="/cart" className="font-cairo text-sm transition-colors hover:text-gold" style={{ color: '#9a9a9e' }}>
                السلة
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-cairo font-bold mb-4 text-white">تواصل معنا</h4>
            <div className="flex flex-col gap-2 font-cairo text-sm" style={{ color: '#9a9a9e' }}>
              <span>
                <i className="fa-solid fa-phone ml-2" style={{ color: '#c9a96e' }} />
                01234567890
              </span>
              <span>
                <i className="fa-brands fa-whatsapp ml-2" style={{ color: '#c9a96e' }} />
                01234567890
              </span>
              <span>
                <i className="fa-solid fa-envelope ml-2" style={{ color: '#c9a96e' }} />
                info@autoparts-eg.com
              </span>
            </div>
          </div>
        </div>

        <div
          className="border-t mt-10 pt-6 text-center text-xs font-inter"
          style={{ borderColor: '#333338', color: '#9a9a9e' }}
        >
          AutoParts EG &copy; {new Date().getFullYear()} — All rights reserved
        </div>
      </div>
    </footer>
  )
}
