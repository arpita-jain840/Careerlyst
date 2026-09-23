import os
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def extract_profile(resume_text):

    schema = {
        "type": "object",
        "properties": {
            "name": {
                "type": "string"
            },
            "education": {
                "type": "array",
                "items": {
                    "type": "string"
                }
            },
            "graduation_year": {
                "type": ["integer", "null"]
            },
            "skills": {
                "type": "array",
                "items": {
                    "type": "string"
                }
            },
            "projects": {
                "type": "array",
                "items": {
                    "type": "string"
                }
            },
            "experience": {
                "type": "array",
                "items": {
                    "type": "string"
                }
            },
            "certifications": {
                "type": "array",
                "items": {
                    "type": "string"
                }
            },
            "target_roles": {
                "type": "array",
                "items": {
                    "type": "string"
                }
            }
        },
        "required": [
            "name",
            "education",
            "graduation_year",
            "skills",
            "projects",
            "experience",
            "certifications",
            "target_roles"
        ],
        "additionalProperties": False
    }

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",

        messages=[
            {
                "role": "system",
                "content": """
You are an AI resume understanding system.

Extract the candidate profile from the resume.

Rules:
- Use ONLY information present in the resume.
- Never invent skills, projects, experience or qualifications.
- If information is missing, use an empty list or null.
- Infer target roles only from the candidate's actual skills,
  education, projects and experience.
"""
            },
            {
                "role": "user",
                "content": resume_text
            }
        ],

        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "candidate_profile",
                "strict": True,
                "schema": schema
            }
        }
    )

    return json.loads(response.choices[0].message.content)