from database import init_db
from contextlib import asynccontextmanager
from auth import router as auth_router
from applications import router as applications_router
import logging
import os
import pymupdf
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from ai.profile_extractor import extract_profile
from ai.job_preferences import generate_job_preferences
from ai.opportunity_search import search_opportunities
from ai.matcher import match_opportunities

app = FastAPI()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)
cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CAREERLYST_CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
app.include_router(auth_router)
app.include_router(applications_router)

logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@app.get("/")
def home():
    return {"message": "Careerlyst backend is running!"}


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    try:
        # Validate the uploaded file.
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail="Please upload your resume as a PDF file."
            )

        content = await file.read()

        if not content:
            raise HTTPException(
                status_code=400,
                detail="The uploaded PDF is empty."
            )

        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Resume file is too large. Please upload a PDF under 10 MB."
            )

        # Extract text from PDF.
        try:
            with pymupdf.open(stream=content, filetype="pdf") as pdf:
                if pdf.is_encrypted:
                    raise HTTPException(
                        status_code=400,
                        detail="This PDF is password-protected. Please upload an unlocked PDF."
                    )

                text = "\n".join(page.get_text() for page in pdf)

        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=400,
                detail="Could not read this PDF. Please upload a valid, readable resume."
            ) from exc

        if not text.strip():
            raise HTTPException(
                status_code=400,
                detail="No readable text found. Please upload a text-based PDF resume."
            )

        # AI profile extraction.
        profile = extract_profile(text)

        if not isinstance(profile, dict) or not profile:
            raise ValueError("Profile extraction returned invalid data.")

        # Generate relevant job preferences.
        job_preferences = generate_job_preferences(profile)

        if not isinstance(job_preferences, dict):
            raise ValueError("Job preferences returned invalid data.")

        # Discover and rank opportunities.
        opportunities = search_opportunities(job_preferences)

        if not isinstance(opportunities, list):
            raise ValueError("Opportunity search returned invalid data.")

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

    except HTTPException:
        raise

    except Exception as exc:
        logger.exception("Resume processing failed")

        # Handle API quota/rate-limit errors without exposing internal details.
        status_code = getattr(exc, "status_code", None)
        error_code = getattr(exc, "code", None)
        error_text = str(exc).lower()

        is_rate_limit = (
            status_code == 429
            or error_code == "rate_limit_exceeded"
            or "rate limit" in error_text
            or "tokens per day" in error_text
            or "resource_exhausted" in error_text
        )

        if is_rate_limit:
            raise HTTPException(
                status_code=429,
                detail=(
                    "AI service usage limit reached. Please try again "
                    "after the quota resets."
                )
            ) from exc

        raise HTTPException(
            status_code=500,
            detail=(
                "Resume processing failed due to a server or AI service "
                "error. Please try again later."
            )
        ) from exc

    finally:
        await file.close()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000
    )
