from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

from ai.opportunity_analyzer import analyze_opportunity


model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


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

    candidate_text = create_candidate_text(profile)

    candidate_embedding = model.encode(
        [candidate_text]
    )

    results = []

    for opportunity in opportunities:

        # -----------------------------
        # 1. Semantic similarity
        # -----------------------------

        opportunity_text = create_opportunity_text(
            opportunity
        )

        opportunity_embedding = model.encode(
            [opportunity_text]
        )

        similarity = cosine_similarity(
            candidate_embedding,
            opportunity_embedding
        )[0][0]

        semantic_score = float(similarity) * 100

        # -----------------------------
        # 2. AI opportunity analysis
        # -----------------------------

        analysis = analyze_opportunity(
            profile,
            opportunity
        )

        opportunity["eligible"] = analysis["eligible"]

        opportunity["matched_skills"] = (
            analysis["matched_skills"]
        )

        opportunity["missing_skills"] = (
            analysis["missing_skills"]
        )

        opportunity["requirements"] = (
            analysis["requirements"]
        )

        opportunity["why_match"] = (
            analysis["why_match"]
        )

        opportunity["skill_gap"] = (
            analysis["skill_gap"]
        )

        # -----------------------------
        # 3. Skill match score
        # -----------------------------

        matched_count = len(
            opportunity["matched_skills"]
        )

        missing_count = len(
            opportunity["missing_skills"]
        )

        total_skills = (
            matched_count + missing_count
        )

        if total_skills > 0:
            skill_score = (
                matched_count / total_skills
            ) * 100
        else:
            skill_score = 0

        # -----------------------------
        # 4. Final score
        # -----------------------------

        final_score = (
            semantic_score * 0.70
            + skill_score * 0.30
        )

        # If candidate doesn't appear eligible,
        # don't let the opportunity rank too highly.
        if not opportunity["eligible"]:
            final_score *= 0.60

        opportunity["semantic_score"] = round(
            semantic_score,
            2
        )

        opportunity["skill_score"] = round(
            skill_score,
            2
        )

        opportunity["match_score"] = round(
            final_score,
            2
        )

        results.append(opportunity)

    # -----------------------------
    # 5. Sort opportunities
    # -----------------------------

    results.sort(
        key=lambda x: x["match_score"],
        reverse=True
    )

    return results[:20]