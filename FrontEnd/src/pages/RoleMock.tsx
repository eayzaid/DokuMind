import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider'

function RoleMock() {
  const { role } = useAuth()

  return (
    <div className="min-h-screen bg-doku-cream text-doku-chocolate">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-doku-dusty/70">
            Auth status
          </p>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Current role
          </h1>
        </div>
        <div className="w-full rounded-2xl border border-doku-dusty/30 bg-white p-6 shadow-card">
          <p className="text-xs uppercase tracking-[0.2em] text-doku-dusty/70">
            Role
          </p>
          <p className="mt-3 text-2xl font-semibold text-doku-chocolate">
            {role ?? 'Not signed in'}
          </p>
        </div>
        <Link
          to="/auth/login"
          className="text-sm font-semibold text-doku-rose hover:text-doku-dusty"
        >
          Back to login
        </Link>
      </div>
    </div>
  )
}

export default RoleMock
