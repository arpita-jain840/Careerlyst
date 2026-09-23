import os
import json

from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def analyze_opportunity(profile, opportunity):

    prompt = f"""
You are an AI internship matching assistant.

CANDIDATE PROFILE:
{json.dumps(profile, indent=2)}

INTERNSHIP:
{json.dumps(opportunity, indent=2)}

Analyze how well this opportunity matches the candidate.

Return ONLY valid JSON:

{{
    "eligible": true,
    "matched_skills": [],
    "missing_skills": [],
    "requirements": [],
    "why_match": "",
    "skill_gap": ""
}}

Rules:

1. Use ONLY information present in the candidate profile
   and internship information.

2. Never invent candidate skills, projects, experience,
   qualifications or achievements.

3. Never invent internship requirements.

4. matched_skills:
   List skills/requirements that clearly overlap.

5. missing_skills:
   List important skills mentioned in the internship
   that are not demonstrated in the candidate profile.

6. requirements:
   List the important requirements found in the internship.

7. why_match:
   Give a short explanation of why this opportunity
   matches the candidate's actual profile.

8. skill_gap:
   Explain what the candidate could improve or learn
   based on the missing skills.

9. eligible:
   Set true only when the available information
   indicates that the candidate can reasonably apply.

10. If important eligibility information is missing,
    explain that uncertainty instead of inventing it.
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return json.loads(response.text)