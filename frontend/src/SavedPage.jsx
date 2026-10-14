import { useEffect, useState } from 'react'
import OpportunityCard from './OpportunityCard.jsx'
import ProductNav from './ProductNav.jsx'
import {
  getOpportunityId,
  getSavedOpportunities,
} from './services/opportunityStorage.js'

function SavedPage() {
  const [savedOpportunities, setSavedOpportunities] = useState(
    () => getSavedOpportunities()
  )

  useEffect(() => {
    const refreshSaved = () => {
      setSavedOpportunities(getSavedOpportunities())
    }

    window.addEventListener('careerlyst:storage-updated', refreshSaved)
    window.addEventListener('storage', refreshSaved)

    return () => {
      window.removeEventListener('careerlyst:storage-updated', refreshSaved)
      window.removeEventListener('storage', refreshSaved)
    }
  }, [])

  return (
    <div className="min-h-screen bg-mist text-ink">
      <ProductNav active="saved" />

      <main className="section-wrap pb-20 sm:pb-24">
        <section className="py-12 sm:py-16">
          <p className="eyebrow mb-4">Your shortlist</p>
          <h1 className="font-display text-4xl leading-tight tracking-[-0.045em] text-ink sm:text-5xl">
            Saved Opportunities
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Keep track of opportunities you want to explore.
          </p>
        </section>

        {savedOpportunities.length > 0 ? (
          <div className="mx-auto max-w-4xl space-y-4">
            {savedOpportunities.map((opportunity, index) => (
              <OpportunityCard
                key={`${getOpportunityId(opportunity)}-${index}`}
                opportunity={opportunity}
                onSavedChange={() => {
                  setSavedOpportunities(getSavedOpportunities())
                }}
              />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-2xl border border-line bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-ink">
              No saved opportunities yet.
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Save opportunities from your discovery feed to find them here.
            </p>
            <a
              href="/opportunities"
              className="focus-ring mt-6 inline-flex bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-dark"
            >
              Discover Opportunities
            </a>
          </div>
        )}
      </main>

      <footer className="border-t border-line bg-white py-7">
        <div className="section-wrap flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Careerlyst</span>
          <span>Build a clearer path forward.</span>
        </div>
      </footer>
    </div>
  )
}

export default SavedPage
