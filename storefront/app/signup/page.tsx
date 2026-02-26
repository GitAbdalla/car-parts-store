'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { store } from '@/lib/store'
import { useAuth } from '@/lib/auth-store'
import { useLang } from '@/providers/LangProvider'
import { parseConvexError, ValidationError } from '@mantaray-digital/store-sdk'

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p className="font-cairo text-xs mt-1.5 flex items-center gap-1.5" style={{ color: '#ef4444' }}>
      <i className="fa-solid fa-circle-exclamation shrink-0" />
      {msg}
    </p>
  )
}

type FormFields = { name: string; email: string; phone: string; password: string; confirmPassword: string }
type FormErrors = Partial<Record<keyof FormFields | 'general', string>>

export default function SignupPage() {
  const router = useRouter()
  const setCustomerId = useAuth((s) => s.setCustomerId)
  const { t, lang } = useLang()
  const ar = lang === 'ar'

  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm]         = useState<FormFields>({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [errors, setErrors]     = useState<FormErrors>({})

  function setField(field: keyof FormFields, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function validate(): boolean {
    const errs: FormErrors = {}
    if (!form.name.trim())
      errs.name = ar ? 'يرجى ادخال الاسم' : 'Name is required'
    if (!form.email.trim())
      errs.email = ar ? 'يرجى ادخال البريد الإلكتروني' : 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = ar ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email address'
    if (!form.phone.trim())
      errs.phone = ar ? 'يرجى ادخال رقم الموبايل' : 'Mobile number is required'
    else if (!/^01[0125]\d{8}$/.test(form.phone))
      errs.phone = ar ? 'يقبل أرقام 010/011/012/015 فقط' : 'Must be a valid Egyptian number (010/011/012/015)'
    if (!form.password)
      errs.password = ar ? 'يرجى ادخال كلمة المرور' : 'Password is required'
    else if (form.password.length < 8)
      errs.password = ar ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters'
    if (!form.confirmPassword)
      errs.confirmPassword = ar ? 'يرجى تأكيد كلمة المرور' : 'Please confirm your password'
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = ar ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setErrors({})
    try {
      const result = await store.customer.register({ name: form.name, email: form.email, phone: form.phone, password: form.password })
      setCustomerId(result.customerId as string)
      toast.success(ar ? 'تم انشاء حسابك بنجاح!' : 'Account created successfully!')
      router.push('/profile')
    } catch (err: unknown) {
      const parsed = parseConvexError(err instanceof Error ? err : new Error(String(err)))
      if (parsed instanceof ValidationError && parsed.message.toLowerCase().includes('exist')) {
        setErrors({ email: ar ? 'البريد الإلكتروني مسجل بالفعل' : 'This email is already registered' })
      } else {
        setErrors({ general: ar ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong, please try again' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10" style={{ background: '#1c1c1e' }}>
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-inter font-black text-2xl text-white">
              Auto<span style={{ color: '#c9a96e' }}>Parts</span>
              <span className="font-mono text-sm ms-1" style={{ color: '#c9a96e' }}>EG</span>
            </span>
          </Link>
          <h1 className="font-cairo text-3xl font-black text-white mt-4 mb-1">{t.auth.signupTitle}</h1>
          <p className="font-cairo text-sm" style={{ color: '#9a9a9e' }}>{t.auth.signupSubtitle}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl p-8 space-y-4"
          style={{ background: '#2a2a2e', border: '1px solid #333338' }}
        >
          {errors.general && (
            <div className="rounded-lg px-4 py-3 flex items-center gap-2 font-cairo text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
              <i className="fa-solid fa-triangle-exclamation shrink-0" />
              {errors.general}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="font-cairo text-sm block mb-2" style={{ color: '#9a9a9e' }}>{t.auth.fullName}</label>
            <div className="relative">
              <input
                type="text"
                className="input-dark w-full input-icon-r"
                style={errors.name ? { borderColor: '#ef4444' } : {}}
                placeholder={ar ? 'محمد احمد' : 'John Smith'}
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
              />
              <i
                className="fa-solid fa-user absolute top-1/2 -translate-y-1/2 right-3 text-sm pointer-events-none"
                style={{ color: errors.name ? '#ef4444' : '#9a9a9e' }}
              />
            </div>
            <FieldError msg={errors.name} />
          </div>

          {/* Email */}
          <div>
            <label className="font-cairo text-sm block mb-2" style={{ color: '#9a9a9e' }}>{t.auth.email}</label>
            <div className="relative">
              <input
                type="email"
                className="input-dark w-full input-icon-l"
                style={errors.email ? { borderColor: '#ef4444' } : {}}
                placeholder="you@example.com"
                dir="ltr"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                autoComplete="email"
              />
              <i
                className="fa-solid fa-envelope absolute top-1/2 -translate-y-1/2 left-3 text-sm pointer-events-none"
                style={{ color: errors.email ? '#ef4444' : '#9a9a9e' }}
              />
            </div>
            <FieldError msg={errors.email} />
          </div>

          {/* Phone */}
          <div>
            <label className="font-cairo text-sm block mb-2" style={{ color: '#9a9a9e' }}>{t.auth.phone}</label>
            <div className="relative">
              <input
                type="tel"
                className="input-dark w-full input-icon-l font-mono"
                style={errors.phone ? { borderColor: '#ef4444' } : {}}
                placeholder="01012345678"
                dir="ltr"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
              />
              <i
                className="fa-solid fa-phone absolute top-1/2 -translate-y-1/2 left-3 text-sm pointer-events-none"
                style={{ color: errors.phone ? '#ef4444' : '#9a9a9e' }}
              />
            </div>
            <FieldError msg={errors.phone} />
          </div>

          {/* Password */}
          <div>
            <label className="font-cairo text-sm block mb-2" style={{ color: '#9a9a9e' }}>{t.auth.password}</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="input-dark w-full input-icon-l"
                style={errors.password ? { borderColor: '#ef4444' } : {}}
                placeholder={ar ? '٨ أحرف على الأقل' : 'At least 8 characters'}
                dir="ltr"
                value={form.password}
                onChange={(e) => setField('password', e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute top-1/2 -translate-y-1/2 left-3"
                style={{ color: errors.password ? '#ef4444' : '#9a9a9e' }}
              >
                <i className={`fa-solid ${showPass ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
              </button>
            </div>
            <FieldError msg={errors.password} />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="font-cairo text-sm block mb-2" style={{ color: '#9a9a9e' }}>{t.auth.confirmPassword}</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="input-dark w-full input-icon-r"
                style={errors.confirmPassword ? { borderColor: '#ef4444' } : {}}
                placeholder={ar ? 'أعد كتابة كلمة المرور' : 'Re-enter your password'}
                dir="ltr"
                value={form.confirmPassword}
                onChange={(e) => setField('confirmPassword', e.target.value)}
                autoComplete="new-password"
              />
              {form.confirmPassword && (
                <i
                  className={`fa-solid ${form.password === form.confirmPassword ? 'fa-circle-check' : 'fa-circle-xmark'} absolute top-1/2 -translate-y-1/2 right-3 text-sm pointer-events-none`}
                  style={{ color: form.password === form.confirmPassword ? '#4ade80' : '#ef4444' }}
                />
              )}
            </div>
            <FieldError msg={errors.confirmPassword} />
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full py-4 text-base mt-2 disabled:opacity-60">
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin" /> {t.auth.signingUp}</>
              : <><i className="fa-solid fa-user-plus" /> {t.auth.signupBtn}</>
            }
          </button>
        </form>

        <p className="text-center font-cairo text-sm mt-6" style={{ color: '#9a9a9e' }}>
          {t.auth.haveAccount}{' '}
          <Link href="/login" style={{ color: '#c9a96e' }} className="font-bold hover:underline">{t.auth.loginLink}</Link>
        </p>
      </div>
    </div>
  )
}
