
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

from ai.opportunity_analyzer import analyze_opportunity

model = SentenceTransformer("all-MiniLM-L6-v2")

TOP_N = 20
AI_ANALYSIS_LIMIT = 5


def create_candidate_text(profile):
    return f"""
    Skills: {", ".join(profile.get("skills", []))}
    Education: {", ".join(profile.get("education", []))}
    Projects: {", ".join(profile.get("projects", []))}
    Experience: {", ".join(profile.get("experience", []))}
    Target Roles: {", ".join(profile.get("target_roles", []))}
    """


def create_opportunity_text(opportunity):
    return f"""
    Job Title: {opportunity.get("title", "")}
    Company: {opportunity.get("company", "")}
    Location: {opportunity.get("location", "")}
    Description: {opportunity.get("description", "")}
    """


def match_opportunities(profile, opportunities):
    if not opportunities:
        return []

    candidate_text = create_candidate_text(profile)

    opportunity_texts = [
        create_opportunity_text(item)
        for item in opportunities
    ]

    # Encode all opportunities together.
    candidate_embedding = model.encode([candidate_text])
    opportunity_embeddings = model.encode(opportunity_texts)

    similarities = cosine_similarity(
        candidate_embedding,
        opportunity_embeddings
    )[0]

    results = []

    for opportunity, similarity in zip(opportunities, similarities):
        item = opportunity.copy()
        semantic_score = max(0.0, float(similarity) * 100)

        item["semantic_score"] = round(semantic_score, 2)
        item["skill_score"] = None
        item["match_score"] = round(semantic_score, 2)

        # None means eligibility has not been assessed yet.
        item["eligible"] = None
        item["matched_skills"] = []
        item["missing_skills"] = []
        item["requirements"] = []
        item["why_match"] = ""
        item["skill_gap"] = ""
        item["analysis_status"] = "pending"

        results.append(item)

    # Rank by semantic relevance first.
    results.sort(
        key=lambda item: item["semantic_score"],
        reverse=True
    )

    # Keep the most relevant candidates.
    results = results[:TOP_N]

    # Use Groq only for the top 5 candidates.
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

        skill_score = (
            matched_count / total_skills * 100
            if total_skills else 0
        )

        semantic_score = opportunity["semantic_score"]

        final_score = (
            semantic_score * 0.70
            + skill_score * 0.30
        )

        if opportunity["eligible"] is False:
            final_score *= 0.60

        opportunity["skill_score"] = round(skill_score, 2)
        opportunity["match_score"] = round(final_score, 2)

    results.sort(
        key=lambda item: item["match_score"],
        reverse=True
    )

    return results