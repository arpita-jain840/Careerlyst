import { useState } from 'react'
import MatchScore from './MatchScore.jsx'
import OpportunityDetails from './OpportunityDetails.jsx'
import { getApplicationStatus, isOpportunitySaved, removeSavedOpportunity, saveOpportunity, setApplicationStatus } from './services/opportunityStorage.js'

const statusOptions = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected']

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string' && value.trim()) return [value]
  return []
}

function OpportunityCard({ opportunity, showStatus = false, onSavedChange }) {
  const [saved, setSaved] = useState(() => isOpportunitySaved(opportunity))
  const [status, setStatus] = useState(() => getApplicationStatus(opportunity))
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [toast, setToast] = useState('')
  const matchedSkills = asList(opportunity.matched_skills)
  const missingSkills = asList(opportunity.missing_skills || opportunity.skill_gap)
  const locationDetails = [opportunity.location, opportunity.work_mode, opportunity.platform].filter(Boolean)
  const companyName = opportunity.company || 'Company not provided'
  const title = opportunity.title || 'Opportunity title not provided'
  const hasApplyUrl = typeof opportunity.url === 'string' && opportunity.url.trim()

  const toggleSaved = () => {
    if (saved) {
      removeSavedOpportunity(opportunity)
      setSaved(false)
      setToast('Removed from saved opportunities')
      onSavedChange?.(false)
    } else {
      saveOpportunity(opportunity)
      setSaved(true)
      setStatus('Saved')
      setApplicationStatus(opportunity, 'Saved')
      setToast('Saved to your opportunities')
      onSavedChange?.(true)
    }
    window.setTimeout(() => setToast(''), 2400)
  }

  const updateStatus = (nextStatus) => {
    setStatus(nextStatus)
    setApplicationStatus(opportunity, nextStatus)
    if (!saved) {
      saveOpportunity(opportunity)
      setSaved(true)
      onSavedChange?.(true)
    }
  }

  return (
    <>
      <article className="border border-line bg-white p-5 transition-shadow hover:shadow-soft sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div className="flex min-w-0 gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center border border-line bg-mist text-sm font-bold text-forest" aria-hidden="true">{companyName.slice(0, 1).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{companyName}</p><h2 className="mt-2 break-words text-lg font-semibold tracking-[-0.025em] text-ink">{title}</h2>{locationDetails.length > 0 && <p className="mt-2 break-words text-sm text-slate-500">{locationDetails.join(' • ')}</p>}</div></div><MatchScore opportunity={opportunity} /></div>
        {opportunity.description && <p className="mt-5 line-clamp-2 border-t border-line pt-5 text-sm leading-6 text-slate-600">{opportunity.description}</p>}
        <div className="mt-5 grid gap-5 border-t border-line pt-5 sm:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-[0.13em] text-slate-400">Why this matches you</p>{matchedSkills.length ? <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">{matchedSkills.map((skill) => <li key={skill} className="flex items-center gap-1.5 text-sm font-medium text-slate-600"><span className="font-bold text-forest">✓</span>{skill}</li>)}</ul> : <p className="mt-3 text-sm text-slate-500">Not available</p>}</div><div><p className="text-xs font-bold uppercase tracking-[0.13em] text-slate-400">Skill gap</p><p className="mt-3 text-sm font-medium text-slate-600">{missingSkills.length ? missingSkills.join(' • ') : 'Not available'}</p></div></div>
        <div className="mt-5 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between"><p className={`text-sm font-semibold ${opportunity.eligible === true ? 'text-forest' : 'text-slate-500'}`}><span className="mr-2">{opportunity.eligible === true ? '✓' : '○'}</span>{opportunity.eligible === true ? 'Eligible' : 'Check eligibility'}</p><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={toggleSaved} className={`focus-ring border px-3.5 py-2 text-xs font-semibold transition-colors ${saved ? 'border-forest bg-[#edf5f1] text-forest' : 'border-line text-slate-600 hover:border-ink hover:text-ink'}`}>{saved ? 'Saved' : 'Save'}</button>{showStatus && <label className="sr-only" htmlFor={`status-${title}`}>Application status</label>}{showStatus && <select id={`status-${title}`} value={status} onChange={(event) => updateStatus(event.target.value)} className="focus-ring border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-600"><option>{statusOptions[0]}</option>{statusOptions.slice(1).map((option) => <option key={option}>{option}</option>)}</select>}<button type="button" onClick={() => setIsDetailsOpen(true)} className="focus-ring border border-line px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-ink hover:text-ink">View Details</button>{hasApplyUrl ? <a href={opportunity.url} target="_blank" rel="noreferrer" className="focus-ring bg-forest px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-forest-dark">Apply on Source</a> : <button type="button" disabled className="cursor-not-allowed bg-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-500">Apply on Source</button>}</div></div>
      </article>
      {toast && <p className="mt-2 text-xs font-medium text-forest" role="status" aria-live="polite">{toast}</p>}
      {isDetailsOpen && <OpportunityDetails opportunity={opportunity} onClose={() => setIsDetailsOpen(false)} />}
    </>
  )
}

export default OpportunityCard
