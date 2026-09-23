import { useMemo, useState } from 'react'
import OpportunityCard from './OpportunityCard.jsx'
import FilterPanel from './FilterPanel.jsx'
import ProductNav from './ProductNav.jsx'
import { getAnalysisResult } from './services/analysisStorage.js'

function asList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function ProfileSidebar({ profile }) {
  const roles = asList(profile?.target_roles)
  const skills = asList(profile?.skills)
  return <aside className="border border-line bg-white p-5"><div className="flex items-center justify-between border-b border-line pb-4"><h2 className="text-base font-semibold text-ink">Your Profile</h2><span className="text-xs font-semibold text-forest">Live profile</span></div><div className="mt-5"><p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-400">Target roles</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{roles.length ? roles.join('\n') : 'Not provided'}</p></div><div className="mt-5"><p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-400">Skills</p><div className="mt-3 flex flex-wrap gap-2">{skills.length ? skills.slice(0, 6).map((skill) => <span key={skill} className="border border-line bg-mist px-2.5 py-1.5 text-xs font-medium text-ink">{skill}</span>) : <span className="text-sm text-slate-500">Not provided</span>}</div></div><a href="/profile" className="focus-ring mt-6 inline-block text-sm font-semibold text-forest underline decoration-forest/40 underline-offset-4 hover:text-forest-dark">Edit Profile</a></aside>
}

function EmptyState() {
  return <div className="border border-line bg-white px-6 py-16 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center border border-line text-xl text-slate-400">⌕</span><h2 className="mt-5 text-lg font-semibold text-ink">No opportunities found</h2><p className="mt-2 text-sm text-slate-500">Try changing your search or filters.</p></div>
}

function ErrorState() {
  return <div className="border border-red-200 bg-white px-6 py-16 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center border border-red-200 text-lg text-red-600">!</span><h2 className="mt-5 text-lg font-semibold text-ink">We couldn't load opportunities.</h2><a href="/upload" className="focus-ring mt-5 inline-flex border border-forest px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-white">Retry</a></div>
}

function normalize(value) {
  return String(value || '').trim().toLowerCase()
}

function postedTime(opportunity) {
  const value = opportunity.posted_at || opportunity.published_at || opportunity.created_at || opportunity.date_posted
  const timestamp = value ? Date.parse(value) : 0
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function OpportunitiesPage() {
  const result = getAnalysisResult()
  const opportunities = asList(result?.opportunities)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('Best Match')
  const [eligibleOnly, setEligibleOnly] = useState(false)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [filters, setFilters] = useState({ role: 'All roles', location: 'All locations', workMode: 'All work modes', type: 'All types', source: 'All sources' })
  const hasResponse = Boolean(result && typeof result === 'object' && Object.keys(result).length)

  const filteredOpportunities = useMemo(() => {
    const query = search.toLowerCase().trim()
    return opportunities.filter((opportunity) => {
      const searchable = `${opportunity.title || ''} ${opportunity.company || ''} ${opportunity.platform || ''} ${opportunity.description || ''}`.toLowerCase()
      const roleValue = opportunity.role || opportunity.title
      const opportunityType = opportunity.type || opportunity.opportunity_type
      const searchMatch = searchable.includes(query)
      const roleMatch = filters.role === 'All roles' || normalize(roleValue) === normalize(filters.role)
      const locationMatch = filters.location === 'All locations' || opportunity.location === filters.location
      const modeMatch = filters.workMode === 'All work modes' || opportunity.work_mode === filters.workMode
      const typeMatch = filters.type === 'All types' || normalize(opportunityType) === normalize(filters.type)
      const sourceMatch = filters.source === 'All sources' || opportunity.platform === filters.source
      const eligibilityMatch = !eligibleOnly || opportunity.eligible === true
      return searchMatch && roleMatch && locationMatch && modeMatch && typeMatch && sourceMatch && eligibilityMatch
    }).sort((first, second) => {
      if (sort === 'Highest Skill Match') return (second.skill_score || 0) - (first.skill_score || 0)
      if (sort === 'Recently Posted') return postedTime(second) - postedTime(first)
      return (second.match_score || 0) - (first.match_score || 0)
    })
  }, [eligibleOnly, filters, opportunities, search, sort])

  const clearFilters = () => {
    setSearch('')
    setEligibleOnly(false)
    setFilters({ role: 'All roles', location: 'All locations', workMode: 'All work modes', type: 'All types', source: 'All sources' })
  }

  const onFilterChange = (key, value) => setFilters((current) => ({ ...current, [key]: value }))
  const activeFilterCount = Object.values(filters).filter((value) => !value.startsWith('All ')).length + (eligibleOnly ? 1 : 0) + (search.trim() ? 1 : 0)

  return <div className="min-h-screen bg-mist text-ink">
    <ProductNav active="discover" />
    <main className="section-wrap pb-20 sm:pb-24">
      <section className="py-12 sm:py-16"><p className="eyebrow mb-4">Your opportunity feed</p><h1 className="font-display text-4xl leading-tight tracking-[-0.045em] text-ink sm:text-5xl">Opportunities picked for you</h1><p className="mt-4 max-w-xl text-base leading-7 text-slate-600">Based on your skills, projects, education and career interests.</p></section>
      {hasResponse && <div className="hidden lg:block"><FilterPanel opportunities={opportunities} search={search} setSearch={setSearch} filters={filters} onFilterChange={onFilterChange} eligibleOnly={eligibleOnly} setEligibleOnly={setEligibleOnly} onClear={clearFilters} /></div>}
      {hasResponse && <button type="button" onClick={() => setIsMobileFiltersOpen(true)} className="focus-ring flex w-full items-center justify-between border border-line bg-white px-4 py-3.5 text-sm font-semibold text-ink lg:hidden"><span>Filters{activeFilterCount > 0 && <span className="ml-2 text-forest">({activeFilterCount})</span>}</span><span className="text-forest">Open</span></button>}
      {isMobileFiltersOpen && <div className="fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-ink/30" onClick={() => setIsMobileFiltersOpen(false)} /><div className="absolute inset-y-0 right-0 w-[min(92vw,420px)]"><FilterPanel opportunities={opportunities} search={search} setSearch={setSearch} filters={filters} onFilterChange={onFilterChange} eligibleOnly={eligibleOnly} setEligibleOnly={setEligibleOnly} onClear={clearFilters} mobile onClose={() => setIsMobileFiltersOpen(false)} /></div></div>}
      <div className="mt-8 grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]"><ProfileSidebar profile={result?.profile} /><section><div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-semibold text-ink">{filteredOpportunities.length} opportunit{filteredOpportunities.length === 1 ? 'y' : 'ies'} found</p><label className="flex items-center gap-2 text-xs font-semibold text-slate-500">Sort by<select value={sort} onChange={(event) => setSort(event.target.value)} className="focus-ring border-0 bg-transparent py-1 text-sm font-semibold text-ink"><option>Best Match</option><option>Highest Skill Match</option><option>Recently Posted</option></select></label></div>{!hasResponse ? <ErrorState /> : !filteredOpportunities.length ? <div className="border border-line bg-white px-6 py-16 text-center"><h2 className="text-lg font-semibold text-ink">No opportunities match your current filters.</h2><button type="button" onClick={clearFilters} className="focus-ring mt-5 border border-forest px-5 py-2.5 text-sm font-semibold text-forest hover:bg-forest hover:text-white">Clear Filters</button></div> : <div className="space-y-4">{filteredOpportunities.map((opportunity, index) => <OpportunityCard key={`${opportunity.company || 'opportunity'}-${opportunity.title || index}-${index}`} opportunity={opportunity} />)}</div>}</section></div>
    </main>
    <footer className="border-t border-line bg-white py-7"><div className="section-wrap flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>© 2026 Careerlyst</span><span>Build a clearer path forward.</span></div></footer>
  </div>
}

export default OpportunitiesPage
