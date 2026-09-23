import json
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def generate_job_preferences(profile):

    prompt = f"""
You are an AI career opportunity discovery system.

Based ONLY on this candidate profile:

{json.dumps(profile, indent=2)}

Generate the most relevant internship/job preferences for this candidate.

Return ONLY valid JSON:

{{
    "preferred_roles": [],
    "search_queries": [],
    "related_roles": []
}}

Rules:
- Do not invent skills or qualifications.
- Give 8-12 relevant roles.
- Include roles that are semantically related, not only exact skill matches.
- Search queries should be useful for finding real internships online.
- related_roles can include adjacent opportunities the candidate may not
  have explicitly considered.
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return json.loads(response.text)