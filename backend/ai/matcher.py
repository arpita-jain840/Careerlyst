from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

from ai.opportunity_analyzer import analyze_opportunities

model = SentenceTransformer("all-MiniLM-L6-v2")

TOP_N = 20
AI_ANALYSIS_LIMIT = 5

# Raw cosine similarity between a resume and a job is usually 0.2 - 0.5,
# which would show as a low "20-50% match". We map 0.15 -> 0% and
# 0.65 -> 100% so the percentage looks more natural. Tune if needed.
SIMILARITY_LOW = 0.15
SIMILARITY_HIGH = 0.65


def safe_list(value, limit=None, max_len=200):
    """Return a list of strings, or an empty list."""
    if not isinstance(value, list):
        return []

    items = [str(item)[:max_len] for item in value if item is not None]
    return items[:limit] if limit else items


def to_percent(similarity):
    scaled = (similarity - SIMILARITY_LOW) / (SIMILARITY_HIGH - SIMILARITY_LOW)
    return max(0.0, min(100.0, float(scaled) * 100))


def create_candidate_text(profile):
    # all-MiniLM-L6-v2 reads only about the first 256 tokens, so the most
    # important parts (roles, skills, interests) must come first.
    return f"""
    Target Roles: {", ".join(safe_list(profile.get("target_roles"), 5))}
    Skills: {", ".join(safe_list(profile.get("skills"), 25, 60))}
    Interests: {", ".join(safe_list(profile.get("interests"), 5, 60))}
    Projects: {", ".join(safe_list(profile.get("projects"), 4, 150))}
    Experience: {", ".join(safe_list(profile.get("experience"), 3, 150))}
    Education: {", ".join(safe_list(profile.get("education"), 2, 100))}
    """


def create_opportunity_text(opportunity):
    return f"""
    Job Title: {opportunity.get("title", "")}
    Company: {opportunity.get("company", "")}
    Location: {opportunity.get("location", "")}
    Description: {opportunity.get("description", "")}
    Requirements: {opportunity.get("requirements", "")}
    """


def match_opportunities(profile, opportunities):
    if not opportunities:
        return []

    candidate_text = create_candidate_text(profile)
    opportunity_texts = [create_opportunity_text(o) for o in opportunities]

    # Encode all opportunities together for efficiency.
    candidate_embedding = model.encode([candidate_text])
    opportunity_embeddings = model.encode(opportunity_texts)

    similarities = cosine_similarity(
        candidate_embedding, opportunity_embeddings
    )[0]

    results = []

    for opportunity, similarity in zip(opportunities, similarities):
        item = opportunity.copy()
        semantic_score = to_percent(similarity)

        item.update({
            "semantic_score": round(semantic_score, 2),
            "skill_score": None,
            "match_score": round(semantic_score, 2),
            "eligible": None,
            "matched_skills": [],
            "missing_skills": [],
            "requirements": [],
            "why_match": "",
            "skill_gap": "",
            "analysis_status": "pending",
        })

        results.append(item)

    # Keep the most semantically relevant opportunities.
    results.sort(key=lambda item: item["semantic_score"], reverse=True)
    results = results[:TOP_N]

    # ONE AI call analyzes all top opportunities together.
    top = results[:AI_ANALYSIS_LIMIT]

    try:
        analyses = analyze_opportunities(profile, top)
    except Exception as exc:
        print(f"[matcher] AI analysis failed: {exc}")
        analyses = [None] * len(top)

    for opportunity, analysis in zip(top, analyses):
        if analysis is None:
            # Keep the semantic score; frontend shows "not available".
            opportunity["analysis_status"] = "failed"
            continue

        opportunity.update({
            "eligible": analysis["eligible"],
            "matched_skills": analysis["matched_skills"],
            "missing_skills": analysis["missing_skills"],
            "requirements": analysis["requirements"],
            "why_match": analysis["why_match"],
            "skill_gap": analysis["skill_gap"],
            "analysis_status": "completed",
        })

        matched_count = len(opportunity["matched_skills"])
        missing_count = len(opportunity["missing_skills"])
        total_skills = matched_count + missing_count
        semantic_score = opportunity["semantic_score"]

        if total_skills > 0:
            skill_score = matched_count / total_skills * 100
            final_score = semantic_score * 0.70 + skill_score * 0.30
            opportunity["skill_score"] = round(skill_score, 2)
        else:
            # No skill evidence: avoid assigning an artificial zero.
            final_score = semantic_score

        if opportunity["eligible"] is False:
            final_score *= 0.60

        opportunity["match_score"] = round(final_score, 2)

    results.sort(key=lambda item: item["match_score"], reverse=True)

    return results