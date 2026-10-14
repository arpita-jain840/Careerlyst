import { useEffect, useId } from 'react'
import MatchScore from './MatchScore.jsx'

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string' && value.trim()) return [value.trim()]
  return []
}

function isValidApplyUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false

  try {
    const url = new URL(value)
    return url.protocol === 'https:' && Boolean(url.hostname)
  } catch {
    return false
  }
}

function DetailSection({ title, children, fallback = 'Not available' }) {
  return (
    <section className="border-t border-line pt-5">
      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        {title}
      </h3>
      <div className="mt-3 text-sm leading-7 text-slate-600">
        {children || <span className="text-slate-400">{fallback}</span>}
      </div>
    </section>
  )
}

function OpportunityDetails({ opportunity, onClose }) {
  const titleId = useId()
  const source = opportunity.platform || 'Source'

  const matchedSkills = asList(opportunity.matched_skills)
  const whyMatch = asList(opportunity.why_match)
  const missingSkills = asList(opportunity.missing_skills)
  const requirements = asList(opportunity.requirements)

  const skillGap =
    typeof opportunity.skill_gap === 'string'
      ? opportunity.skill_gap.trim()
      : asList(opportunity.skill_gap).join(' • ')

  const isAnalysisPending = opportunity.analysis_status === 'pending'
  const hasApplyUrl = isValidApplyUrl(opportunity.url)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-0 sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="max-h-[92vh] w-full overflow-y-auto border border-line bg-white shadow-soft sm:max-w-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="flex items-start justify-between gap-5 border-b border-line p-5 sm:p-7">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-forest">
              {opportunity.company || 'Company not provided'}
            </p>
            <h2
              id={titleId}
              className="mt-2 break-words text-2xl font-semibold tracking-[-0.035em] text-ink"
            >
              {opportunity.title || 'Opportunity details'}
            </h2>
          </div>

          <div className="flex shrink-0 items-start gap-4">
            <MatchScore opportunity={opportunity} />
            <button
              type="button"
              onClick={onClose}
              className="focus-ring flex h-8 w-8 items-center justify-center border border-line text-lg text-slate-500 hover:border-ink hover:text-ink"
              aria-label="Close opportunity details"
            >
              ×
            </button>
          </div>
        </header>

        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
            {[opportunity.location, opportunity.work_mode, opportunity.platform]
              .filter(Boolean)
              .map((detail, index) => (
                <span key={`${detail}-${index}`}>{detail}</span>
              ))}
          </div>

          <div className="mt-7 space-y-6">
            <DetailSection
              title="Why this matches you"
              fallback={
                isAnalysisPending
                  ? 'Detailed AI analysis is pending.'
                  : 'No match explanation is available.'
              }
            >
              <div className="space-y-3">
                {whyMatch.length > 0 && <p>{whyMatch.join(' ')}</p>}

                {matchedSkills.length > 0 && (
                  <ul className="flex flex-wrap gap-x-5 gap-y-2">
                    {matchedSkills.map((skill, index) => (
                      <li
                        key={`${skill}-${index}`}
                        className="flex items-center gap-2 font-medium text-ink"
                      >
                        <span className="font-bold text-forest">✓</span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </DetailSection>

            <DetailSection
              title="Your Skill Gap"
              fallback={
                isAnalysisPending
                  ? 'Skill gap information will be available after detailed analysis.'
                  : 'No specific skill gap information is available.'
              }
            >
              <div className="space-y-3">
                {missingSkills.length > 0 && (
                  <p>
                    <span className="font-semibold text-ink">Missing skills:</span>{' '}
                    {missingSkills.join(' • ')}
                  </p>
                )}

                {skillGap && (
                  <p>
                    <span className="font-semibold text-ink">Skill gap:</span>{' '}
                    {skillGap}
                  </p>
                )}
              </div>
            </DetailSection>

            <DetailSection title="Requirements">
              {requirements.length > 0 && (
                <ul className="list-inside list-disc space-y-1">
                  {requirements.map((requirement, index) => (
                    <li key={`${requirement}-${index}`}>{requirement}</li>
                  ))}
                </ul>
              )}
            </DetailSection>

            <DetailSection title="Job Description">
              {opportunity.description}
            </DetailSection>
          </div>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring w-fit text-sm font-semibold text-slate-500 underline underline-offset-4 hover:text-ink"
          >
            Back to Opportunities
          </button>

          {hasApplyUrl ? (
            <a
              href={opportunity.url}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center justify-center bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-dark"
            >
              Apply on {source}
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="cursor-not-allowed bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-500"
            >
              Apply link unavailable
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}

export default OpportunityDetails
