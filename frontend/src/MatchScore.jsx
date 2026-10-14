
function Score({ label, value }) {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value)
  ) {
    return null
  }

  return (
    <span>
      {label}: {value.toFixed(1)}%
    </span>
  )
}

function MatchScore({ opportunity }) {
  const matchScore = opportunity.match_score
  const semanticScore = opportunity.semantic_score
  const skillScore = opportunity.skill_score
  const isPending = opportunity.analysis_status === 'pending'

  const hasMatchScore =
    typeof matchScore === 'number' && Number.isFinite(matchScore)

  const hasSemanticScore =
    typeof semanticScore === 'number' && Number.isFinite(semanticScore)

  const hasSkillScore =
    typeof skillScore === 'number' && Number.isFinite(skillScore)

  return (
    <div className="shrink-0 text-right text-forest">
      {hasMatchScore ? (
        <p className="text-base font-bold tracking-[-0.02em]">
          {matchScore.toFixed(1)}% Match
        </p>
      ) : hasSemanticScore ? (
        <p className="text-base font-bold tracking-[-0.02em]">
          {semanticScore.toFixed(1)}% Semantic Match
        </p>
      ) : (
        <p className="text-sm font-semibold text-slate-500">
          Match score unavailable
        </p>
      )}

      {isPending && (
        <p className="mt-1 text-[10px] font-medium text-slate-500">
          Detailed analysis pending
        </p>
      )}

      {(hasSemanticScore || hasSkillScore) && (
        <div className="mt-1 flex flex-col text-[10px] font-medium leading-4 text-slate-500">
          <Score label="Semantic Match" value={semanticScore} />
          {!isPending && (
            <Score label="Skill Match" value={skillScore} />
          )}
        </div>
      )}
    </div>
  )
}

export default MatchScore
