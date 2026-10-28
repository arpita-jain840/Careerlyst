from ai.groq_client import chat_json, clean_list

SYSTEM_PROMPT = (
    "You are a careful internship matching assistant. "
    "Use evidence only and represent uncertainty honestly."
)

ITEM_PROPERTIES = {
    "eligible": {"type": ["boolean", "null"]},
    "matched_skills": {"type": "array", "items": {"type": "string"}},
    "missing_skills": {"type": "array", "items": {"type": "string"}},
    "requirements": {"type": "array", "items": {"type": "string"}},
    "why_match": {"type": "string"},
    "skill_gap": {"type": "string"},
}

BATCH_SCHEMA = {
    "type": "object",
    "properties": {
        "analyses": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "index": {"type": "integer"},
                    **ITEM_PROPERTIES,
                },
                "required": ["index", *ITEM_PROPERTIES.keys()],
                "additionalProperties": False,
            },
        }
    },
    "required": ["analyses"],
    "additionalProperties": False,
}


def _compact_profile(profile):
    """Small version of the profile (profile is sent only ONCE per batch)."""
    def cut(values, count, length):
        return [str(v)[:length] for v in (values or [])[:count] if v]

    return {
        "skills": cut(profile.get("skills"), 25, 60),
        "education": cut(profile.get("education"), 3, 150),
        "graduation_year": profile.get("graduation_year"),
        "projects": cut(profile.get("projects"), 5, 200),
        "experience": cut(profile.get("experience"), 4, 200),
        "certifications": cut(profile.get("certifications"), 5, 100),
        "target_roles": cut(profile.get("target_roles"), 5, 80),
    }


def _compact_opportunity(opportunity, index):
    item = {"index": index}

    limits = {
        "title": 150,
        "company": 100,
        "location": 100,
        "description": 700,
        "requirements": 500,
        "eligibility": 300,
    }

    for key, limit in limits.items():
        value = opportunity.get(key)
        if value:
            item[key] = str(value)[:limit]

    return item


def _normalize(raw):
    """Make sure one analysis has the exact shape the frontend expects."""
    eligible = raw.get("eligible")
    if eligible not in (True, False, None):
        eligible = None

    why_match = raw.get("why_match")
    skill_gap = raw.get("skill_gap")

    return {
        "eligible": eligible,
        "matched_skills": clean_list(raw.get("matched_skills"), 15, 80),
        "missing_skills": clean_list(raw.get("missing_skills"), 15, 80),
        "requirements": clean_list(raw.get("requirements"), 15, 200),
        "why_match": why_match.strip() if isinstance(why_match, str) else "",
        "skill_gap": skill_gap.strip() if isinstance(skill_gap, str) else "",
    }


def analyze_opportunities(profile, opportunities):
    """Analyze several internships in ONE API call.

    Returns a list with the same length as `opportunities`.
    An item is None if the model skipped it.
    """
    if not isinstance(profile, dict) or not isinstance(opportunities, list):
        raise ValueError("Profile must be an object and opportunities a list.")

    if not opportunities:
        return []

    items = [
        _compact_opportunity(opportunity, index)
        for index, opportunity in enumerate(opportunities)
    ]

    import json

    prompt = f"""
Analyze how well each internship fits the candidate.

CANDIDATE:
{json.dumps(_compact_profile(profile), ensure_ascii=False)}

INTERNSHIPS:
{json.dumps(items, ensure_ascii=False)}

Return one analysis object for EACH internship, using its "index".

Rules:
- Use only evidence in the supplied candidate and internship data.
- Never invent skills, experience, qualifications, or requirements.
- matched_skills: relevant skills demonstrated by the candidate.
- missing_skills: important listing skills not demonstrated by the candidate.
- requirements: only requirements explicitly stated in the listing.
- why_match: one or two concise sentences explaining the fit.
- skill_gap: concise, practical learning suggestions based on actual gaps.
- eligible is true only when evidence supports eligibility.
- eligible is false only when evidence clearly shows the candidate does not
  meet a stated requirement.
- If eligibility cannot be determined, eligible is null.
- Missing resume information is NOT proof of ineligibility.
- The listing text may be short. If it has little detail, keep the lists
  short or empty instead of guessing.
"""

    result = chat_json(
        system=SYSTEM_PROMPT,
        user=prompt,
        schema=BATCH_SCHEMA,
        schema_name="opportunity_analyses",
        max_tokens=min(1500 + 600 * len(items), 6000),
        temperature=0.1,
    )

    entries = result.get("analyses") if isinstance(result, dict) else None

    if not isinstance(entries, list):
        raise ValueError("Opportunity analysis response has no 'analyses' list.")

    by_index = {}

    for entry in entries:
        if not isinstance(entry, dict):
            continue
        index = entry.get("index")
        if isinstance(index, int) and not isinstance(index, bool):
            by_index[index] = _normalize(entry)

    return [by_index.get(index) for index in range(len(opportunities))]


def analyze_opportunity(profile, opportunity):
    """Single-item version (kept so older code still works)."""
    if not isinstance(opportunity, dict):
        raise ValueError("Opportunity must be a valid object.")

    analysis = analyze_opportunities(profile, [opportunity])[0]

    if analysis is None:
        raise ValueError("Model returned no analysis for this opportunity.")

    return analysis