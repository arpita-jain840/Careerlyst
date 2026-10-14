import { useState } from 'react'
import ProductNav from './ProductNav.jsx'
import { getAnalysisResult } from './services/analysisStorage.js'

const PREFERENCES_KEY = 'careerlyst_profile_preferences'

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string' && value.trim()) return [value]
  return []
}

function displayValue(value, fallback = 'Not available') {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function readPreferences() {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function getDefaultPreferences(profile) {
  return {
    preferredRoles: asList(profile?.target_roles),
    preferredLocations: asList(profile?.location),
    workMode: profile?.work_mode || '',
    opportunityType: profile?.opportunity_type || '',
    skills: asList(profile?.skills),
  }
}

function getInitialPreferences(profile) {
  const defaults = getDefaultPreferences(profile)
  const stored = readPreferences()

  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
    return defaults
  }

  return {
    ...defaults,
    preferredRoles: asList(stored.preferredRoles ?? defaults.preferredRoles),
    preferredLocations: asList(
      stored.preferredLocations ?? defaults.preferredLocations
    ),
    skills: asList(stored.skills ?? defaults.skills),
    workMode:
      typeof stored.workMode === 'string'
        ? stored.workMode
        : defaults.workMode,
    opportunityType:
      typeof stored.opportunityType === 'string'
        ? stored.opportunityType
        : defaults.opportunityType,
  }
}

function TagInput({ label, values, placeholder, onAdd, onRemove }) {
  const [value, setValue] = useState('')

  const addValue = () => {
    const nextValue = value.trim()

    if (!nextValue || values.includes(nextValue)) return

    onAdd(nextValue)
    setValue('')
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-ink">
        {label}

        <div className="mt-2 flex gap-2">
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addValue()
              }
            }}
            className="focus-ring min-w-0 flex-1 border border-line bg-white px-4 py-3 text-sm font-normal text-ink placeholder:text-slate-400"
            placeholder={placeholder}
          />

          <button
            type="button"
            onClick={addValue}
            className="focus-ring border border-forest px-4 py-2 text-sm font-semibold text-forest hover:bg-forest hover:text-white"
          >
            Add
          </button>
        </div>
      </label>

      <div className="mt-3 flex min-h-8 flex-wrap gap-2">
        {values.length ? (
          values.map((item) => (
            <span
              key={item}
              className="inline-flex max-w-full items-center gap-2 border border-line bg-mist px-3 py-2 text-xs font-medium text-ink"
            >
              <span className="break-words">{item}</span>

              <button
                type="button"
                onClick={() => onRemove(item)}
                className="focus-ring text-base leading-none text-slate-400 hover:text-ink"
                aria-label={`Remove ${item}`}
              >
                ×
              </button>
            </span>
          ))
        ) : (
          <span className="text-xs text-slate-400">Not added yet</span>
        )}
      </div>
    </div>
  )
}

function ProfileSummary({ profile, skills, roles }) {
  const education = asList(profile.education)

  const initials = displayValue(profile.name, 'Careerlyst')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <section className="border border-line bg-white p-6 sm:p-8">
      <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4 sm:gap-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center bg-forest text-xl font-semibold text-white">
            {initials}
          </span>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest">
              Profile summary
            </p>

            <h1 className="mt-2 font-display text-3xl tracking-[-0.04em] text-ink">
              {displayValue(profile.name)}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Your resume-based career profile
            </p>
          </div>
        </div>

        <div className="grid gap-4 text-sm sm:grid-cols-2 lg:min-w-[430px]">
          <div>
            <p className="text-xs text-slate-400">Education</p>
            <p className="mt-1 font-medium leading-6 text-ink">
              {education.length ? education.join(' • ') : 'Not available'}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Target roles</p>
            <p className="mt-1 font-medium leading-6 text-ink">
              {roles.length ? roles.join(' • ') : 'Not available'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-7 border-t border-line pt-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
          Skills
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {skills.length ? (
            skills.map((skill) => (
              <span
                key={skill}
                className="border border-line bg-mist px-3 py-2 text-xs font-medium text-ink"
              >
                {skill}
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-500">Not available</span>
          )}
        </div>
      </div>
    </section>
  )
}

function PreferencesForm({
  preferences,
  setPreferences,
  onSave,
  onReset,
  saveMessage,
  messageType,
}) {
  const updateList = (key, nextValue) => {
    setPreferences((current) => ({
      ...current,
      [key]: nextValue,
    }))
  }

  const removeItem = (key, item) => {
    updateList(
      key,
      preferences[key].filter((value) => value !== item)
    )
  }

  return (
    <section className="border border-line bg-white p-6 sm:p-8">
      <div className="flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Personalization</p>

          <h2 className="mt-2 font-display text-3xl tracking-[-0.04em] text-ink">
            Career Preferences
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Shape the opportunities Careerlyst surfaces for you. These
            preferences stay on this device.
          </p>
        </div>

        <span className="text-xs text-slate-400">Local preferences</span>
      </div>

      <div className="mt-7 grid gap-7 lg:grid-cols-2">
        <TagInput
          label="Preferred roles"
          values={preferences.preferredRoles}
          placeholder="e.g. Data Science Intern"
          onAdd={(item) =>
            updateList('preferredRoles', [
              ...preferences.preferredRoles,
              item,
            ])
          }
          onRemove={(item) => removeItem('preferredRoles', item)}
        />

        <TagInput
          label="Preferred locations"
          values={preferences.preferredLocations}
          placeholder="e.g. Remote or Bengaluru"
          onAdd={(item) =>
            updateList('preferredLocations', [
              ...preferences.preferredLocations,
              item,
            ])
          }
          onRemove={(item) => removeItem('preferredLocations', item)}
        />
      </div>

      <div className="mt-8 grid gap-7 border-t border-line pt-7 lg:grid-cols-2">
        <fieldset>
          <legend className="text-sm font-semibold text-ink">
            Work mode
          </legend>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
            {['Remote', 'Hybrid', 'On-site'].map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 text-sm text-slate-600"
              >
                <input
                  type="radio"
                  name="work-mode"
                  value={option}
                  checked={preferences.workMode === option}
                  onChange={(event) =>
                    updateList('workMode', event.target.value)
                  }
                  className="h-4 w-4 accent-forest"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-ink">
            Opportunity type
          </legend>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
            {['Internship', 'Full-time', 'Both'].map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 text-sm text-slate-600"
              >
                <input
                  type="radio"
                  name="opportunity-type"
                  value={option}
                  checked={preferences.opportunityType === option}
                  onChange={(event) =>
                    updateList('opportunityType', event.target.value)
                  }
                  className="h-4 w-4 accent-forest"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-8 border-t border-line pt-7">
        <TagInput
          label="Skills"
          values={preferences.skills}
          placeholder="e.g. Python"
          onAdd={(item) =>
            updateList('skills', [...preferences.skills, item])
          }
          onRemove={(item) => removeItem('skills', item)}
        />
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onReset}
          className="focus-ring w-fit text-sm font-semibold text-slate-500 underline decoration-line underline-offset-4 hover:text-ink"
        >
          Reset Preferences
        </button>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          {saveMessage && (
            <span
              className={`text-xs font-medium ${
                messageType === 'error' ? 'text-red-600' : 'text-forest'
              }`}
              role="status"
            >
              {saveMessage}
            </span>
          )}

          <button
            type="button"
            onClick={onSave}
            className="focus-ring bg-forest px-6 py-3.5 text-sm font-semibold text-white hover:bg-forest-dark"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </section>
  )
}

function ProfilePage() {
  const result = getAnalysisResult()

  const profile =
    result?.profile &&
    typeof result.profile === 'object' &&
    !Array.isArray(result.profile)
      ? result.profile
      : {}

  const defaults = getDefaultPreferences(profile)

  const [preferences, setPreferences] = useState(() =>
    getInitialPreferences(profile)
  )

  const [saveMessage, setSaveMessage] = useState('')
  const [messageType, setMessageType] = useState('success')

  const savePreferences = () => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
      setMessageType('success')
      setSaveMessage('Preferences saved')
    } catch (error) {
      console.error('Could not save preferences:', error)
      setMessageType('error')
      setSaveMessage('Could not save preferences. Check browser storage.')
    }
  }

  const resetPreferences = () => {
    try {
      localStorage.removeItem(PREFERENCES_KEY)
      setPreferences(defaults)
      setMessageType('success')
      setSaveMessage('Preferences reset')
    } catch (error) {
      console.error('Could not reset preferences:', error)
      setMessageType('error')
      setSaveMessage('Could not reset preferences. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-mist text-ink">
      <ProductNav active="profile" />

      <main className="section-wrap pb-20 sm:pb-24">
        <section className="py-12 sm:py-16">
          <p className="eyebrow mb-4">Your career profile</p>

          <h1 className="font-display text-4xl leading-tight tracking-[-0.045em] text-ink sm:text-5xl">
            View and edit your profile
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Keep your preferences current so your opportunity feed stays
            relevant.
          </p>
        </section>

        <div className="mx-auto max-w-5xl space-y-6">
          <ProfileSummary
            profile={profile}
            skills={preferences.skills}
            roles={preferences.preferredRoles}
          />

          <PreferencesForm
            preferences={preferences}
            setPreferences={setPreferences}
            onSave={savePreferences}
            onReset={resetPreferences}
            saveMessage={saveMessage}
            messageType={messageType}
          />
        </div>
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

export default ProfilePage