
const SAVED_KEY = 'careerlyst_saved_opportunities'
const STATUS_KEY = 'careerlyst_application_statuses'

const VALID_STATUSES = [
  'Saved',
  'Applied',
  'Interview',
  'Offer',
  'Rejected',
]

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Careerlyst could not save ${key}:`, error)
    return false
  }
}

function opportunityId(opportunity) {
  const values = [
    opportunity?.company,
    opportunity?.title,
    opportunity?.platform,
    opportunity?.url,
  ].map((value) => String(value || '').trim())

  return values.some(Boolean) ? values.join('|') : JSON.stringify(opportunity)
}

function notifyStorageChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('careerlyst:storage-updated'))
  }
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
  return getSavedOpportunities().some(
    (saved) => opportunityId(saved) === id
  )
}

export function saveOpportunity(opportunity) {
  if (!opportunity || typeof opportunity !== 'object') return false

  const saved = getSavedOpportunities()
  const id = opportunityId(opportunity)

  if (saved.some((item) => opportunityId(item) === id)) return true

  const success = writeStorage(SAVED_KEY, [...saved, opportunity])

  if (success) notifyStorageChange()
  return success
}

export function removeSavedOpportunity(opportunity) {
  const id = opportunityId(opportunity)
  const nextSaved = getSavedOpportunities().filter(
    (item) => opportunityId(item) !== id
  )

  const success = writeStorage(SAVED_KEY, nextSaved)

  if (success) notifyStorageChange()
  return success
}

export function getApplicationStatus(opportunity) {
  const statuses = readStorage(STATUS_KEY, {})
  return statuses[opportunityId(opportunity)] || 'Saved'
}

export function setApplicationStatus(opportunity, status) {
  if (!opportunity || typeof opportunity !== 'object') return false
  if (!VALID_STATUSES.includes(status)) return false

  const statuses = readStorage(STATUS_KEY, {})
  const success = writeStorage(STATUS_KEY, {
    ...statuses,
    [opportunityId(opportunity)]: status,
  })

  if (success) notifyStorageChange()
  return success
}
