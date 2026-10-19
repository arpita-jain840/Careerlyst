import { useEffect, useState } from 'react'
import { clearAuthSession, getAuthToken } from './services/authStorage.js'

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

function ProductNav({ active = '' }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getAuthToken()))

  useEffect(() => {
    const updateAuth = () => setIsAuthenticated(Boolean(getAuthToken()))
    window.addEventListener('careerlyst:auth-updated', updateAuth)
    window.addEventListener('storage', updateAuth)
    return () => {
      window.removeEventListener('careerlyst:auth-updated', updateAuth)
      window.removeEventListener('storage', updateAuth)
    }
  }, [])

  const links = [
    ['Discover', '/opportunities', 'discover'],
    ['Saved', '/saved', 'saved'],
    ['Applications', '/applications', 'applications'],
    ['Profile', '/profile', 'profile'],
  ]

  return (
    <header className="border-b border-line/70 bg-white">
      <div className="section-wrap flex min-h-[76px] flex-wrap items-center justify-between gap-4 py-3">
        <Brand />
        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Product navigation"
        >
          {links.map(([label, href, key]) => (
            <a
              key={key}
              href={href}
              aria-current={active === key ? 'page' : undefined}
              className={`focus-ring text-sm transition-colors ${
                active === key
                  ? 'font-semibold text-ink'
                  : 'font-medium text-slate-600 hover:text-ink'
              }`}
            >
              {label}
            </a>
          ))}
        </nav>

        {isAuthenticated && (
          <button
            type="button"
            onClick={() => {
              clearAuthSession()
              window.location.assign('/')
            }}
            className="focus-ring hidden border border-line px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink md:inline-flex"
          >
            Log out
          </button>
        )}

        <nav
          className="flex w-full items-center gap-5 overflow-x-auto border-t border-line pt-3 md:hidden"
          aria-label="Mobile product navigation"
        >
          {links.map(([label, href, key]) => (
            <a
              key={key}
              href={href}
              aria-current={active === key ? 'page' : undefined}
              className={`focus-ring shrink-0 text-sm transition-colors ${
                active === key
                  ? 'font-semibold text-ink'
                  : 'font-medium text-slate-600 hover:text-ink'
              }`}
            >
              {label}
            </a>
          ))}
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                clearAuthSession()
                window.location.assign('/')
              }}
              className="focus-ring shrink-0 text-sm font-medium text-slate-600"
            >
              Log out
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

export default ProductNav