import { useEffect, useState } from 'react'
import OpportunityCard from './OpportunityCard.jsx'
import ProductNav from './ProductNav.jsx'
import { getApplicationStatus, getOpportunityId, getSavedOpportunities } from './services/opportunityStorage.js'

const statusColumns = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected']

function ApplicationsPage() {
  const [savedOpportunities, setSavedOpportunities] = useState(() => getSavedOpportunities())
  const [, setStorageVersion] = useState(0)

  useEffect(() => {
    const refresh = () => {
      setSavedOpportunities(getSavedOpportunities())
      setStorageVersion((version) => version + 1)
    }
    window.addEventListener('careerlyst:storage-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('careerlyst:storage-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const removeFromTracker = () => setSavedOpportunities(getSavedOpportunities())

  return <div className="min-h-screen bg-mist text-ink"><ProductNav active="applications" /><main className="section-wrap pb-20 sm:pb-24"><section className="py-12 sm:py-16"><p className="eyebrow mb-4">Your progress</p><h1 className="font-display text-4xl leading-tight tracking-[-0.045em] text-ink sm:text-5xl">Application Tracker</h1><p className="mt-4 max-w-xl text-base leading-7 text-slate-600">Keep every opportunity and next step in one place.</p></section>{savedOpportunities.length ? <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-5">{statusColumns.map((status) => { const columnItems = savedOpportunities.filter((opportunity) => getApplicationStatus(opportunity) === status); return <section key={status} className={`min-w-0 border border-line bg-white p-4 sm:p-5 ${status === 'Rejected' ? 'opacity-80' : ''}`}><div className="flex items-center justify-between border-b border-line pb-4"><h2 className="text-sm font-semibold text-ink">{status}</h2><span className="text-xs font-semibold text-slate-400">{columnItems.length}</span></div><div className="mt-4 space-y-4">{columnItems.length ? columnItems.map((opportunity) => <OpportunityCard key={getOpportunityId(opportunity)} opportunity={opportunity} showStatus onSavedChange={removeFromTracker} />) : <p className="py-6 text-center text-xs leading-5 text-slate-400">No opportunities here yet.</p>}</div></section> })}</div> : <div className="mx-auto max-w-2xl border border-line bg-white px-6 py-16 text-center"><h2 className="text-xl font-semibold text-ink">Your tracker is empty.</h2><p className="mt-3 text-sm text-slate-500">Save an opportunity first, then update its status as you move forward.</p><a href="/opportunities" className="focus-ring mt-6 inline-flex bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-dark">Discover Opportunities</a></div>}</main><footer className="border-t border-line bg-white py-7"><div className="section-wrap flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>© 2026 Careerlyst</span><span>Build a clearer path forward.</span></div></footer></div>
}

export default ApplicationsPage
