from fastapi import FastAPI, UploadFile, File
import pymupdf

from ai.profile_extractor import extract_profile
from ai.job_preferences import generate_job_preferences
from ai.opportunity_search import search_opportunities
from ai.matcher import match_opportunities

app = FastAPI()


@app.get("/")
def home():
    return {
        "message": "Careerlyst backend is running!"
    }


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):

    content = await file.read()

    pdf = pymupdf.open(
        stream=content,
        filetype="pdf"
    )

    text = ""

    for page in pdf:
        text += page.get_text()

    pdf.close()

    profile = extract_profile(text)
    job_preferences = generate_job_preferences(profile)
    opportunities = search_opportunities(job_preferences)
    matched_opportunities = match_opportunities(
    profile,
    opportunities
)

    return {
        "filename": file.filename,
        "profile": profile,
        "job_preferences": job_preferences,
        "matched_opportunities": matched_opportunities,
        "opportunities": opportunities
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000
        )