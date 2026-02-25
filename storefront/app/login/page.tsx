'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { store } from '@/lib/store'
import { useAuth } from '@/lib/auth-store'
import { useLang } from '@/providers/LangProvider'
import { parseConvexError, AuthenticationError } from '@mantaray-digital/store-sdk'

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p className="font-cairo text-xs mt-1.5 flex items-center gap-1.5" style={{ color: '#ef4444' }}>
      <i className="fa-solid fa-circle-exclamation shrink-0" />
      {msg}
    </p>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const setCustomerId = useAuth((s) => s.setCustomerId)
  const { t, lang } = useLang()
  const ar = lang === 'ar'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors]     = useState<{ email?: string; password?: string; general?: string }>({})

  function clearErr(field: keyof typeof errors) {
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const errs: typeof errors = {}
    if (!email.trim())
      errs.email = ar ? 'يرجى ادخال البريد الإلكتروني' : 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = ar ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email address'
    if (!password)
      errs.password = ar ? 'يرجى ادخال كلمة المرور' : 'Password is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setErrors({})
    try {
      const result = await store.customer.login(email, password)
      setCustomerId(result.customerId as string)
      toast.success(ar ? 'مرحباً بك!' : 'Welcome back!')
      router.push('/profile')
    } catch (err: unknown) {
      const parsed = parseConvexError(err instanceof Error ? err : new Error(String(err)))
      if (parsed instanceof AuthenticationError) {
        setErrors({ password: ar ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Incorrect email or password' })
      } else {
        setErrors({ general: ar ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong, please try again' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4" style={{ background: '#1c1c1e' }}>
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <span className="font-inter font-black text-2xl text-white">
              Auto<span style={{ color: '#c9a96e' }}>Parts</span>
              <span className="font-mono text-sm ms-1" style={{ color: '#c9a96e' }}>EG</span>
            </span>
          </Link>
          <h1 className="font-cairo text-3xl font-black text-white mt-4 mb-1">{t.auth.loginTitle}</h1>
          <p className="font-cairo text-sm" style={{ color: '#9a9a9e' }}>{t.auth.loginSubtitle}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl p-8 space-y-5"
          style={{ background: '#2a2a2e', border: '1px solid #333338' }}
        >
          {errors.general && (
            <div className="rounded-lg px-4 py-3 flex items-center gap-2 font-cairo text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
              <i className="fa-solid fa-triangle-exclamation shrink-0" />
              {errors.general}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="font-cairo text-sm block mb-2" style={{ color: '#9a9a9e' }}>{t.auth.email}</label>
            <div className="relative">
              <input
                type="email"
                className="input-dark w-full ps-10"
                style={errors.email ? { borderColor: '#ef4444' } : {}}
                placeholder="you@example.com"
                dir="ltr"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearErr('email') }}
                autoComplete="email"
              />
              <i
                className="fa-solid fa-envelope absolute top-1/2 -translate-y-1/2 start-3 text-sm pointer-events-none"
                style={{ color: errors.email ? '#ef4444' : '#9a9a9e' }}
              />
            </div>
            <FieldError msg={errors.email} />
          </div>

          {/* Password */}
          <div>
            <label className="font-cairo text-sm block mb-2" style={{ color: '#9a9a9e' }}>{t.auth.password}</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="input-dark w-full ps-10"
                style={errors.password ? { borderColor: '#ef4444' } : {}}
                placeholder="••••••••"
                dir="ltr"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearErr('password') }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute top-1/2 -translate-y-1/2 start-3"
                style={{ color: errors.password ? '#ef4444' : '#9a9a9e' }}
              >
                <i className={`fa-solid ${showPass ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
              </button>
            </div>
            <FieldError msg={errors.password} />
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full py-4 text-base mt-2 disabled:opacity-60">
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin" /> {t.auth.loggingIn}</>
              : <><i className="fa-solid fa-right-to-bracket" /> {t.auth.loginBtn}</>
            }
          </button>
        </form>

        <p className="text-center font-cairo text-sm mt-6" style={{ color: '#9a9a9e' }}>
          {t.auth.noAccount}{' '}
          <Link href="/signup" style={{ color: '#c9a96e' }} className="font-bold hover:underline">{t.auth.createAccount}</Link>
        </p>
      </div>
    </div>
  )
}
