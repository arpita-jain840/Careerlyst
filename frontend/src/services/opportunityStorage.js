const SAVED_KEY = 'careerlyst_saved_opportunities'
const STATUS_KEY = 'careerlyst_application_statuses'

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function opportunityId(opportunity) {
  const values = [opportunity.company, opportunity.title, opportunity.platform, opportunity.url].map((value) => String(value || '').trim())
  return values.some(Boolean) ? values.join('|') : JSON.stringify(opportunity)
}

function notifyStorageChange() {
  window.dispatchEvent(new Event('careerlyst:storage-updated'))
}

export function getOpportunityId(opportunity) {
  return opportunityId(opportunity)
}

export function getSavedOpportunities() {
  const saved = readStorage(SAVED_KEY, [])
  return Array.isArray(saved) ? saved : []
}

export function isOpportunitySaved(opportunity) {
  const id = opportunityId(opportunity)
  return getSavedOpportunities().some((saved) => opportunityId(saved) === id)
}

export function saveOpportunity(opportunity) {
  const saved = getSavedOpportunities()
  if (!saved.some((item) => opportunityId(item) === opportunityId(opportunity))) {
    localStorage.setItem(SAVED_KEY, JSON.stringify([...saved, opportunity]))
    notifyStorageChange()
  }
}

export function removeSavedOpportunity(opportunity) {
  const nextSaved = getSavedOpportunities().filter((item) => opportunityId(item) !== opportunityId(opportunity))
  localStorage.setItem(SAVED_KEY, JSON.stringify(nextSaved))
  notifyStorageChange()
}

export function getApplicationStatus(opportunity) {
  const statuses = readStorage(STATUS_KEY, {})
  return statuses[opportunityId(opportunity)] || 'Saved'
}

export function setApplicationStatus(opportunity, status) {
  const statuses = readStorage(STATUS_KEY, {})
  localStorage.setItem(STATUS_KEY, JSON.stringify({ ...statuses, [opportunityId(opportunity)]: status }))
  notifyStorageChange()
}
