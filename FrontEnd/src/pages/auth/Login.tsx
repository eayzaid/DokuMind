import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../../context/AuthProvider'
import { loginUser } from './login/fetching'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const loginSchema = z.object({
  email: z
    .string()
    .regex(emailRegex, 'Enter a valid email address.')
    .max(320, 'Email must be under 320 characters.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.'),
})

type LoginFields = z.infer<typeof loginSchema>

const panelBackground = {
  backgroundImage:
    'radial-gradient(circle at 15% 20%, rgba(255, 248, 234, 0.9), transparent 40%), radial-gradient(circle at 75% 15%, rgba(158, 118, 118, 0.45), transparent 45%), radial-gradient(circle at 65% 75%, rgba(129, 91, 91, 0.35), transparent 50%), linear-gradient(140deg, #f7edd9 0%, #e9d3d3 45%, #d2b6b6 100%)',
}

function SecureWorkspaceWindow() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/60 bg-white/55 p-6 shadow-[0_24px_60px_rgba(89,69,69,0.18)] backdrop-blur">
      <div className="flex items-center gap-2 text-xs text-doku-chocolate/70">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF6058]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28CA41]" />
        <span className="ml-2 font-semibold">DokuMind Enterprise Portal</span>
      </div>
      <div className="mt-4 rounded-xl border border-white/70 bg-white/80 p-5 shadow-sm">
        <p className="text-sm font-semibold text-doku-chocolate">
          DokuMind Enterprise Portal
        </p>
        <p className="mt-2 text-xs text-doku-chocolate/65">
          Keep sensitive knowledge isolated, verified, and ready for your teams.
        </p>
        <div className="mt-4 grid gap-3 text-xs text-doku-chocolate/70">
          <div className="flex items-center justify-between rounded-md border border-doku-dusty/20 bg-doku-cream px-3 py-2">
            <span>Workspace encryption</span>
            <span className="font-semibold text-doku-rose">Active</span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-doku-dusty/20 bg-white px-3 py-2">
            <span>Role-based access</span>
            <span className="font-semibold text-doku-dusty">Enforced</span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-doku-dusty/20 bg-white px-3 py-2">
            <span>Audit snapshots</span>
            <span className="font-semibold text-doku-dusty">Daily</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Login() {
  const navigate = useNavigate()
  const { getRolePath, setAuth } = useAuth()
  const [formValues, setFormValues] = useState<LoginFields>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFields, string>>
  >({})

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof LoginFields]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = loginSchema.safeParse(formValues)

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      })
      return
    }

    setErrors({})
    try {
      const authData = await loginUser(result.data)
      setAuth(authData)
      navigate(getRolePath(authData.role), { replace: true })
    } catch {
      return
    }
  }

  return (
    <div className="min-h-screen bg-doku-cream text-doku-chocolate">
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        <section className="flex flex-col items-center justify-center px-6 py-12 text-center sm:px-10 lg:items-start lg:px-14 lg:text-left">
          <div className="flex w-full items-center justify-center gap-3 text-doku-chocolate lg:justify-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-doku-dusty/30 bg-white text-sm font-semibold">
              DM
            </div>
            <div className="text-base font-semibold tracking-wide">DokuMind</div>
          </div>

          <div className="mt-10 w-full max-w-md">
            <p className="text-xs uppercase tracking-[0.3em] text-doku-dusty/70">
              Start your journey
            </p>
            <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
              Sign in to DokuMind
            </h1>
            <p className="mt-3 text-sm text-doku-chocolate/70">
              Access your secure workspace and keep knowledge flowing across
              your team.
            </p>
          </div>

          <form
            className="mt-8 w-full max-w-md space-y-5"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="space-y-2">
              <label
                className="text-xs font-semibold uppercase tracking-[0.2em] text-doku-dusty"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formValues.email}
                  onChange={handleChange}
                  className="w-full rounded-md border border-doku-dusty/30 bg-white px-4 py-3 text-sm text-doku-chocolate placeholder:text-doku-chocolate/40 focus:border-doku-rose focus:outline-none focus:ring-2 focus:ring-doku-rose/20"
                  placeholder="you@company.com"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>
              {errors.email ? (
                <p id="email-error" className="text-xs text-doku-rose">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                className="text-xs font-semibold uppercase tracking-[0.2em] text-doku-dusty"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formValues.password}
                onChange={handleChange}
                className="w-full rounded-md border border-doku-dusty/30 bg-white px-4 py-3 text-sm text-doku-chocolate placeholder:text-doku-chocolate/40 focus:border-doku-rose focus:outline-none focus:ring-2 focus:ring-doku-rose/20"
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <p className="text-xs text-doku-chocolate/55">
                Minimum 8 characters.
              </p>
              {errors.password ? (
                <p id="password-error" className="text-xs text-doku-rose">
                  {errors.password}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-doku-rose px-4 py-3 text-sm font-semibold text-doku-cream shadow-card transition duration-200 hover:bg-doku-dusty"
            >
              Sign in
            </button>

            <div className="flex flex-col items-center gap-2 text-xs text-doku-chocolate/60 sm:flex-row sm:justify-between">
              <span>New to DokuMind?</span>
              <Link
                to="/auth/signup"
                className="font-semibold text-doku-rose hover:text-doku-dusty"
              >
                Create an account
              </Link>
            </div>
          </form>
        </section>

        <section className="relative hidden lg:sticky lg:top-0 lg:block lg:h-screen">
          <div className="absolute inset-0" style={panelBackground} />
          <div className="relative flex h-full items-center justify-center p-10">
            <SecureWorkspaceWindow />
          </div>
        </section>
      </div>
    </div>
  )
}

export default Login
