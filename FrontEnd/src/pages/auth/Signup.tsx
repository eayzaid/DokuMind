import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
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

const panelBackground = {
  backgroundImage:
    'radial-gradient(circle at 15% 20%, rgba(255, 248, 234, 0.9), transparent 40%), radial-gradient(circle at 75% 15%, rgba(158, 118, 118, 0.45), transparent 45%), radial-gradient(circle at 65% 75%, rgba(129, 91, 91, 0.35), transparent 50%), linear-gradient(140deg, #f7edd9 0%, #e9d3d3 45%, #d2b6b6 100%)',
}

function AssistantWindow() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white/70 p-6 shadow-[0_20px_50px_rgba(89,69,69,0.15)] backdrop-blur">
      <div className="flex items-center gap-2 text-xs text-doku-chocolate/70">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF6058]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28CA41]" />
        <span className="ml-2 font-semibold">DokuMind Assistant</span>
      </div>
      <div className="mt-4 space-y-3 text-xs">
        <div className="ml-auto max-w-[75%] rounded-xl bg-doku-rose px-3 py-2 text-doku-cream">
          Busy day to answer your junior, isn't ?
        </div>
        <div className="max-w-[75%] rounded-xl border border-doku-dusty/30 bg-white px-3 py-2 text-doku-chocolate">
          I can summarize the policy and cite the source in seconds.
        </div>
      </div>
    </div>
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
    <div className="min-h-screen bg-doku-cream text-doku-chocolate">
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        <section className="flex flex-col items-center justify-center px-6 py-12 text-center sm:px-10 lg:items-start lg:px-14 lg:text-left">
          <div className="flex w-full items-center justify-center gap-3 text-doku-chocolate lg:justify-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-doku-dusty/30 bg-white text-sm font-semibold">
              DM
            </div>
            <div className="text-base font-semibold tracking-wide">DokuMind</div>
          </div>

          <div className="mt-10 w-full max-w-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-doku-dusty/70">
              Create your workspace
            </p>
            <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
              Create your DokuMind account
            </h1>
            <p className="mt-3 text-sm text-doku-chocolate/70">
              Bring your team in, connect your knowledge base, and keep every
              answer verifiable.
            </p>
          </div>

          <form
            className="mt-8 w-full max-w-xl space-y-5"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-doku-dusty"
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
                  className="w-full rounded-md border border-doku-dusty/30 bg-white px-4 py-3 text-sm text-doku-chocolate placeholder:text-doku-chocolate/40 focus:border-doku-rose focus:outline-none focus:ring-2 focus:ring-doku-rose/20"
                  placeholder="Amina"
                  autoComplete="given-name"
                  aria-invalid={Boolean(errors.firstName)}
                  aria-describedby={
                    errors.firstName ? 'first-name-error' : undefined
                  }
                />
                {errors.firstName ? (
                  <p id="first-name-error" className="text-xs text-doku-rose">
                    {errors.firstName}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-doku-dusty"
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
                  className="w-full rounded-md border border-doku-dusty/30 bg-white px-4 py-3 text-sm text-doku-chocolate placeholder:text-doku-chocolate/40 focus:border-doku-rose focus:outline-none focus:ring-2 focus:ring-doku-rose/20"
                  placeholder="El Idrissi"
                  autoComplete="family-name"
                  aria-invalid={Boolean(errors.lastName)}
                  aria-describedby={
                    errors.lastName ? 'last-name-error' : undefined
                  }
                />
                {errors.lastName ? (
                  <p id="last-name-error" className="text-xs text-doku-rose">
                    {errors.lastName}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="text-xs font-semibold uppercase tracking-[0.2em] text-doku-dusty"
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
                className="w-full rounded-md border border-doku-dusty/30 bg-white px-4 py-3 text-sm text-doku-chocolate placeholder:text-doku-chocolate/40 focus:border-doku-rose focus:outline-none focus:ring-2 focus:ring-doku-rose/20"
                placeholder="DokuMind Labs"
                autoComplete="organization"
                aria-invalid={Boolean(errors.companyName)}
                aria-describedby={
                  errors.companyName ? 'company-name-error' : undefined
                }
              />
              {errors.companyName ? (
                <p id="company-name-error" className="text-xs text-doku-rose">
                  {errors.companyName}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                className="text-xs font-semibold uppercase tracking-[0.2em] text-doku-dusty"
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
                className="w-full rounded-md border border-doku-dusty/30 bg-white px-4 py-3 text-sm text-doku-chocolate placeholder:text-doku-chocolate/40 focus:border-doku-rose focus:outline-none focus:ring-2 focus:ring-doku-rose/20"
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
                  className="text-xs text-doku-rose"
                >
                  {errors.companyAddress}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                className="text-xs font-semibold uppercase tracking-[0.2em] text-doku-dusty"
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
                className="w-full rounded-md border border-doku-dusty/30 bg-white px-4 py-3 text-sm text-doku-chocolate placeholder:text-doku-chocolate/40 focus:border-doku-rose focus:outline-none focus:ring-2 focus:ring-doku-rose/20"
                placeholder="you@company.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
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
                placeholder="Create a password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <p className="text-xs text-doku-chocolate/55">
                Minimum 8 characters.
              </p>
              <div className="grid gap-2 text-xs text-doku-chocolate/60 sm:grid-cols-2">
                {passwordChecks.map((check) => (
                  <div key={check.id} className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        check.valid ? 'bg-doku-rose' : 'bg-doku-dusty/30'
                      }`}
                    />
                    <span
                      className={
                        check.valid
                          ? 'text-doku-chocolate'
                          : 'text-doku-chocolate/60'
                      }
                    >
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
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
              Create account
            </button>

            <div className="flex flex-col items-center gap-2 text-xs text-doku-chocolate/60 sm:flex-row sm:justify-between">
              <span>Already have an account?</span>
              <Link
                to="/auth/login"
                className="font-semibold text-doku-rose hover:text-doku-dusty"
              >
                Sign in
              </Link>
            </div>
          </form>
        </section>

        <section className="relative hidden lg:sticky lg:top-0 lg:block lg:h-screen">
          <div className="absolute inset-0" style={panelBackground} />
          <div className="relative flex h-full items-center justify-center p-10">
            <AssistantWindow />
          </div>
        </section>
      </div>
    </div>
  )
}

export default Signup
