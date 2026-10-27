
from datetime import date, datetime, timezone
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field

from auth import get_current_user
from database import get_connection

router = APIRouter(prefix="/applications", tags=["Applications"])
ApplicationStatus = Literal["Saved", "Applied", "Interview", "Offer", "Rejected"]


class ApplicationCreate(BaseModel):
    opportunity: dict[str, Any]
    status: ApplicationStatus = "Applied"
    application_date: date | None = None
    interview_at: datetime | None = None
    follow_up_at: datetime | None = None
    reminder_note: str = Field(default="", max_length=2000)


class ApplicationUpdate(BaseModel):
    opportunity: dict[str, Any] | None = None
    status: ApplicationStatus | None = None
    application_date: date | None = None
    interview_at: datetime | None = None
    follow_up_at: datetime | None = None
    reminder_note: str | None = Field(default=None, max_length=2000)


def _opportunity_key(opportunity: dict[str, Any]) -> str:
    url = str(opportunity.get("url") or "").strip().rstrip("/").casefold()
    if url:
        return f"url:{url}"

    title = str(opportunity.get("title") or "").strip().casefold()
    company = str(opportunity.get("company") or "").strip().casefold()
    if not title or not company:
        raise HTTPException(
            status_code=422,
            detail="An application needs a job title and company, or a source URL.",
        )
    return f"job:{title}|{company}"


def _serialize(row) -> dict[str, Any]:
    application = dict(row)
    application["opportunity"] = json.loads(application.pop("opportunity_json"))
    return application


def _get_owned_application(connection, application_id: int, user_id: int):
    row = connection.execute(
        "SELECT * FROM applications WHERE id = ? AND user_id = ?",
        (application_id, user_id),
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Application not found.")
    return row


@router.get("")
def list_applications(user=Depends(get_current_user)):
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, opportunity_json, status, application_date, interview_at,
                   follow_up_at, reminder_note, created_at, updated_at
            FROM applications
            WHERE user_id = ?
            ORDER BY updated_at DESC, id DESC
            """,
            (user["id"],),
        ).fetchall()
    return [_serialize(row) for row in rows]


@router.post("", status_code=201)
def create_application(data: ApplicationCreate, user=Depends(get_current_user)):
    key = _opportunity_key(data.opportunity)
    try:
        with get_connection() as connection:
            cursor = connection.execute(
                """
                INSERT INTO applications (
                    user_id, opportunity_key, opportunity_json, status,
                    application_date, interview_at, follow_up_at, reminder_note
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    user["id"],
                    key,
                    json.dumps(data.opportunity),
                    data.status,
                    data.application_date.isoformat() if data.application_date else None,
                    data.interview_at.isoformat() if data.interview_at else None,
                    data.follow_up_at.isoformat() if data.follow_up_at else None,
                    data.reminder_note.strip(),
                ),
            )
            row = connection.execute(
                "SELECT * FROM applications WHERE id = ? AND user_id = ?",
                (cursor.lastrowid, user["id"]),
            ).fetchone()
    except Exception as exc:
        if "UNIQUE constraint failed" in str(exc):
            raise HTTPException(
                status_code=409,
                detail="This opportunity is already in your application tracker.",
            ) from exc
        raise
    return _serialize(row)


@router.patch("/{application_id}")
def update_application(
    application_id: int,
    data: ApplicationUpdate,
    user=Depends(get_current_user),
):
    changes = data.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=422, detail="No application changes provided.")

    with get_connection() as connection:
        current = _get_owned_application(connection, application_id, user["id"])
        updates: dict[str, Any] = {}
        if "opportunity" in changes:
            opportunity = changes["opportunity"]
            if opportunity is None:
                raise HTTPException(status_code=422, detail="Opportunity data cannot be empty.")
            updates["opportunity_key"] = _opportunity_key(opportunity)
            updates["opportunity_json"] = json.dumps(opportunity)
        if "status" in changes:
            if changes["status"] is None:
                raise HTTPException(status_code=422, detail="Application status cannot be empty.")
            updates["status"] = changes["status"]
        for field in ("application_date", "interview_at", "follow_up_at"):
            if field in changes:
                value = changes[field]
                updates[field] = value.isoformat() if value else None
        if "reminder_note" in changes:
            updates["reminder_note"] = (changes["reminder_note"] or "").strip()

        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        assignments = ", ".join(f"{field} = ?" for field in updates)
        try:
            connection.execute(
                f"UPDATE applications SET {assignments} WHERE id = ? AND user_id = ?",
                (*updates.values(), application_id, user["id"]),
            )
        except Exception as exc:
            if "UNIQUE constraint failed" in str(exc):
                raise HTTPException(
                    status_code=409,
                    detail="This opportunity is already in your application tracker.",
                ) from exc
            raise
        row = connection.execute(
            "SELECT * FROM applications WHERE id = ? AND user_id = ?",
            (application_id, user["id"]),
        ).fetchone()
    return _serialize(row)


@router.delete("/{application_id}", status_code=204)
def delete_application(application_id: int, user=Depends(get_current_user)):
    with get_connection() as connection:
        cursor = connection.execute(
            "DELETE FROM applications WHERE id = ? AND user_id = ?",
            (application_id, user["id"]),
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Application not found.")
    return Response(status_code=204)
