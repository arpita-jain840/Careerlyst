import json
import os
import time
from urllib.parse import urlparse

from ai.groq_client import client

# browser_search works only with the gpt-oss models on Groq,
# so search has its own model setting (separate from GROQ_MODEL).
SEARCH_MODEL = os.getenv("GROQ_SEARCH_MODEL", "openai/gpt-oss-20b")

MAX_QUERIES = 3          # queries per upload (each one is a separate call)
RESULTS_PER_QUERY = 6    # listings asked from each query
MAX_RESULTS = 12         # final list size
DELAY_SECONDS = 2        # gap between calls (avoids tokens-per-minute spikes)
CACHE_TTL_SECONDS = 6 * 60 * 60

REQUIRED_FIELDS = ["title", "company", "platform",
                   "location", "description", "url"]

# query -> (time, results). Lives in memory until the server restarts.
_CACHE = {}


def _extract_json_array(content):
    """Pull the JSON array out of the model's text (handles ``` fences)."""
    start = content.find("[")
    end = content.rfind("]")

    if start == -1 or end == -1 or end <= start:
        return []

    try:
        data = json.loads(content[start:end + 1])
    except json.JSONDecodeError as exc:
        raise ValueError("Search returned invalid JSON.") from exc

    return data if isinstance(data, list) else []


def _search_one(query):
    """One web search = one API call. Returns a list of raw dicts."""
    key = query.strip().lower()
    cached = _CACHE.get(key)

    if cached and time.time() - cached[0] < CACHE_TTL_SECONDS:
        return cached[1]

    prompt = f"""
Search the web for real internship listings for students in India.

Search query: {query}

Return ONLY a JSON array with at most {RESULTS_PER_QUERY} items.
Each item must have exactly these string fields:
title, company, platform, location, description, url

Rules:
- Use real web search results, not memory or guesses.
- Prefer the original listing or application URL.
- Never invent a company, listing or URL.
- Skip any listing without a credible https URL.
- description: one short sentence.
- If nothing credible is found, return [].
- No Markdown, no text outside the JSON array.
"""

    response = client.chat.completions.create(
        model=SEARCH_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You search the web for real internship listings. "
                    "Never invent results. Return only a JSON array."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        tools=[{"type": "browser_search"}],
        tool_choice="required",
        reasoning_effort="low",
        temperature=0.2,
        max_completion_tokens=4000,
    )

    choice = response.choices[0]
    content = (choice.message.content or "").strip()

    if not content:
        raise ValueError(
            f"Empty search response (finish_reason={choice.finish_reason})."
        )

    items = _extract_json_array(content)

    if items:
        _CACHE[key] = (time.time(), items)

    return items


def _clean(items):
    """Validate listings, remove duplicates, keep only https URLs."""
    cleaned = []
    seen_urls = set()

    for item in items:
        if not isinstance(item, dict):
            continue

        if any(
            not isinstance(item.get(field), str) or not item[field].strip()
            for field in REQUIRED_FIELDS
        ):
            continue

        item = {field: item[field].strip() for field in REQUIRED_FIELDS}

        try:
            parsed = urlparse(item["url"])
        except ValueError:
            continue

        if parsed.scheme != "https" or not parsed.hostname:
            continue

        if "." not in parsed.hostname:
            continue

        normalized = item["url"].rstrip("/").lower()

        if normalized in seen_urls:
            continue

        seen_urls.add(normalized)
        item["description"] = item["description"][:400]
        cleaned.append(item)

        if len(cleaned) >= MAX_RESULTS:
            break

    return cleaned


def search_opportunities(job_preferences):
    if client is None:
        raise RuntimeError("GROQ_API_KEY is missing from the backend .env file.")

    queries = job_preferences.get("search_queries", [])

    if not isinstance(queries, list):
        return []

    queries = [str(q).strip() for q in queries if str(q).strip()]
    queries = queries[:MAX_QUERIES]

    if not queries:
        return []

    all_items = []
    succeeded = 0
    last_error = None

    for index, query in enumerate(queries):
        if index > 0:
            time.sleep(DELAY_SECONDS)

        try:
            all_items.extend(_search_one(query))
            succeeded += 1
        except Exception as exc:
            # One failed query must not kill the others.
            last_error = exc
            print(f"[opportunity_search] query failed '{query}': {exc}")

    # Every query failed -> tell the caller (e.g. rate limit), don't hide it.
    if succeeded == 0 and last_error is not None:
        raise RuntimeError(
            f"Internship search failed for all queries: {last_error}"
        ) from last_error

    return _clean(all_items)