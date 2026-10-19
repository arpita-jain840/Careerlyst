import { useEffect, useMemo, useState } from 'react'
import ApplicationCard from './ApplicationCard.jsx'
import ProductNav from './ProductNav.jsx'
import { createApplication, deleteApplication, getApplications, updateApplication } from './services/api.js'
import { clearAuthSession, getAuthToken } from './services/authStorage.js'
import { getSavedOpportunities } from './services/opportunityStorage.js'

const statuses = ['Applied', 'Interview', 'Offer', 'Rejected']
const allStatuses = ['Saved', ...statuses]

function today() {
  const current = new Date()
  const month = String(current.getMonth() + 1).padStart(2, '0')
  const day = String(current.getDate()).padStart(2, '0')
  return `${current.getFullYear()}-${month}-${day}`
}

function dateTimeValue(value) {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  const offset = parsed.getTimezoneOffset() * 60000
  return new Date(parsed.getTime() - offset).toISOString().slice(0, 16)
}

function newApplicationForm() {
  return {
    id: null,
    opportunity: { title: '', company: '', location: '', work_mode: '', platform: '', url: '', description: '' },
    status: 'Applied',
    application_date: today(),
    interview_at: '',
    follow_up_at: '',
    reminder_note: '',
  }
}

function formFromApplication(application) {
  return {
    id: application.id,
    opportunity: { ...(application.opportunity || {}) },
    status: application.status,
    application_date: application.application_date || '',
    interview_at: dateTimeValue(application.interview_at),
    follow_up_at: dateTimeValue(application.follow_up_at),
    reminder_note: application.reminder_note || '',
  }
}

function SummaryItem({ label, value }) {
  return <div className="border border-line bg-white p-4 sm:p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink">{value}</p></div>
}

function ApplicationEditor({ value, isSaving, onChange, onClose, onSave }) {
  const updateOpportunity = (key, nextValue) => onChange((current) => ({ ...current, opportunity: { ...current.opportunity, [key]: nextValue } }))
  const update = (key, nextValue) => onChange((current) => ({ ...current, [key]: nextValue }))

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-0 sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="max-h-[94vh] w-full overflow-y-auto border border-line bg-white shadow-soft sm:max-w-2xl" role="dialog" aria-modal="true" aria-labelledby="application-editor-title"><header className="flex items-start justify-between gap-4 border-b border-line p-5 sm:p-7"><div><p className="eyebrow">Application details</p><h2 id="application-editor-title" className="mt-2 font-display text-3xl tracking-[-0.04em] text-ink">{value.id ? 'Edit application' : 'Add application'}</h2></div><button type="button" onClick={onClose} className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center border border-line text-lg text-slate-500 hover:text-ink" aria-label="Close form">×</button></header><form onSubmit={onSave} className="space-y-5 p-5 sm:p-7"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-ink">Job title<input required value={value.opportunity.title || ''} onChange={(event) => updateOpportunity('title', event.target.value)} className="focus-ring mt-2 w-full border border-line px-3 py-3 text-sm font-normal" /></label><label className="text-sm font-semibold text-ink">Company<input required value={value.opportunity.company || ''} onChange={(event) => updateOpportunity('company', event.target.value)} className="focus-ring mt-2 w-full border border-line px-3 py-3 text-sm font-normal" /></label><label className="text-sm font-semibold text-ink">Location<input value={value.opportunity.location || ''} onChange={(event) => updateOpportunity('location', event.target.value)} className="focus-ring mt-2 w-full border border-line px-3 py-3 text-sm font-normal" /></label><label className="text-sm font-semibold text-ink">Work mode<input value={value.opportunity.work_mode || ''} onChange={(event) => updateOpportunity('work_mode', event.target.value)} placeholder="Remote, Hybrid, On-site" className="focus-ring mt-2 w-full border border-line px-3 py-3 text-sm font-normal placeholder:text-slate-400" /></label><label className="text-sm font-semibold text-ink">Source<input value={value.opportunity.platform || ''} onChange={(event) => updateOpportunity('platform', event.target.value)} className="focus-ring mt-2 w-full border border-line px-3 py-3 text-sm font-normal" /></label><label className="text-sm font-semibold text-ink">Source URL<input type="url" value={value.opportunity.url || ''} onChange={(event) => updateOpportunity('url', event.target.value)} className="focus-ring mt-2 w-full border border-line px-3 py-3 text-sm font-normal" /></label><label className="text-sm font-semibold text-ink">Status<select value={value.status} onChange={(event) => update('status', event.target.value)} className="focus-ring mt-2 w-full border border-line bg-white px-3 py-3 text-sm font-normal">{allStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><label className="text-sm font-semibold text-ink">Application date<input type="date" value={value.application_date} onChange={(event) => update('application_date', event.target.value)} className="focus-ring mt-2 w-full border border-line px-3 py-3 text-sm font-normal" /></label><label className="text-sm font-semibold text-ink">Interview date and time<input type="datetime-local" value={value.interview_at} onChange={(event) => update('interview_at', event.target.value)} className="focus-ring mt-2 w-full border border-line px-3 py-3 text-sm font-normal" /></label><label className="text-sm font-semibold text-ink">Follow-up date and time<input type="datetime-local" value={value.follow_up_at} onChange={(event) => update('follow_up_at', event.target.value)} className="focus-ring mt-2 w-full border border-line px-3 py-3 text-sm font-normal" /></label></div><label className="block text-sm font-semibold text-ink">Reminder note<textarea rows="3" maxLength="2000" value={value.reminder_note} onChange={(event) => update('reminder_note', event.target.value)} className="focus-ring mt-2 w-full resize-y border border-line px-3 py-3 text-sm font-normal" placeholder="What would you like to remember?" /></label><p className="text-xs leading-5 text-slate-500">Dates and notes are stored in your tracker. Careerlyst does not send notifications yet.</p><div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="focus-ring border border-line px-5 py-3 text-sm font-semibold text-slate-600">Cancel</button><button type="submit" disabled={isSaving} className="focus-ring bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-dark disabled:cursor-wait disabled:opacity-60">{isSaving ? 'Saving...' : 'Save Application'}</button></div></form></section></div>
}

function ApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const [needsLogin, setNeedsLogin] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [editor, setEditor] = useState(null)
  const [savedOpportunities, setSavedOpportunities] = useState([])
  const [showSaved, setShowSaved] = useState(false)

  const loadApplications = async () => {
    const token = getAuthToken()
    if (!token) {
      setNeedsLogin(true)
      setError('Log in to view and manage your application tracker.')
      setIsLoading(false)
      return
    }
    setNeedsLogin(false)
    setIsLoading(true)
    setError('')
    try {
      const records = await getApplications(token)
      setApplications(Array.isArray(records) ? records : [])
    } catch (requestError) {
      if (requestError.status === 401) {
        clearAuthSession()
        setNeedsLogin(true)
        setError('Your session expired. Log in again to load your applications.')
      } else {
        setError(requestError.message || 'Could not load applications. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadApplications()
  }, [])

  const visibleApplications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return applications.filter((application) => {
      const opportunity = application.opportunity || {}
      const matchesQuery = `${opportunity.title || ''} ${opportunity.company || ''}`.toLowerCase().includes(normalizedQuery)
      return matchesQuery && (statusFilter === 'All' || application.status === statusFilter)
    })
  }, [applications, query, statusFilter])

  const counts = useMemo(() => ({
    total: applications.length,
    interviews: applications.filter((application) => application.status === 'Interview').length,
    offers: applications.filter((application) => application.status === 'Offer').length,
    rejected: applications.filter((application) => application.status === 'Rejected').length,
  }), [applications])

  const openNewEditor = () => {
    setError('')
    setEditor(newApplicationForm())
  }

  const openEditEditor = (application) => {
    setError('')
    setEditor(formFromApplication(application))
  }

  const editorPayload = () => ({
    opportunity: editor.opportunity,
    status: editor.status,
    application_date: editor.application_date || null,
    interview_at: editor.interview_at || null,
    follow_up_at: editor.follow_up_at || null,
    reminder_note: editor.reminder_note,
  })

  const saveEditor = async (event) => {
    event.preventDefault()
    if (isSaving || !editor) return
    const token = getAuthToken()
    if (!token) {
      setNeedsLogin(true)
      setError('Log in to save application details.')
      return
    }
    setIsSaving(true)
    setError('')
    try {
      if (editor.id) {
        const updated = await updateApplication(editor.id, editorPayload(), token)
        setApplications((current) => current.map((application) => application.id === updated.id ? updated : application))
        setNotice('Application updated')
      } else {
        const created = await createApplication(editorPayload(), token)
        setApplications((current) => [created, ...current])
        setNotice('Application added')
      }
      setEditor(null)
    } catch (requestError) {
      if (requestError.status === 401) {
        clearAuthSession()
        setNeedsLogin(true)
      }
      setError(requestError.message || 'Could not save application. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const changeStatus = async (applicationId, status) => {
    const token = getAuthToken()
    if (!token) return
    const existing = applications.find((application) => application.id === applicationId)
    const changes = { status }
    if (status === 'Applied' && !existing?.application_date) {
      changes.application_date = today()
    }
    setUpdatingId(applicationId)
    setError('')
    try {
      const updated = await updateApplication(applicationId, changes, token)
      setApplications((current) => current.map((application) => application.id === applicationId ? updated : application))
      setNotice('Status updated')
    } catch (requestError) {
      if (requestError.status === 401) {
        clearAuthSession()
        setNeedsLogin(true)
      }
      setError(requestError.message || 'Could not update application status.')
    } finally {
      setUpdatingId(null)
    }
  }

  const removeApplication = async (application) => {
    const opportunity = application.opportunity || {}
    const confirmed = window.confirm(`Remove ${opportunity.title || 'this application'}${opportunity.company ? ` at ${opportunity.company}` : ''} from your tracker?`)
    if (!confirmed) return
    const token = getAuthToken()
    if (!token) return
    setIsRemoving(true)
    setError('')
    try {
      await deleteApplication(application.id, token)
      setApplications((current) => current.filter((item) => item.id !== application.id))
      setNotice('Application removed')
    } catch (requestError) {
      if (requestError.status === 401) {
        clearAuthSession()
        setNeedsLogin(true)
      }
      setError(requestError.message || 'Could not remove application.')
    } finally {
      setIsRemoving(false)
    }
  }

  const addSavedOpportunity = async (opportunity) => {
    const token = getAuthToken()
    if (!token) {
      setNeedsLogin(true)
      setError('Log in to add saved opportunities to your tracker.')
      return
    }
    setError('')
    try {
      const created = await createApplication({ opportunity, status: 'Saved' }, token)
      setApplications((current) => [created, ...current])
      setNotice('Saved opportunity added to your tracker')
    } catch (requestError) {
      if (requestError.status === 401) {
        clearAuthSession()
        setNeedsLogin(true)
      }
      setError(requestError.status === 409 ? 'This opportunity is already in your tracker.' : requestError.message || 'Could not add this opportunity.')
    }
  }

  const openSavedOpportunities = () => {
    setSavedOpportunities(getSavedOpportunities())
    setShowSaved((current) => !current)
  }

  return <div className="min-h-screen bg-mist text-ink">
    <ProductNav active="applications" />
    <main className="section-wrap pb-20 sm:pb-24">
      <section className="flex flex-col gap-6 py-12 sm:flex-row sm:items-end sm:justify-between sm:py-16"><div><p className="eyebrow mb-4">Your progress</p><h1 className="font-display text-4xl leading-tight tracking-[-0.045em] text-ink sm:text-5xl">My Applications</h1><p className="mt-4 max-w-xl text-base leading-7 text-slate-600">Track your job applications and interview progress in one place.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={openSavedOpportunities} className="focus-ring border border-line bg-white px-4 py-3 text-sm font-semibold text-ink hover:border-ink">{showSaved ? 'Hide saved opportunities' : 'Add from Saved'}</button><button type="button" onClick={openNewEditor} className="focus-ring bg-forest px-4 py-3 text-sm font-semibold text-white hover:bg-forest-dark">Add Application</button></div></section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4" aria-label="Application summary"><SummaryItem label="Total applications" value={counts.total} /><SummaryItem label="Interviews" value={counts.interviews} /><SummaryItem label="Offers" value={counts.offers} /><SummaryItem label="Rejected" value={counts.rejected} /></section>

      {showSaved && <section className="mt-6 border border-line bg-white p-5 sm:p-6"><div className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-base font-semibold text-ink">Saved opportunities</h2><p className="mt-1 text-sm text-slate-500">Add an existing saved opportunity without re-entering its details.</p></div><span className="text-xs text-slate-400">{savedOpportunities.length} saved</span></div>{savedOpportunities.length ? <div className="mt-4 divide-y divide-line">{savedOpportunities.map((opportunity, index) => { const alreadyTracked = applications.some((application) => application.opportunity?.url && application.opportunity.url === opportunity.url || application.opportunity?.title === opportunity.title && application.opportunity?.company === opportunity.company); return <div key={`${opportunity.url || opportunity.title}-${index}`} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="break-words text-sm font-semibold text-ink">{opportunity.title || 'Role not available'}</p><p className="mt-1 text-sm text-slate-500">{opportunity.company || 'Company not available'}</p></div><button type="button" disabled={alreadyTracked} onClick={() => addSavedOpportunity(opportunity)} className="focus-ring w-fit border border-forest px-4 py-2 text-sm font-semibold text-forest hover:bg-[#edf5f1] disabled:cursor-not-allowed disabled:border-line disabled:text-slate-400">{alreadyTracked ? 'Already tracked' : 'Add to tracker'}</button></div> })}</div> : <p className="py-5 text-sm text-slate-500">No saved opportunities are available to add.</p>}</section>}

      {notice && <p className="mt-5 border border-forest/20 bg-[#edf5f1] px-4 py-3 text-sm text-forest" role="status" aria-live="polite">{notice}</p>}
      {error && <div className="mt-5 flex flex-col gap-3 border border-red-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-red-800" role="alert">{error}</p>{needsLogin && <a href="/login" className="focus-ring w-fit text-sm font-semibold text-forest underline underline-offset-4">Log in</a>}</div>}

      <section className="mt-8">
        <div className="flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="application-search">Search applications</label><input id="application-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by job title or company" className="focus-ring min-w-0 flex-1 border border-line bg-white px-4 py-3 text-sm placeholder:text-slate-400 sm:max-w-md" /><label className="sr-only" htmlFor="application-status-filter">Filter by status</label><select id="application-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="focus-ring border border-line bg-white px-3 py-3 text-sm text-ink sm:w-48"><option>All</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select></div><p className="text-sm font-medium text-slate-500">{visibleApplications.length} shown</p></div>

        {isLoading ? <div className="mt-5 space-y-4" role="status" aria-label="Loading applications">{[0, 1, 2].map((item) => <div key={item} className="border border-line bg-white p-5"><div className="h-3 w-1/4 animate-pulse bg-mist" /><div className="mt-4 h-5 w-2/5 animate-pulse bg-mist" /><div className="mt-5 h-3 w-full animate-pulse bg-mist" /></div>)}</div> : error && applications.length === 0 ? <div className="mt-5 border border-line bg-white px-6 py-12 text-center"><p className="text-sm text-slate-600">Applications could not be loaded.</p><button type="button" onClick={loadApplications} className="focus-ring mt-4 border border-forest px-4 py-2 text-sm font-semibold text-forest">Retry</button></div> : visibleApplications.length ? <div className="mt-5 space-y-4">{visibleApplications.map((application) => <ApplicationCard key={application.id} application={application} onStatusChange={changeStatus} onEdit={openEditEditor} onDelete={removeApplication} updating={updatingId === application.id || isRemoving} />)}</div> : <div className="mt-5 border border-line bg-white px-6 py-16 text-center"><h2 className="text-xl font-semibold text-ink">{applications.length ? 'No applications match your search.' : 'Your application tracker is empty.'}</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">{applications.length ? 'Try a different search or status filter.' : 'Add an application or bring in one of your saved opportunities to get started.'}</p>{!applications.length && <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><button type="button" onClick={openSavedOpportunities} className="focus-ring border border-line px-5 py-3 text-sm font-semibold text-ink">Add from Saved</button><button type="button" onClick={openNewEditor} className="focus-ring bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-dark">Add Application</button></div>}</div>}
      </section>
      <p className="mt-5 text-xs leading-5 text-slate-400">Interview and follow-up dates are stored and displayed here. Automated email or push reminders are not configured.</p>
    </main>
    <footer className="border-t border-line bg-white py-7"><div className="section-wrap flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>© 2026 Careerlyst</span><span>Build a clearer path forward.</span></div></footer>
    {editor && <ApplicationEditor value={editor} isSaving={isSaving} onChange={setEditor} onClose={() => { if (!isSaving) setEditor(null) }} onSave={saveEditor} />}
  </div>
}

export default ApplicationsPage
