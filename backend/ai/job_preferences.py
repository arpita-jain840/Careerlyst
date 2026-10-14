import json
import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key) if api_key else None


def generate_job_preferences(profile):
    if client is None:
        raise RuntimeError(
            "GROQ_API_KEY is missing from the backend .env file."
        )

    if not isinstance(profile, dict) or not profile:
        raise ValueError("A valid candidate profile is required.")

    # Keep only relevant profile fields to reduce prompt size.
    fields = [
        "skills",
        "education",
        "projects",
        "experience",
        "target_roles",
        "location",
        "interests",
    ]

    compact_profile = {}

    for field in fields:
        value = profile.get(field)

        if isinstance(value, list):
            compact_profile[field] = [
                str(item)[:250]
                for item in value[:8]
            ]
        elif isinstance(value, str):
            compact_profile[field] = value[:500]

    schema = {
        "type": "object",
        "properties": {
            "preferred_roles": {
                "type": "array",
                "items": {"type": "string"},
            },
            "search_queries": {
                "type": "array",
                "items": {"type": "string"},
            },
            "related_roles": {
                "type": "array",
                "items": {"type": "string"},
            },
        },
        "required": [
            "preferred_roles",
            "search_queries",
            "related_roles",
        ],
        "additionalProperties": False,
    }

    prompt = f"""
Based ONLY on this candidate profile:
{json.dumps(compact_profile, ensure_ascii=False)}

Generate internship discovery preferences for a student in India.

Rules:
- Do not invent candidate skills or qualifications.
- Return 8-12 relevant preferred roles.
- Return at most 5 concise web search queries.
- Return at most 5 adjacent related roles.
- Include relevant AI/ML, data science, or GenAI roles only
  when supported by the profile.
- Include suitable entry-level internships.
- Do not include explanations outside the JSON object.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": (
                    "Generate accurate internship search preferences "
                    "from the supplied profile. Never invent "
                    "candidate qualifications."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "job_preferences",
                "strict": True,
                "schema": schema,
            },
        },
        temperature=0.2,
        max_completion_tokens=1200,
    )

    content = response.choices[0].message.content

    if not content:
        raise ValueError(
            "Groq returned an empty job preferences response."
        )

    try:
        result = json.loads(content)
    except json.JSONDecodeError as exc:
        raise ValueError(
            "Groq returned invalid JSON for job preferences."
        ) from exc

    for field in (
        "preferred_roles",
        "search_queries",
        "related_roles",
    ):
        if not isinstance(result.get(field), list):
            raise ValueError(
                f"Invalid job preferences field: {field}"
            )

        result[field] = [
            item.strip()
            for item in result[field]
            if isinstance(item, str) and item.strip()
        ]

    result["preferred_roles"] = result["preferred_roles"][:12]
    result["search_queries"] = result["search_queries"][:5]
    result["related_roles"] = result["related_roles"][:5]

    return result
