"""
EduGenie - AI-Powered Educational Assistant Backend
Built with FastAPI, Google Gemini, and lightweight local model integration.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import os

from qna import answer_question
from explanation_module import explain_concept
from quiz_module import generate_quiz
from summary_module import summarize_passage
from learning_path import generate_learning_path

app = FastAPI(
    title="EduGenie API",
    description="Backend API for EduGenie AI-Powered Learning Assistant",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Request Models -----------------

class QARequest(BaseModel):
    question: str = Field(..., description="The academic or general knowledge question to answer.")
    language: Optional[str] = Field("English", description="Target output language.")

class ExplainRequest(BaseModel):
    topic: str = Field(..., description="The complex topic or concept to simplify.")
    use_lightweight: Optional[bool] = Field(True, description="Whether to use lightweight model mode (LaMini-Flan-T5).")
    language: Optional[str] = Field("English", description="Target output language.")

class QuizRequest(BaseModel):
    topic: Optional[str] = Field("", description="The topic to generate quiz questions for.")
    passage: Optional[str] = Field("", description="Optional study passage to extract questions from.")
    language: Optional[str] = Field("English", description="Target output language.")

class SummarizeRequest(BaseModel):
    text: str = Field(..., description="Lengthy educational passage to summarize.")
    language: Optional[str] = Field("English", description="Target output language.")

class LearningPathRequest(BaseModel):
    topic: str = Field(..., description="The topic or skill for the learning path.")
    language: Optional[str] = Field("English", description="Target output language.")

# ----------------- REST API Endpoints -----------------

@app.get("/")
def read_root():
    return {
        "service": "EduGenie AI Assistant",
        "status": "online",
        "endpoints": [
            "/qa",
            "/explain",
            "/quiz",
            "/summarize",
            "/learn/recommendations"
        ]
    }

@app.post("/qa")
def endpoint_qa(req: QARequest):
    """Answers academic or general questions concisely using Gemini."""
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    result = answer_question(req.question, req.language)
    return result

@app.post("/explain")
def endpoint_explain(req: ExplainRequest):
    """Simplifies complex concepts using a lightweight local model or Gemini."""
    if not req.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")
    result = explain_concept(req.topic, req.use_lightweight, req.language)
    return result

@app.post("/quiz")
def endpoint_quiz(req: QuizRequest):
    """Generates exactly 3 MCQs with 4 options each and the correct answer."""
    if not req.topic.strip() and not req.passage.strip():
        raise HTTPException(status_code=400, detail="Either topic or passage must be provided.")
    result = generate_quiz(req.topic, req.passage, req.language)
    return result

@app.post("/summarize")
def endpoint_summarize(req: SummarizeRequest):
    """Converts lengthy educational text into concise, structured summaries."""
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    result = summarize_passage(req.text, req.language)
    return result

@app.post("/learn/recommendations")
def endpoint_learning_recommendations(req: LearningPathRequest):
    """Generates structured learning paths progressing from beginner to advanced."""
    if not req.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")
    result = generate_learning_path(req.topic, req.language)
    return result

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
