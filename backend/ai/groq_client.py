"""Shared Groq client + helpers. Every other AI file imports from here.

Change the model without touching code: set GROQ_MODEL in .env
Example: GROQ_MODEL=openai/gpt-oss-20b
"""

import json
import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY")
MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

# max_retries: on 429 (rate limit) the SDK waits and retries by itself.
client = Groq(api_key=API_KEY, max_retries=4, timeout=60) if API_KEY else None


def _is_gpt_oss(model):
    return model.startswith("openai/gpt-oss")


def chat_json(system, user, schema, schema_name,
              max_tokens=3000, temperature=0.1):
    """Call the model and return the parsed JSON (dict)."""
    if client is None:
        raise RuntimeError("GROQ_API_KEY is missing from the backend .env file.")

    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]

    kwargs = {
        "model": MODEL,
        "temperature": temperature,
        "max_completion_tokens": max_tokens,
    }

    if _is_gpt_oss(MODEL):
        # Reasoning model: keep thinking short so tokens go to the answer.
        kwargs["reasoning_effort"] = "low"
        kwargs["response_format"] = {
            "type": "json_schema",
            "json_schema": {
                "name": schema_name,
                "strict": True,
                "schema": schema,
            },
        }
    else:
        # Other models: plain JSON mode, schema is described in the prompt.
        kwargs["response_format"] = {"type": "json_object"}
        messages[-1]["content"] += (
            "\n\nReturn ONE JSON object matching this JSON schema exactly:\n"
            + json.dumps(schema)
        )

    kwargs["messages"] = messages
    response = client.chat.completions.create(**kwargs)

    choice = response.choices[0]
    content = choice.message.content

    if not content:
        raise ValueError(
            f"Model returned an empty response "
            f"(finish_reason={choice.finish_reason}). "
            "If this says 'length', increase max_tokens."
        )

    try:
        return json.loads(content)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"Model returned invalid JSON "
            f"(finish_reason={choice.finish_reason})."
        ) from exc


def clean_list(value, limit=None, max_len=300):
    """Keep non-empty strings only, trim, remove duplicates."""
    if not isinstance(value, list):
        return []

    seen = set()
    result = []

    for item in value:
        if not isinstance(item, str):
            continue
        item = item.strip()[:max_len]
        key = item.lower()
        if item and key not in seen:
            seen.add(key)
            result.append(item)

    return result[:limit] if limit else result