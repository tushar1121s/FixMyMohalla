import os
import json
import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from models import User
from auth import get_current_user, require_admin

router = APIRouter()

# 1. Gemini API config
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

GEMINI_MODEL_NAME = "gemini-3.6-flash"


# ==========================================
# 2. Schemas
# ==========================================

class GenerateNoticeRequest(BaseModel):
    rough_notes: str = Field(..., min_length=3)
    tone: str = Field("routine")
    language: str = Field("english")


class GenerateNoticeResponse(BaseModel):
    title: str
    body: str
    is_important: bool


class TranslateNoticeRequest(BaseModel):
    title: str
    body: str
    target_language: str = Field("hindi")


class TranslateNoticeResponse(BaseModel):
    translated_title: str
    translated_body: str


class SummarizeNoticeRequest(BaseModel):
    title: str
    body: str


class SummarizeNoticeResponse(BaseModel):
    summary_bullets: list[str]
    one_liner: str


# ==========================================
# 3. Endpoints
# ==========================================

@router.post("/generate-notice", response_model=GenerateNoticeResponse)
def generate_notice_with_ai(
    req: GenerateNoticeRequest,
    admin_user: User = Depends(require_admin)
):
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API Key is not configured in backend .env",
        )

    tone_instructions = {
        "urgent": "Tone must be urgent, clear, and action-oriented for safety/emergencies.",
        "routine": "Tone must be formal, courteous, and informative for routine maintenance.",
        "festive": "Tone must be warm, celebratory, and welcoming for community events.",
        "strict": "Tone must be strict, firm, mentioning rules and penalties for compliance."
    }

    selected_tone = tone_instructions.get(req.tone.lower(), tone_instructions["routine"])

    system_prompt = f"""
    You are an expert Chief Operating Officer of a modern residential gated society.
    Convert rough notes from society management into a professional official circular.

    Instructions:
    - {selected_tone}
    - Language requirement: {req.language.upper()} (If BILINGUAL, include English first followed by Hindi translation).
    - Format: Create a concise Title and a structured Body (with clear bullet points for Timings, Affected Areas, and Resident Actions).
    - Determine if this should be marked high-priority (is_important: true/false).

    Return ONLY a valid JSON object:
    {{
        "title": "Clear Official Title",
        "body": "Structured circular body text with proper line breaks",
        "is_important": true or false
    }}
    """

    try:
        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL_NAME,
            generation_config={"response_mime_type": "application/json"}
        )
        response = model.generate_content(
            f"{system_prompt}\n\nAdmin Rough Notes: {req.rough_notes}"
        )
        data = json.loads(response.text)
        return GenerateNoticeResponse(
            title=data.get("title", "Society Notice"),
            body=data.get("body", req.rough_notes),
            is_important=data.get("is_important", False)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI generation failed: {str(e)}"
        )


@router.post("/translate-notice", response_model=TranslateNoticeResponse)
def translate_notice_with_ai(
    req: TranslateNoticeRequest,
    current_user: User = Depends(get_current_user)
):
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API Key is not configured in backend .env",
        )

    system_prompt = f"""
    Translate the following residential society notice into natural, polite, and fluent {req.target_language.upper()}.
    Maintain official formatting, bullet points, and line breaks.

    Return ONLY a valid JSON object:
    {{
        "translated_title": "Translated Title",
        "translated_body": "Translated Body"
    }}
    """

    try:
        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL_NAME,
            generation_config={"response_mime_type": "application/json"}
        )
        response = model.generate_content(
            f"{system_prompt}\n\nOriginal Title: {req.title}\nOriginal Body: {req.body}"
        )
        data = json.loads(response.text)
        return TranslateNoticeResponse(
            translated_title=data.get("translated_title", req.title),
            translated_body=data.get("translated_body", req.body)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Translation failed: {str(e)}"
        )


@router.post("/summarize-notice", response_model=SummarizeNoticeResponse)
def summarize_notice_with_ai(
    req: SummarizeNoticeRequest,
    current_user: User = Depends(get_current_user)
):
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API Key is not configured in backend .env",
        )

    system_prompt = """
    Summarize the given society circular into a quick, crisp TL;DR for a resident.
    
    Return ONLY a valid JSON object:
    {
        "one_liner": "1-sentence headline summary of the event/action",
        "summary_bullets": [
            "What: Core issue or announcement",
            "When: Date, timing or deadline",
            "Action Required: What the resident must do"
        ]
    }
    """

    try:
        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL_NAME,
            generation_config={"response_mime_type": "application/json"}
        )
        response = model.generate_content(
            f"{system_prompt}\n\nNotice Title: {req.title}\nNotice Body: {req.body}"
        )
        data = json.loads(response.text)
        return SummarizeNoticeResponse(
            one_liner=data.get("one_liner", req.title),
            summary_bullets=data.get("summary_bullets", ["Please read full notice body for details."])
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Summarization failed: {str(e)}"
        )