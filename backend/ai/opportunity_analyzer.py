
import os
import json

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key) if api_key else None


def analyze_opportunity(profile, opportunity):
    if client is None:
        raise RuntimeError(
            "GROQ_API_KEY is missing from the backend .env file."
        )

    if not isinstance(profile, dict) or not isinstance(opportunity, dict):
        raise ValueError("Profile and opportunity must be valid objects.")

    # Send only the information needed for matching.
    profile_fields = [
        "skills",
        "education",
        "graduation_year",
        "projects",
        "experience",
        "certifications",
        "target_roles",
    ]

    opportunity_fields = [
        "title",
        "company",
        "location",
        "description",
        "requirements",
        "eligibility",
    ]

    compact_profile = {
        key: profile[key]
        for key in profile_fields
        if key in profile
    }

    compact_opportunity = {
        key: str(opportunity[key])[:1800]
        for key in opportunity_fields
        if key in opportunity and opportunity[key] is not None
    }

    prompt = f"""
Analyze this internship's fit for the candidate.

CANDIDATE:
{json.dumps(compact_profile, ensure_ascii=False)}

INTERNSHIP:
{json.dumps(compact_opportunity, ensure_ascii=False)}

Return one JSON object with exactly these fields:
{{
  "eligible": true,
  "matched_skills": [],
  "missing_skills": [],
  "requirements": [],
  "why_match": "",
  "skill_gap": ""
}}

Rules:
- Use only evidence in the supplied candidate and internship data.
- Never invent skills, experience, qualifications, or requirements.
- matched_skills: relevant skills demonstrated by the candidate.
- missing_skills: important listing skills not demonstrated by the candidate.
- requirements: only requirements explicitly stated in the listing.
- why_match: one or two concise sentences explaining the fit.
- skill_gap: concise, practical learning suggestions based on actual gaps.
- eligible must be true only when available evidence supports eligibility.
- eligible must be false only when evidence clearly shows the candidate
  does not meet a stated requirement.
- If eligibility cannot be determined, set eligible to null.
- Do not treat missing resume information as proof of ineligibility.
- Return JSON only, without Markdown.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a careful internship matching assistant. "
                    "Use evidence only and represent uncertainty honestly."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
        max_completion_tokens=1000,
    )

    content = response.choices[0].message.content

    if not content:
        raise ValueError("Groq returned an empty opportunity analysis.")

    try:
        analysis = json.loads(content)
    except json.JSONDecodeError as exc:
        raise ValueError(
            "Groq returned invalid JSON for opportunity analysis."
        ) from exc

    if not isinstance(analysis, dict):
        raise ValueError("Opportunity analysis must be a JSON object.")

    required_fields = [
        "eligible",
        "matched_skills",
        "missing_skills",
        "requirements",
        "why_match",
        "skill_gap",
    ]

    if any(field not in analysis for field in required_fields):
        raise ValueError("Opportunity analysis is missing required fields.")

    if analysis["eligible"] not in (True, False, None):
        analysis["eligible"] = None

    for field in ["matched_skills", "missing_skills", "requirements"]:
        if not isinstance(analysis[field], list):
            analysis[field] = []

        analysis[field] = [
            item.strip()
            for item in analysis[field]
            if isinstance(item, str) and item.strip()
        ]

    for field in ["why_match", "skill_gap"]:
        if not isinstance(analysis[field], str):
            analysis[field] = ""

    return analysis
