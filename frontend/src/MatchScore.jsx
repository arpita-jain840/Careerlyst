function Score({ label, value }) {
  if (value === null || value === undefined || value === '') return null
  return <span>{label}: {value}%</span>
}

function MatchScore({ opportunity }) {
  const matchScore = opportunity.match_score ?? '—'
  const hasSecondaryScores = opportunity.semantic_score !== null && opportunity.semantic_score !== undefined || opportunity.skill_score !== null && opportunity.skill_score !== undefined

  return (
    <div className="shrink-0 text-right text-forest">
      <p className="text-base font-bold tracking-[-0.02em]">{matchScore === '—' ? 'Match score unavailable' : `${matchScore}% Match`}</p>
      {hasSecondaryScores && <div className="mt-1 flex flex-col text-[10px] font-medium leading-4 text-slate-500"><Score label="Semantic Match" value={opportunity.semantic_score} /><Score label="Skill Match" value={opportunity.skill_score} /></div>}
    </div>
  )
}

export default MatchScore
