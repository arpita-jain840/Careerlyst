import json

from ai.groq_client import chat_json, clean_list

PROFILE_FIELDS = [
    "skills",
    "education",
    "projects",
    "experience",
    "target_roles",
    "location",
    "interests",
]

SCHEMA = {
    "type": "object",
    "properties": {
        "preferred_roles": {"type": "array", "items": {"type": "string"}},
        "search_queries": {"type": "array", "items": {"type": "string"}},
        "related_roles": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["preferred_roles", "search_queries", "related_roles"],
    "additionalProperties": False,
}

SYSTEM_PROMPT = (
    "Generate accurate internship search preferences from the supplied "
    "profile. Never invent candidate qualifications."
)


def _compact_profile(profile):
    """Keep only needed fields and cut long values (fewer tokens)."""
    compact = {}

    for field in PROFILE_FIELDS:
        value = profile.get(field)

        if isinstance(value, list):
            items = [str(item)[:250] for item in value[:8] if item]
            if items:
                compact[field] = items
        elif isinstance(value, str) and value.strip():
            compact[field] = value.strip()[:500]

    return compact


def _compact_user_preferences(user_preferences):
    """Optional details typed by the user on the Upload page."""
    if not isinstance(user_preferences, dict):
        return {}

    allowed = ("preferred_role", "preferred_location", "opportunity_type")
    result = {}

    for key in allowed:
        value = user_preferences.get(key)
        if isinstance(value, str) and value.strip():
            result[key] = value.strip()[:100]

    return result


def _fallback_preferences(profile, user_preferences):
    """Simple rule-based result, used only if the AI call fails."""
    roles = clean_list(profile.get("target_roles"), limit=12)

    if user_preferences.get("preferred_role"):
        roles.insert(0, user_preferences["preferred_role"])

    if not roles:
        roles = ["Software Intern"]

    location = (
        user_preferences.get("preferred_location")
        or (profile.get("location") or "")
    ).strip()

    queries = []
    for role in roles[:5]:
        query = role if "intern" in role.lower() else f"{role} internship"
        if location:
            query += f" {location}"
        queries.append(query.strip())

    return {
        "preferred_roles": roles[:12],
        "search_queries": queries[:5],
        "related_roles": [],
    }


def generate_job_preferences(profile, user_preferences=None):
    if not isinstance(profile, dict) or not profile:
        raise ValueError("A valid candidate profile is required.")

    compact_profile = _compact_profile(profile)
    preferences = _compact_user_preferences(user_preferences)

    prompt = f"""
Based ONLY on this candidate profile:
{json.dumps(compact_profile, ensure_ascii=False)}

Candidate's own preferences (optional, give these priority):
{json.dumps(preferences, ensure_ascii=False)}

Generate internship discovery preferences for a student in India.

Rules:
- Do not invent candidate skills or qualifications.
- Return 8-12 relevant preferred roles.
- Return at most 5 concise web search queries, each 3-8 words.
- If a location is available (profile or preferences), include it in
  most search queries. If the candidate prefers remote, use "remote".
- Return at most 5 adjacent related roles.
- Include AI/ML, data science, or GenAI roles only when supported by
  the profile.
- Include suitable entry-level internships.
- If opportunity_type is "Full-time", search for entry-level jobs
  instead of internships. If "Both", include both kinds.
- Do not include explanations outside the JSON object.
"""

    try:
        result = chat_json(
            system=SYSTEM_PROMPT,
            user=prompt,
            schema=SCHEMA,
            schema_name="job_preferences",
            max_tokens=2500,
            temperature=0.2,
        )
    except Exception as exc:
        # Do not break the whole upload flow because of this step.
        print(f"[job_preferences] AI call failed, using fallback: {exc}")
        return _fallback_preferences(profile, preferences)

    if not isinstance(result, dict):
        return _fallback_preferences(profile, preferences)

    cleaned = {
        "preferred_roles": clean_list(result.get("preferred_roles"), 12),
        "search_queries": clean_list(result.get("search_queries"), 5),
        "related_roles": clean_list(result.get("related_roles"), 5),
    }

    if not cleaned["search_queries"]:
        fallback = _fallback_preferences(profile, preferences)
        cleaned["search_queries"] = fallback["search_queries"]

    if not cleaned["preferred_roles"]:
        cleaned["preferred_roles"] = _fallback_preferences(
            profile, preferences
        )["preferred_roles"]

    return cleaned