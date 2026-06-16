import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import heroArt from '@/assets/hero.png'
import { BrandLogo } from '@/components/BrandLogo'
import { Card, CardContent } from '@/components/ui/card'
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

function SecureWorkspaceWindow() {
  return (
    <Card className="w-full max-w-lg border-border/70 bg-card/80 shadow-[0_28px_70px_rgba(70,53,53,0.14)] backdrop-blur-xl">
      <CardContent className="grid gap-5 p-6">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF6058]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28CA41]" />
          <BrandLogo size="sm" showWordmark={false} />
          <span className="font-semibold text-foreground">DokuMind workspace</span>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
          <img
            src={heroArt}
            alt=""
            aria-hidden="true"
            className="h-44 w-full object-cover"
          />
        </div>
        <div className="grid gap-3">
          <p className="text-sm font-semibold tracking-tight text-foreground">
            Secure access, cleaner review, faster work
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Sign in to your company workspace to manage documents, users, and
            grounded chat in one place.
          </p>
        </div>
        <div className="grid gap-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-4 py-3">
            <span>Tenant isolation</span>
            <span className="font-medium text-foreground">Enforced</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-4 py-3">
            <span>Document workflow</span>
            <span className="font-medium text-foreground">Ready</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-4 py-3">
            <span>Grounded chat</span>
            <span className="font-medium text-foreground">Streaming</span>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <div className="min-h-screen text-foreground">
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1.02fr_0.98fr]">
        <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-xl">
            <BrandLogo size="lg" labelClassName="text-xl" subtitle="Secure enterprise workspace" subtitleClassName="text-sm" />

            <div className="mt-10 grid gap-4">
              <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
                Start your journey
              </p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Sign in to DokuMind
              </h1>
              <p className="max-w-lg text-base leading-7 text-muted-foreground">
                Access your company workspace, review documents, and keep
                grounded answers flowing without losing tenant isolation.
              </p>
            </div>

            <Card className="mt-10 border-border/70 bg-card/80 shadow-[0_20px_50px_rgba(70,53,53,0.10)] backdrop-blur-xl">
              <CardContent className="p-6 sm:p-8">
                <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
                  <div className="grid gap-2">
                    <label
                      className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formValues.email}
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border border-border/70 bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                      placeholder="you@company.com"
                      autoComplete="email"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email ? (
                      <p id="email-error" className="text-xs text-destructive">
                        {errors.email}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <label
                      className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground"
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
                      className="h-11 w-full rounded-xl border border-border/70 bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={errors.password ? 'password-error' : undefined}
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum 8 characters.
                    </p>
                    {errors.password ? (
                      <p id="password-error" className="text-xs text-destructive">
                        {errors.password}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    className="mt-1 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_rgba(157,116,116,0.25)] transition hover:bg-primary/90"
                  >
                    Sign in
                  </button>

                  <div className="flex flex-col gap-3 border-t border-border/60 pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <span>New to DokuMind?</span>
                    <Link
                      to="/auth/signup"
                      className="font-semibold text-primary transition hover:text-secondary"
                    >
                      Create an account
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="relative hidden overflow-hidden border-l border-border/60 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(157,116,116,0.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(129,91,91,0.12),transparent_26%),linear-gradient(140deg,#f7ecd9_0%,#ead7d0_42%,#d7bdbb_100%)]" />
          <div className="absolute inset-0 opacity-45 mix-blend-soft-light">
            <img src={heroArt} alt="" aria-hidden="true" className="h-full w-full object-cover object-center" />
          </div>
          <div className="relative flex h-full items-center justify-center p-12">
            <SecureWorkspaceWindow />
          </div>
        </section>
      </div>
    </div>
  )
}

export default Login
