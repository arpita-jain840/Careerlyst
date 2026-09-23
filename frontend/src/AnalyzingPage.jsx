import { useEffect, useState } from 'react'
import ProductNav from './ProductNav.jsx'
import { getAnalysisJob, retryAnalysis, subscribeToAnalysis } from './services/analysisJob.js'

const progressSteps = [
  ['complete', 'Resume uploaded'],
  ['active', 'Understanding your profile'],
  ['pending', 'Finding opportunities'],
  ['pending', 'Preparing your recommendations'],
]

function AnalyzingPage() {
  const [job, setJob] = useState(() => getAnalysisJob())

  useEffect(() => subscribeToAnalysis(setJob), [])

  useEffect(() => {
    if (job?.status === 'success') window.location.assign('/profile')
  }, [job?.status])

  const isError = job?.status === 'error'

  return (
    <div className="min-h-screen bg-mist text-ink">
      <ProductNav active="" />
      <main className="section-wrap flex min-h-[calc(100vh-152px)] items-center justify-center py-16 sm:py-20">
        <section className="w-full max-w-2xl border border-line bg-white p-6 shadow-soft sm:p-10" aria-live="polite">
          <div className="mx-auto max-w-xl text-center">
            <span className={`mx-auto flex h-16 w-16 items-center justify-center border ${isError ? 'border-red-200 text-red-600' : 'border-forest/30 text-forest'}`} aria-hidden="true">
              {isError ? '!' : <span className="h-6 w-6 animate-spin border-2 border-forest/20 border-t-forest" />}
            </span>
            <p className="eyebrow mt-7">Resume analysis</p>
            <h1 className="mt-3 font-display text-4xl leading-tight tracking-[-0.045em] text-ink sm:text-5xl">Building your career profile</h1>
            <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-slate-600">Careerlyst is analyzing your resume and finding opportunities that fit your profile.</p>
          </div>

          <ol className="mx-auto mt-10 max-w-md space-y-4 border-t border-line pt-7">
            {progressSteps.map(([state, label], index) => (
              <li key={label} className="flex items-center gap-4 text-sm font-medium">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center border text-xs ${state === 'complete' ? 'border-forest bg-forest text-white' : state === 'active' && !isError ? 'border-forest text-forest' : 'border-line text-slate-400'}`} aria-hidden="true">
                  {state === 'complete' ? '✓' : state === 'active' && !isError ? <span className="h-2 w-2 animate-pulse rounded-full bg-forest" /> : '○'}
                </span>
                <span className={state === 'pending' ? 'text-slate-400' : 'text-ink'}>{label}</span>
                {state === 'active' && !isError && <span className="ml-auto text-xs font-normal text-slate-400">In progress</span>}
                {index === 1 && isError && <span className="ml-auto text-xs font-normal text-red-600">Could not complete</span>}
              </li>
            ))}
          </ol>

          {isError && (
            <div className="mt-8 border-t border-red-100 pt-6 text-center">
              <p className="text-sm font-medium text-red-700" role="alert">{job.error}</p>
              <button type="button" onClick={() => retryAnalysis(job.file)} className="focus-ring mt-5 bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-dark">Try Again</button>
            </div>
          )}
          {!job && <p className="mt-8 text-center text-sm text-slate-500">Start with a resume upload to begin your analysis.</p>}
        </section>
      </main>
    </div>
  )
}

export default AnalyzingPage