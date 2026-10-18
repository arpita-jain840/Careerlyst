import { useState } from 'react'

function Brand() {
  return (
    <a
      href="/"
      className="focus-ring inline-flex items-center gap-2.5"
      aria-label="Careerlyst home"
    >
      <span
        className="relative flex h-7 w-7 items-end gap-1"
        aria-hidden="true"
      >
        <span className="h-4 w-1.5 bg-forest" />
        <span className="h-6 w-1.5 bg-forest" />
        <span className="h-7 w-1.5 bg-ink" />
      </span>
      <span className="text-[1.2rem] font-bold tracking-[-0.04em] text-ink">
        Careerlyst
      </span>
    </a>
  )
}

function GoogleIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.9 6.1-15Z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20.4 20.4 0 0 0 24 44Z"
      />
      <path
        fill="#FBBC05"
        d="M12.6 27.6a12.2 12.2 0 0 1 0-7.2v-5.3H5.8a20.1 20.1 0 0 0 0 17.8l6.8-5.3Z"
      />
      <path
        fill="#EA4335"
        d="M24 12c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 5.9 29.5 4 24 4A20.4 20.4 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z"
      />
    </svg>
  )
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  visible,
  onToggle,
  autoComplete,
}) {
  const errorId = `${id}-error`

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`focus-ring w-full border bg-white px-4 py-3 pr-16 text-sm text-ink placeholder:text-slate-400 ${
            error ? 'border-red-400' : 'border-line'
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
          aria-pressed={visible}
          className="focus-ring absolute inset-y-0 right-3 my-auto h-fit text-xs font-semibold text-forest hover:text-forest-dark"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function AuthPage({ mode }) {
  const isSignup = mode === 'signup'
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    remember: false,
    acceptedTerms: false,
  })
  const [errors, setErrors] = useState({})
  const [visiblePasswords, setVisiblePasswords] = useState({
    password: false,
    confirmPassword: false,
  })
  const [notice, setNotice] = useState('')

  const updateValue = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setNotice('')
  }

  const validate = () => {
    const nextErrors = {}
    const email = values.email.trim()

    if (isSignup && !values.name.trim()) {
      nextErrors.name = 'Enter your full name.'
    }

    if (!email) {
      nextErrors.email = 'Enter your email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!values.password) {
      nextErrors.password = 'Enter your password.'
    } else if (values.password.length < 8) {
      nextErrors.password = 'Your password must be at least 8 characters.'
    }

    if (isSignup) {
      if (!values.confirmPassword) {
        nextErrors.confirmPassword = 'Confirm your password.'
      } else if (values.confirmPassword !== values.password) {
        nextErrors.confirmPassword = 'Passwords do not match.'
      }
      if (!values.acceptedTerms) {
        nextErrors.acceptedTerms = 'Please agree to the Terms and Conditions.'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setNotice('')

    if (validate()) {
      setNotice(
        'Authentication is not connected yet. Your details have not been sent or stored.'
      )
    }
  }

  const showIntegrationNotice = (message) => {
    setNotice(message)
  }

  const togglePassword = (field) => {
    setVisiblePasswords((current) => ({
      ...current,
      [field]: !current[field],
    }))
  }

  const emailErrorId = 'email-error'

  return (
    <div className="flex min-h-screen flex-col bg-mist text-ink">
      <header className="border-b border-line/70 bg-white">
        <div className="section-wrap flex min-h-[76px] items-center justify-between gap-4">
          <Brand />
          <a
            href={isSignup ? '/login' : '/signup'}
            className="focus-ring text-sm font-semibold text-forest transition-colors hover:text-forest-dark"
          >
            {isSignup ? 'Log in' : 'Create account'}
          </a>
        </div>
      </header>

      <main className="section-wrap flex flex-1 items-center justify-center py-10 sm:py-14">
        <section
          className="w-full max-w-[480px] border border-line bg-white px-6 py-8 sm:px-10 sm:py-10"
          aria-labelledby="auth-title"
        >
          <div className="mb-8 text-center">
            <p className="eyebrow mb-3">
              {isSignup ? 'Your next step starts here' : 'Welcome back'}
            </p>
            <h1
              id="auth-title"
              className="font-display text-4xl leading-tight tracking-[-0.045em] text-ink"
            >
              {isSignup ? 'Create your account' : 'Log in to Careerlyst'}
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
              {isSignup
                ? 'Build a clearer path to opportunities that fit you.'
                : 'Pick up where you left off on your career journey.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              showIntegrationNotice(
                'Google sign-in is not configured yet. No authentication was started.'
              )
            }
            className="focus-ring flex w-full items-center justify-center gap-3 border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition-colors hover:border-forest"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-4" aria-hidden="true">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[11px] font-semibold tracking-[0.14em] text-slate-400">
              OR
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              {isSignup && (
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-ink"
                  >
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={values.name}
                    onChange={(event) => updateValue('name', event.target.value)}
                    placeholder="Your full name"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    className={`focus-ring mt-2 w-full border bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-400 ${
                      errors.name ? 'border-red-400' : 'border-line'
                    }`}
                  />
                  {errors.name && (
                    <p
                      id="name-error"
                      className="mt-1.5 text-xs text-red-700"
                      role="alert"
                    >
                      {errors.name}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-ink"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(event) => updateValue('email', event.target.value)}
                  placeholder="you@example.com"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? emailErrorId : undefined}
                  className={`focus-ring mt-2 w-full border bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-400 ${
                    errors.email ? 'border-red-400' : 'border-line'
                  }`}
                />
                {errors.email && (
                  <p
                    id={emailErrorId}
                    className="mt-1.5 text-xs text-red-700"
                    role="alert"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              <PasswordField
                id="password"
                label="Password"
                value={values.password}
                onChange={(event) =>
                  updateValue('password', event.target.value)
                }
                placeholder={
                  isSignup ? 'At least 8 characters' : 'Enter your password'
                }
                error={errors.password}
                visible={visiblePasswords.password}
                onToggle={() => togglePassword('password')}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
              />

              {isSignup ? (
                <PasswordField
                  id="confirmPassword"
                  label="Confirm password"
                  value={values.confirmPassword}
                  onChange={(event) =>
                    updateValue('confirmPassword', event.target.value)
                  }
                  placeholder="Re-enter your password"
                  error={errors.confirmPassword}
                  visible={visiblePasswords.confirmPassword}
                  onToggle={() => togglePassword('confirmPassword')}
                  autoComplete="new-password"
                />
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <label className="flex items-center gap-2.5 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={values.remember}
                      onChange={(event) =>
                        updateValue('remember', event.target.checked)
                      }
                      className="h-4 w-4 accent-forest"
                    />
                    Remember me
                  </label>
                  <a
                    href="#forgot-password"
                    onClick={(event) => {
                      event.preventDefault()
                      showIntegrationNotice(
                        'Password recovery is not available until authentication is connected.'
                      )
                    }}
                    className="focus-ring text-sm font-semibold text-forest hover:text-forest-dark"
                  >
                    Forgot password?
                  </a>
                </div>
              )}

              {isSignup && (
                <div>
                  <label className="flex items-start gap-2.5 text-sm leading-6 text-slate-600">
                    <input
                      type="checkbox"
                      name="acceptedTerms"
                      checked={values.acceptedTerms}
                      onChange={(event) =>
                        updateValue('acceptedTerms', event.target.checked)
                      }
                      aria-invalid={Boolean(errors.acceptedTerms)}
                      aria-describedby={
                        errors.acceptedTerms ? 'terms-error' : undefined
                      }
                      className="mt-1 h-4 w-4 shrink-0 accent-forest"
                    />
                    <span>
                      I agree to the{' '}
                      <span className="font-semibold text-ink">
                        Terms and Conditions
                      </span>
                    </span>
                  </label>
                  {errors.acceptedTerms && (
                    <p
                      id="terms-error"
                      className="mt-1.5 text-xs text-red-700"
                      role="alert"
                    >
                      {errors.acceptedTerms}
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="focus-ring mt-7 flex w-full items-center justify-center bg-forest px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-forest-dark"
            >
              {isSignup ? 'Create Account' : 'Log In'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs leading-5 text-slate-500">
            Authentication is not connected yet. Sign-in and account creation
            are not available at this time.
          </p>

          {notice && (
            <p
              className="mt-5 border border-line bg-mist px-4 py-3 text-sm leading-6 text-slate-600"
              role="status"
              aria-live="polite"
            >
              {notice}
            </p>
          )}

          <p className="mt-7 border-t border-line pt-6 text-center text-sm text-slate-500">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <a
              href={isSignup ? '/login' : '/signup'}
              className="focus-ring font-semibold text-forest hover:text-forest-dark"
            >
              {isSignup ? 'Log in' : 'Sign up'}
            </a>
          </p>
        </section>
      </main>

      <footer className="border-t border-line bg-white py-5">
        <div className="section-wrap flex flex-col gap-2 text-center text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <span>© 2026 Careerlyst</span>
          <span>Helping students take the next step with more confidence.</span>
        </div>
      </footer>
    </div>
  )
}

export default AuthPage
