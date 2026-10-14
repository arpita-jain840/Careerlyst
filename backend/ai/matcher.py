from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

from ai.opportunity_analyzer import analyze_opportunity

model = SentenceTransformer("all-MiniLM-L6-v2")

TOP_N = 20
AI_ANALYSIS_LIMIT = 5


def safe_list(value):
    """Return a list of strings, or an empty list."""
    if not isinstance(value, list):
        return []

    return [str(item) for item in value if item is not None]


def create_candidate_text(profile):
    return f"""
    Skills: {", ".join(safe_list(profile.get("skills")))}
    Education: {", ".join(safe_list(profile.get("education")))}
    Projects: {", ".join(safe_list(profile.get("projects")))}
    Experience: {", ".join(safe_list(profile.get("experience")))}
    Target Roles: {", ".join(safe_list(profile.get("target_roles")))}
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

    opportunity_texts = [
        create_opportunity_text(item)
        for item in opportunities
    ]

    # Encode all opportunities together for efficiency.
    candidate_embedding = model.encode([candidate_text])
    opportunity_embeddings = model.encode(opportunity_texts)

    similarities = cosine_similarity(
        candidate_embedding,
        opportunity_embeddings
    )[0]

    results = []

    for opportunity, similarity in zip(opportunities, similarities):
        item = opportunity.copy()

        semantic_score = max(0.0, min(100.0, float(similarity) * 100))

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
    results.sort(
        key=lambda item: item["semantic_score"],
        reverse=True
    )
    results = results[:TOP_N]

    # Run detailed AI analysis only for the top opportunities.
    for opportunity in results[:AI_ANALYSIS_LIMIT]:
        analysis = analyze_opportunity(profile, opportunity)

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

    results.sort(
        key=lambda item: item["match_score"],
        reverse=True
    )

    return results
