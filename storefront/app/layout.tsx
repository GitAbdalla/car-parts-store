import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { StoreProvider } from '@/providers/StoreProvider'
import { LangProvider } from '@/providers/LangProvider'

export const metadata: Metadata = {
  title: 'AutoParts EG — قطع غيار اصلية',
  description: 'قطع غيار مرسيدس بنز الاصلية في مصر — ارقام OEM حقيقية واسعار منافسة مع توصيل للباب',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body suppressHydrationWarning>
        <LangProvider>
          <StoreProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </StoreProvider>
        </LangProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'linear-gradient(135deg, #c9a96e, #b8944f)',
              color: '#1c1c1e',
              fontFamily: 'Cairo, sans-serif',
              fontWeight: 700,
              border: 'none',
            },
          }}
        />
      </body>
    </html>
  )
}
