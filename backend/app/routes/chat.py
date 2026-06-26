from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.routes.auth import get_current_user
from app.config import settings
import google.generativeai as genai
import os
import json

router = APIRouter(prefix="/chat", tags=["AI Chat"])

class ChatMessage(BaseModel):
    message: str
    scan_id: Optional[str] = None

@router.post("/message")
async def send_chat_message(
    chat_input: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            return {"reply": "Google Gemini API key is missing. AI Chat is currently disabled."}
        
        genai.configure(api_key=api_key)
        
        # Use the requested Gemini model
        model = genai.GenerativeModel("gemini-1.5-pro-latest")
        
        system_prompt = f"""You are the CancerGuard AI Medical Assistant, a professional, empathetic, and knowledgeable healthcare AI.
You are talking to a patient named {current_user.full_name}.

Rules:
1. Always be supportive, clear, and professional.
2. Use a reassuring tone but DO NOT provide absolute medical diagnosis.
3. Always include a disclaimer if giving advice.
4. Keep answers concise unless asked for a detailed explanation.
5. If you do not know something, advise them to consult their doctor.

Patient question: {chat_input.message}
"""
        
        response = model.generate_content(system_prompt)
        
        return {"reply": response.text}
        
    except Exception as e:
        print(f"Chat API Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate AI response."
        )
