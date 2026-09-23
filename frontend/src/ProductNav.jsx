function Brand() {
  return (
    <a href="/" className="focus-ring inline-flex items-center gap-2.5" aria-label="Careerlyst home">
      <span className="relative flex h-7 w-7 items-end gap-1" aria-hidden="true"><span className="h-4 w-1.5 bg-forest" /><span className="h-6 w-1.5 bg-forest" /><span className="h-7 w-1.5 bg-ink" /></span>
      <span className="text-[1.2rem] font-bold tracking-[-0.04em] text-ink">Careerlyst</span>
    </a>
  )
}

function ProductNav({ active = '' }) {
  const links = [
    ['Discover', '/opportunities', 'discover'],
    ['Saved', '/saved', 'saved'],
    ['Applications', '/applications', 'applications'],
    ['Profile', '/profile', 'profile'],
  ]

  return <header className="border-b border-line/70 bg-white"><div className="section-wrap flex min-h-[76px] flex-wrap items-center justify-between gap-4 py-3"><Brand /><nav className="hidden items-center gap-6 md:flex" aria-label="Product navigation">{links.map(([label, href, key]) => <a key={key} className={`focus-ring text-sm ${active === key ? 'font-semibold text-ink' : 'font-medium text-slate-600 hover:text-ink'}`} href={href}>{label}</a>)}</nav><a href="/profile" className="focus-ring hidden border border-line px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink md:inline-flex">Profile</a><nav className="flex w-full items-center gap-5 overflow-x-auto border-t border-line pt-3 md:hidden" aria-label="Mobile product navigation">{links.map(([label, href, key]) => <a key={key} className={`focus-ring shrink-0 text-sm ${active === key ? 'font-semibold text-ink' : 'font-medium text-slate-600'}`} href={href}>{label}</a>)}</nav></div></header>
}

export default ProductNav
