import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import heroArt from '@/assets/hero.png'
import { BrandLogo } from '@/components/BrandLogo'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '../../context/AuthProvider'
import { signUpUser } from './signup/fetching'

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  companyName: z.string().min(1, 'Company name is required'),
  companyAddress: z.string().min(1, 'Company Address is required'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/\d/, 'Password must include a number')
    .regex(/[^A-Za-z0-9]/, 'Password must include a special character'),
})

type SignupFields = z.infer<typeof signupSchema>

function AssistantWindow() {
  return (
    <Card className="w-full max-w-lg border-border/70 bg-card/80 shadow-[0_28px_70px_rgba(70,53,53,0.14)] backdrop-blur-xl">
      <CardContent className="grid gap-5 p-6">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF6058]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28CA41]" />
          <BrandLogo size="sm" showWordmark={false} />
          <span className="font-semibold text-foreground">DokuMind onboarding</span>
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
            Set up a secure company workspace
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Create your company, invite the right people, and keep every
            document grounded in tenant-scoped knowledge.
          </p>
        </div>
        <div className="grid gap-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-4 py-3">
            <span>Company setup</span>
            <span className="font-medium text-foreground">Guided</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-4 py-3">
            <span>Access control</span>
            <span className="font-medium text-foreground">Role-based</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-4 py-3">
            <span>Knowledge assistant</span>
            <span className="font-medium text-foreground">Ready</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Signup() {
  const navigate = useNavigate()
  const { getRolePath, setAuth } = useAuth()
  const [formValues, setFormValues] = useState<SignupFields>({
    firstName: '',
    lastName: '',
    companyName: '',
    companyAddress: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignupFields, string>>
  >({})

  const passwordChecks = [
    {
      id: 'length',
      label: 'At least 8 characters',
      valid: formValues.password.length >= 8,
    },
    {
      id: 'lowercase',
      label: 'One lowercase letter',
      valid: /[a-z]/.test(formValues.password),
    },
    {
      id: 'uppercase',
      label: 'One uppercase letter',
      valid: /[A-Z]/.test(formValues.password),
    },
    {
      id: 'number',
      label: 'One number',
      valid: /\d/.test(formValues.password),
    },
    {
      id: 'symbol',
      label: 'One special character',
      valid: /[^A-Za-z0-9]/.test(formValues.password),
    },
  ]

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof SignupFields]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = signupSchema.safeParse(formValues)

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      setErrors({
        firstName: fieldErrors.firstName?.[0],
        lastName: fieldErrors.lastName?.[0],
        companyName: fieldErrors.companyName?.[0],
        companyAddress: fieldErrors.companyAddress?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      })
      return
    }

    setErrors({})
    try {
      const authData = await signUpUser({
        first_name: result.data.firstName,
        last_name: result.data.lastName,
        company_name: result.data.companyName,
        company_address: result.data.companyAddress,
        email: result.data.email,
        password: result.data.password,
      })
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
          <div className="w-full max-w-2xl">
            <BrandLogo size="lg" labelClassName="text-xl" subtitle="Create your company workspace" subtitleClassName="text-sm" />

            <div className="mt-10 grid gap-4">
              <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
                Create your workspace
              </p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Create your DokuMind account
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">
                Bring your team in, connect your knowledge base, and keep every
                answer verifiable from day one.
              </p>
            </div>

            <Card className="mt-10 border-border/70 bg-card/80 shadow-[0_20px_50px_rgba(70,53,53,0.10)] backdrop-blur-xl">
              <CardContent className="p-6 sm:p-8">
                <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground"
                    htmlFor="firstName"
                  >
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formValues.firstName}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-border/70 bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                    placeholder="Amina"
                    autoComplete="given-name"
                    aria-invalid={Boolean(errors.firstName)}
                    aria-describedby={
                      errors.firstName ? 'first-name-error' : undefined
                    }
                  />
                  {errors.firstName ? (
                    <p id="first-name-error" className="text-xs text-destructive">
                      {errors.firstName}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground"
                    htmlFor="lastName"
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formValues.lastName}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-border/70 bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                    placeholder="El Idrissi"
                    autoComplete="family-name"
                    aria-invalid={Boolean(errors.lastName)}
                    aria-describedby={
                      errors.lastName ? 'last-name-error' : undefined
                    }
                  />
                  {errors.lastName ? (
                    <p id="last-name-error" className="text-xs text-destructive">
                      {errors.lastName}
                    </p>
                  ) : null}
                </div>
              </div>

            <div className="space-y-2">
              <label
                className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground"
                htmlFor="companyName"
              >
                Company name
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={formValues.companyName}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-border/70 bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                placeholder="DokuMind Labs"
                autoComplete="organization"
                aria-invalid={Boolean(errors.companyName)}
                aria-describedby={
                  errors.companyName ? 'company-name-error' : undefined
                }
              />
              {errors.companyName ? (
                <p id="company-name-error" className="text-xs text-destructive">
                  {errors.companyName}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground"
                htmlFor="companyAddress"
              >
                Company address
              </label>
              <input
                id="companyAddress"
                name="companyAddress"
                type="text"
                value={formValues.companyAddress}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-border/70 bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                placeholder="12 Rue Atlas, Rabat"
                autoComplete="street-address"
                aria-invalid={Boolean(errors.companyAddress)}
                aria-describedby={
                  errors.companyAddress ? 'company-address-error' : undefined
                }
              />
              {errors.companyAddress ? (
                <p
                  id="company-address-error"
                  className="text-xs text-destructive"
                >
                  {errors.companyAddress}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
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

            <div className="space-y-2">
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
                placeholder="Create a password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters.
              </p>
              <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                {passwordChecks.map((check) => (
                  <div key={check.id} className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        check.valid ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                    <span
                      className={check.valid ? 'text-foreground' : 'text-muted-foreground'}
                    >
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
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
              Create account
            </button>

            <div className="flex flex-col gap-3 border-t border-border/60 pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>Already have an account?</span>
              <Link
                to="/auth/login"
                className="font-semibold text-primary transition hover:text-secondary"
              >
                Sign in
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
            <AssistantWindow />
          </div>
        </section>
      </div>
    </div>
  )
}

export default Signup
