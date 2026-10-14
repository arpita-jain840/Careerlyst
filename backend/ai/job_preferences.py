import json
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def generate_job_preferences(profile):

    schema = {
        "type": "object",
        "properties": {
            "preferred_roles": {
                "type": "array",
                "items": {
                    "type": "string"
                }
            },
            "search_queries": {
                "type": "array",
                "items": {
                    "type": "string"
                }
            },
            "related_roles": {
                "type": "array",
                "items": {
                    "type": "string"
                }
            }
        },
        "required": [
            "preferred_roles",
            "search_queries",
            "related_roles"
        ],
        "additionalProperties": False
    }

    prompt = f"""
You are an AI career opportunity discovery system.

Based ONLY on this candidate profile:

{json.dumps(profile, indent=2)}

Generate the most relevant internship/job preferences for this candidate.

Rules:
- Do not invent skills or qualifications.
- Give 8-12 relevant roles.
- Include roles that are semantically related, not only exact skill matches.
- Search queries should be useful for finding real internships online.
- related_roles can include adjacent opportunities the candidate may
  not have explicitly considered.

Do not add information that is not supported by the candidate profile.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",

        messages=[
            {
                "role": "system",
                "content": """
You are an AI career opportunity discovery system.
Generate accurate, structured job preferences from the candidate profile.
Never invent candidate qualifications.
"""
            },
            {
                "role": "user",
                "content": prompt
            }
        ],

        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "job_preferences",
                "strict": True,
                "schema": schema
            }
        }
    )

    return json.loads(
        response.choices[0].message.content
    )