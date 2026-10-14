
import os
import json
from urllib.parse import urlparse

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key) if api_key else None


def search_opportunities(job_preferences):
    if client is None:
        raise RuntimeError("GROQ_API_KEY is missing from the backend .env file.")

    queries = job_preferences.get("search_queries", [])

    if not isinstance(queries, list) or not queries:
        return []

    # Limit prompt size to reduce token usage.
    queries = [str(q).strip() for q in queries[:5] if str(q).strip()]

    prompt = f"""
Find real internship listings on the web for students in India.

Search queries:
{json.dumps(queries, ensure_ascii=False)}

Return ONLY a JSON array with at most 12 opportunities.
Each item must contain:
title, company, platform, location, description, url

Rules:
- Use actual web search results, not memory or guesses.
- Prefer original application/listing URLs.
- Never invent a company, listing, URL, or eligibility requirement.
- Exclude listings without a credible source URL.
- Keep descriptions to one short sentence.
- Avoid duplicate listings.
- If no credible results are found, return [].
- Do not use Markdown fences or extra text.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": (
                    "Search the web for real internship listings. "
                    "Never invent results. Return only a JSON array."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        tools=[{"type": "browser_search"}],
        tool_choice="required",
        temperature=0.2,
        max_completion_tokens=2048,
    )

    content = response.choices[0].message.content

    if not content:
        raise ValueError("Groq returned an empty search response.")

    content = content.strip()

    # Remove optional Markdown fences.
    if content.startswith("```"):
        content = content.split("\n", 1)[-1].strip()
        if content.endswith("```"):
            content = content[:-3].strip()
        if content.lower().startswith("json"):
            content = content[4:].strip()

    try:
        opportunities = json.loads(content)
    except json.JSONDecodeError as exc:
        raise ValueError(
            "Groq returned invalid JSON for internship search."
        ) from exc

    if not isinstance(opportunities, list):
        raise ValueError("Search response must be a JSON array.")

    cleaned = []
    seen_urls = set()

    for item in opportunities:
        if not isinstance(item, dict):
            continue

        required_fields = [
            "title", "company", "platform",
            "location", "description", "url"
        ]

        if any(
            not isinstance(item.get(field), str) or not item[field].strip()
            for field in required_fields
        ):
            continue

        url = item["url"].strip()

        try:
            parsed = urlparse(url)
        except ValueError:
            continue

        if parsed.scheme != "https" or not parsed.netloc:
            continue

        if parsed.hostname is None or "." not in parsed.hostname:
            continue

        normalized_url = url.rstrip("/").lower()

        if normalized_url in seen_urls:
            continue

        seen_urls.add(normalized_url)

        item["url"] = url
        cleaned.append(item)

        if len(cleaned) >= 12:
            break

    return cleaned
