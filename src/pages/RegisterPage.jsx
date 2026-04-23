import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Field } from '../components/atoms/Field'
import { Button } from '../components/atoms/Button'
import { register } from '../services/authService'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      navigate('/onboarding')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formContent = (
    <div className="w-full max-w-sm">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1 text-body-sm text-text-action hover:text-text-action-hover font-semibold mb-6 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Home
      </button>

      <div className="mb-8">
        <h1 className="text-heading-h3 font-bold text-text-headings mb-2">Create account</h1>
        
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field
          id="username"
          name="username"
          label="Username"
          placeholder="Choose a username"
          required
          value={form.username}
          onChange={handleChange}
        />
        <Field
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="Enter your email"
          required
          value={form.email}
          onChange={handleChange}
        />
        <Field
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="At least 6 characters"
          required
          value={form.password}
          onChange={handleChange}
        />
        <Field
          id="confirm"
          name="confirm"
          type="password"
          label="Confirm password"
          placeholder="Repeat your password"
          required
          value={form.confirm}
          onChange={handleChange}
        />

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-md bg-surface-error border border-border-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-text-error shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-body-sm text-text-error">{error}</p>
          </div>
        )}

        <Button type="submit" fullWidth loading={loading} size="lg" className="mt-1">
          Create account
        </Button>
      </form>

      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-border-primary" />
        <span className="text-body-sm text-text-disabled">or</span>
        <div className="flex-1 h-px bg-border-primary" />
      </div>

      <p className="text-body-sm text-text-body text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-text-action font-semibold hover:text-text-action-hover">
          Sign in
        </Link>
      </p>
    </div>
  )

  return (
    <div className="min-h-screen flex">

      {/* ── Desktop ── */}

      {/* Left: form */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center px-8 bg-surface-page m-auto">
        {formContent}
      </div>

      {/* Right: branded panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface-action flex-col justify-between p-12">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-500 opacity-40" />
        <div className="absolute -bottom-32 -right-20 w-[28rem] h-[28rem] rounded-full bg-primary-600 opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary-300 opacity-10" />

        <div className="flex flex-col gap-8">
          <div className="relative z-10">
            <span className="text-heading-h5 font-bold text-neutral-white tracking-tight">EU Health</span>
          </div>
          <div className="relative z-10 flex flex-col gap-6">
            <h2 className="text-heading-h2 font-bold text-neutral-white leading-tight">
              Join the<br />community.
            </h2>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-body-sm text-primary-200">© 2026 EU Health & Fitness</p>
        </div>
      </div>

      {/* ── Mobile: vertical stack with overlapping card ── */}
      <div className="flex lg:hidden flex-col flex-1 bg-surface-page">

        {/* Top branded section */}
        <div className="relative overflow-hidden bg-surface-action px-8 pt-12 pb-28 flex flex-col gap-4">
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-primary-500 opacity-40" />
          <div className="absolute -bottom-20 -right-12 w-72 h-72 rounded-full bg-primary-600 opacity-50" />
          <div className="absolute top-1/2 right-8 w-40 h-40 rounded-full bg-primary-300 opacity-10" />

          <div className="relative z-10">
            <span className="text-heading-h6 font-bold text-neutral-white tracking-tight">EU Health</span>
          </div>
          <div className="relative z-10">
            <h2 className="text-heading-h4 font-bold text-neutral-white leading-tight">
              Join the community.
            </h2>
            <p className="text-body-md text-primary-100 mt-2">
              Your all-in-one fitness platform.
            </p>
          </div>
        </div>

        {/* Form card overlapping */}
        <div className="flex flex-col justify-center relative z-10 -mt-12 mx-4 bg-surface-primary rounded-2xl shadow-2xl px-6 pt-8 pb-10 flex flex-col items-center">
          {formContent}
        </div>

        <div className="pb-8" />
      </div>

    </div>
  )
}
