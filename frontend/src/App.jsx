import { useEffect, useState } from 'react'
import UploadPage from './UploadPage.jsx'
import ProfilePage from './ProfilePage.jsx'
import OpportunitiesPage from './OpportunitiesPage.jsx'
import SavedPage from './SavedPage.jsx'
import ApplicationsPage from './ApplicationsPage.jsx'
import AnalyzingPage from './AnalyzingPage.jsx'

const steps = [
  {
    number: '01',
    title: 'Upload Resume',
    description:
      'Share your resume once. Careerlyst looks for the details that make your experience distinct.',
  },
  {
    number: '02',
    title: 'Understand Your Profile',
    description:
      'See your skills, projects, education and interests organized into a clearer career picture.',
  },
  {
    number: '03',
    title: 'Discover Matched Opportunities',
    description:
      'Explore internships selected around where you are now and where you want to go next.',
  },
]

function Brand({ light = false }) {
  return (
    <a
      href="#top"
      className="focus-ring inline-flex items-center gap-2.5"
      aria-label="Careerlyst home"
    >
      <span
        className="relative flex h-7 w-7 items-end gap-1"
        aria-hidden="true"
      >
        <span
          className={`h-4 w-1.5 ${light ? 'bg-emerald-300' : 'bg-forest'}`}
        />
        <span
          className={`h-6 w-1.5 ${light ? 'bg-emerald-200' : 'bg-forest'}`}
        />
        <span
          className={`h-7 w-1.5 ${light ? 'bg-white' : 'bg-ink'}`}
        />
      </span>

      <span
        className={`text-[1.2rem] font-bold tracking-[-0.04em] ${
          light ? 'text-white' : 'text-ink'
        }`}
      >
        Careerlyst
      </span>
    </a>
  )
}

function FlowCard({ label, detail, tone }) {
  return (
    <div className={`flow-card ${tone}`}>
      <div className="mb-5 flex items-center justify-between">
        <span className="h-2 w-2 rounded-full bg-current" />
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-70">
          {detail}
        </span>
      </div>

      <p className="text-lg font-semibold tracking-[-0.02em]">{label}</p>
    </div>
  )
}

function App() {
  const [pathname, setPathname] = useState(
    window.location.pathname
  )

  useEffect(() => {
    const handleNavigation = () => {
      setPathname(window.location.pathname)
    }

    window.addEventListener('popstate', handleNavigation)

    return () => {
      window.removeEventListener('popstate', handleNavigation)
    }
  }, [])

  if (pathname === '/upload') {
    return <UploadPage />
  }

  if (pathname === '/analyzing') {
    return <AnalyzingPage />
  }

  if (pathname === '/profile') {
    return <ProfilePage />
  }

  if (pathname === '/opportunities') {
    return <OpportunitiesPage />
  }

  if (pathname === '/saved') {
    return <SavedPage />
  }

  if (pathname === '/applications') {
    return <ApplicationsPage />
  }

  return (
    <div id="top" className="overflow-hidden">
      <header className="border-b border-line/70 bg-white">
        <div className="section-wrap flex min-h-[76px] flex-wrap items-center justify-between gap-4 py-3">
          <Brand />

          <nav
            className="hidden items-center gap-8 md:flex"
            aria-label="Main navigation"
          >
            <a
              className="focus-ring text-sm font-medium text-slate-600 transition-colors hover:text-ink"
              href="/opportunities"
            >
              Discover
            </a>

            <a
              className="focus-ring text-sm font-medium text-slate-600 transition-colors hover:text-ink"
              href="/saved"
            >
              Saved
            </a>

            <a
              className="focus-ring text-sm font-medium text-slate-600 transition-colors hover:text-ink"
              href="/applications"
            >
              Applications
            </a>

            <a
              className="focus-ring text-sm font-medium text-slate-600 transition-colors hover:text-ink"
              href="/profile"
            >
              Profile
            </a>
          </nav>

          <nav
            className="flex w-full items-center gap-5 overflow-x-auto border-t border-line pt-3 md:hidden"
            aria-label="Mobile main navigation"
          >
            <a
              className="focus-ring shrink-0 text-sm font-medium text-slate-600"
              href="/opportunities"
            >
              Discover
            </a>

            <a
              className="focus-ring shrink-0 text-sm font-medium text-slate-600"
              href="/saved"
            >
              Saved
            </a>

            <a
              className="focus-ring shrink-0 text-sm font-medium text-slate-600"
              href="/applications"
            >
              Applications
            </a>

            <a
              className="focus-ring shrink-0 text-sm font-medium text-slate-600"
              href="/profile"
            >
              Profile
            </a>
          </nav>

          <a
            href="/upload"
            className="focus-ring inline-flex items-center justify-center border border-forest bg-forest px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-dark"
          >
            Upload Resume
          </a>
        </div>
      </header>

      <main>
        <section
          id="discover"
          className="relative border-b border-line/70 bg-mist"
        >
          <div className="section-wrap grid min-h-[625px] items-center gap-14 py-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20 lg:py-24">
            <div className="relative z-10 max-w-xl">
              <p className="eyebrow mb-6">
                A clearer start to your career
              </p>

              <h1 className="max-w-[650px] font-display text-5xl leading-[1.04] tracking-[-0.045em] text-ink sm:text-6xl lg:text-[4.55rem]">
                Find internships that actually fit you.
              </h1>

              <p className="mt-7 max-w-lg text-lg leading-8 text-slate-600">
                Upload your resume and discover opportunities matched
                to your skills, projects, education and interests.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/upload"
                  className="focus-ring inline-flex items-center justify-center bg-forest px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-forest-dark"
                >
                  Upload Resume
                  <span className="ml-3 text-lg leading-none">
                    -&gt;
                  </span>
                </a>

                <a
                  href="/opportunities"
                  className="focus-ring inline-flex items-center justify-center border border-line bg-white px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
                >
                  Explore Opportunities
                </a>
              </div>

              <p className="mt-5 text-xs font-medium text-slate-500">
                Built for students making their next move.
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-[510px] lg:mr-0">
              <div
                className="absolute -right-10 -top-10 h-40 w-40 border border-forest/20"
                aria-hidden="true"
              />

              <div className="relative border border-line bg-white p-5 shadow-soft sm:p-8">
                <div className="mb-8 flex items-center justify-between border-b border-line pb-5">
                  <div>
                    <p className="text-sm font-bold text-ink">
                      Your career path
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      A more relevant way forward
                    </p>
                  </div>

                  <span
                    className="flex h-8 w-8 items-center justify-center border border-line text-forest"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </div>

                <div className="flow-stack">
                  <FlowCard
                    label="Resume"
                    detail="01 / input"
                    tone="flow-card-paper"
                  />

                  <div className="flow-arrow" aria-hidden="true">
                    ↓
                  </div>

                  <FlowCard
                    label="AI Profile"
                    detail="02 / insight"
                    tone="flow-card-profile"
                  />

                  <div className="flow-arrow" aria-hidden="true">
                    ↓
                  </div>

                  <FlowCard
                    label="Matched Opportunities"
                    detail="03 / next step"
                    tone="flow-card-match"
                  />
                </div>
              </div>

              <div
                className="absolute -bottom-7 -left-7 hidden h-20 w-20 border-b border-l border-forest/40 sm:block"
                aria-hidden="true"
              />
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-b border-line/70 bg-white py-24 lg:py-28"
        >
          <div className="section-wrap">
            <div className="flex flex-col justify-between gap-5 border-b border-line pb-8 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow mb-4">
                  How Careerlyst Works
                </p>

                <h2 className="max-w-md font-display text-4xl leading-tight tracking-[-0.04em] text-ink sm:text-5xl">
                  From experience to possibility.
                </h2>
              </div>

              <p className="max-w-xs text-sm leading-6 text-slate-500">
                Less searching. More context. A path that feels made
                for you.
              </p>
            </div>

            <div className="grid gap-0 md:grid-cols-3">
              {steps.map((step, index) => (
                <article
                  key={step.number}
                  className={`border-b border-line py-8 md:border-b-0 md:py-10 md:pr-9 ${
                    index > 0 ? 'md:border-l md:pl-9' : ''
                  }`}
                >
                  <span className="text-sm font-bold text-forest">
                    {step.number}
                  </span>

                  <h3 className="mt-7 text-xl font-semibold tracking-[-0.025em] text-ink">
                    {step.title}
                  </h3>

                  <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="bg-mist py-20 lg:py-24">
          <div className="section-wrap grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow mb-4">
                Made for the first few steps
              </p>

              <h2 className="max-w-2xl font-display text-4xl leading-tight tracking-[-0.04em] text-ink sm:text-5xl">
                Ready to find opportunities that fit you?
              </h2>
            </div>

            <a
              href="/upload"
              className="focus-ring inline-flex w-fit items-center justify-center border border-forest bg-forest px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-forest-dark"
            >
              Upload Your Resume
              <span className="ml-3 text-lg leading-none">
                -&gt;
              </span>
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-ink py-8 text-white">
        <div className="section-wrap flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Brand light />

          <p className="text-xs text-slate-400">
            Helping students take the next step with more confidence.
          </p>

          <p className="text-xs text-slate-500">
            © 2026 Careerlyst
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App