import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def search_opportunities(job_preferences):

    queries = job_preferences["search_queries"]

    prompt = f"""
You are an AI internship discovery system.

Find real and currently available internship opportunities
for these search queries:

{queries}

Focus on opportunities from platforms such as:
- Internshala
- Wellfound
- LinkedIn
- Indeed
- Unstop
- Glassdoor
- AICTE Internship Portal
- Government internship portals
- Company career pages

Return ONLY opportunities that you can find from web search.

For each opportunity provide:

- title
- company
- platform/source
- location
- short description
- url

Do not invent companies, jobs or URLs.

Search queries:
{queries}
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            tools=[
                types.Tool(
                    google_search=types.GoogleSearch()
                )
            ]
        )
    )

    return response.text