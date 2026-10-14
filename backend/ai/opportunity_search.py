import os
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def search_opportunities(job_preferences):
    queries = job_preferences.get("search_queries", [])

    prompt = f"""
You are an internship discovery system.

Search the web for real internship opportunities using these queries:
{json.dumps(queries)}

Search for opportunities relevant to students in India.
Consider Internshala, Wellfound,Glassdoor, LinkedIn, Indeed, Unstop,
AICTE, government internship portals, and company career pages.

Return ONLY a valid JSON array of opportunities.
Each item must have these fields:
- title
- company
- platform
- location
- description
- url

Rules:
- Include only opportunities supported by actual web search results.
- Use the original listing or application URL when available.
- Never invent companies, listings, URLs, eligibility, or details.
- Exclude results when you cannot identify a credible listing URL.
- Avoid duplicates.
- Return at most 20 opportunities.
- If no suitable opportunities are found, return [].
- Do not include Markdown fences or extra text.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": (
                    "Find real opportunities through web search. "
                    "Never fabricate listings or URLs. "
                    "Return only the requested JSON array."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        tools=[{"type": "browser_search"}],
        tool_choice="required",
        temperature=0.2,
        max_completion_tokens=4096,
    )

    content = response.choices[0].message.content

    if not content:
        raise ValueError("Groq returned an empty opportunity search response.")

    # Handle accidental Markdown fences, if returned.
    content = content.strip()
    if content.startswith("```"):
        content = content.split("\n", 1)[-1]
        if content.endswith("```"):
            content = content[:-3].strip()
        if content.startswith("json"):
            content = content[4:].strip()

    opportunities = json.loads(content)

    if not isinstance(opportunities, list):
        raise ValueError("Opportunity search did not return a JSON list.")

    return opportunities