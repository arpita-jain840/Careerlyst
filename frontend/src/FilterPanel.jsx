function valuesFor(opportunities, key, fallbackKey) {
  return [...new Set(opportunities.map((opportunity) => opportunity[key] || opportunity[fallbackKey]).filter(Boolean))]
}

function FilterSelect({ label, value, options, onChange }) {
  return <label className="block min-w-0 flex-1 text-xs font-semibold text-slate-500">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="focus-ring mt-2 w-full appearance-none border border-line bg-white px-3 py-2.5 text-sm font-medium text-ink">{options.map((option) => <option key={option}>{option}</option>)}</select></label>
}

function FilterPanel({ opportunities, search, setSearch, filters, onFilterChange, eligibleOnly, setEligibleOnly, onClear, mobile = false, onClose }) {
  const locations = ['All locations', ...valuesFor(opportunities, 'location')]
  const workModes = ['All work modes', ...valuesFor(opportunities, 'work_mode')]
  const types = ['All types', ...valuesFor(opportunities, 'type', 'opportunity_type')]
  const sources = ['All sources', ...valuesFor(opportunities, 'platform')]
  const roles = ['All roles', ...valuesFor(opportunities, 'role', 'title')]

  return <section className={mobile ? 'h-full overflow-y-auto bg-white p-5' : 'border border-line bg-white p-4 sm:p-5'} aria-label="Opportunity filters">
    {mobile && <div className="mb-6 flex items-center justify-between border-b border-line pb-4"><h2 className="text-lg font-semibold text-ink">Filters</h2><button type="button" onClick={onClose} className="focus-ring text-sm font-semibold text-slate-500 hover:text-ink">Close</button></div>}
    <label className="block text-xs font-semibold text-slate-500">Search by role or company<span className="relative mt-2 block"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} className="focus-ring w-full border border-line py-3 pl-9 pr-3 text-sm text-ink placeholder:text-slate-400" placeholder="Search internships, roles or companies" /></span></label>
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><FilterSelect label="Role" value={filters.role} options={roles} onChange={(value) => onFilterChange('role', value)} /><FilterSelect label="Location" value={filters.location} options={locations} onChange={(value) => onFilterChange('location', value)} /><FilterSelect label="Work Mode" value={filters.workMode} options={workModes} onChange={(value) => onFilterChange('workMode', value)} /><FilterSelect label="Opportunity Type" value={filters.type} options={types} onChange={(value) => onFilterChange('type', value)} /><FilterSelect label="Source" value={filters.source} options={sources} onChange={(value) => onFilterChange('source', value)} /></div>
    <div className="mt-5 flex flex-col gap-4 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between"><label className="flex items-center gap-3 text-sm font-medium text-ink"><input type="checkbox" checked={eligibleOnly} onChange={(event) => setEligibleOnly(event.target.checked)} className="h-4 w-4 accent-forest" />Show only opportunities I can apply for</label><button type="button" onClick={onClear} className="focus-ring w-fit text-sm font-semibold text-forest underline decoration-forest/40 underline-offset-4 hover:text-forest-dark">Clear All Filters</button></div>
    {mobile && <button type="button" onClick={onClose} className="focus-ring mt-7 w-full bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-dark">Show Results</button>}
  </section>
}

export default FilterPanel
