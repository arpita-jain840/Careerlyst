const statusOptions = ['Applied', 'Interview', 'Offer', 'Rejected']

function formatDate(value, includeTime = false) {
  if (!value) return 'Not set'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Not set'
  return new Intl.DateTimeFormat(undefined, includeTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'medium' }).format(parsed)
}

function ApplicationCard({ application, onStatusChange, onEdit, onDelete, updating = false }) {
  const opportunity = application.opportunity || {}

  return (
    <article className="border border-line bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{opportunity.company || 'Company not available'}</p>
          <h2 className="mt-2 break-words text-lg font-semibold tracking-[-0.025em] text-ink">{opportunity.title || 'Role not available'}</h2>
          <p className="mt-2 break-words text-sm text-slate-500">{[opportunity.location, opportunity.work_mode, opportunity.platform].filter(Boolean).join(' • ') || 'Location, mode, and source not available'}</p>
        </div>
        <label className="block text-xs font-semibold text-slate-500">Application status<select value={application.status} disabled={updating} onChange={(event) => onStatusChange(application.id, event.target.value)} className="focus-ring mt-2 w-full border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink disabled:opacity-60 sm:w-auto"><option value="Saved">Saved</option>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></label>
      </div>

      <dl className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-3">
        <div><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{application.status === 'Saved' ? 'Added to tracker' : 'Application date'}</dt><dd className="mt-1.5 text-sm text-slate-600">{formatDate(application.application_date || (application.status === 'Saved' ? application.created_at : null))}</dd></div>
        <div><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Interview</dt><dd className="mt-1.5 text-sm text-slate-600">{formatDate(application.interview_at, true)}</dd></div>
        <div><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Follow-up</dt><dd className="mt-1.5 text-sm text-slate-600">{formatDate(application.follow_up_at, true)}</dd></div>
      </dl>
      {application.reminder_note && <p className="mt-4 border-l-2 border-forest/40 pl-3 text-sm leading-6 text-slate-600"><span className="font-semibold text-ink">Reminder note:</span> {application.reminder_note}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-line pt-4">
        <button type="button" onClick={() => onEdit(application)} className="focus-ring text-sm font-semibold text-forest underline decoration-forest/30 underline-offset-4 hover:text-forest-dark">Edit</button>
        <button type="button" onClick={() => onDelete(application)} className="focus-ring text-sm font-semibold text-slate-500 underline decoration-line underline-offset-4 hover:text-red-700">Remove</button>
        {opportunity.url && <a href={opportunity.url} target="_blank" rel="noreferrer" className="focus-ring ml-auto text-sm font-semibold text-slate-600 hover:text-ink">Open source</a>}
      </div>
    </article>
  )
}

export default ApplicationCard
