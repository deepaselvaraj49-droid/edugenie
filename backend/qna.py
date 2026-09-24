import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY", "")
client = genai.Client(api_key=API_KEY) if API_KEY else None

def answer_question(question: str, language: str = "English") -> dict:
    """Answers academic or general questions using Google Gemini."""
    if not client:
        return {
            "error": "GEMINI_API_KEY environment variable is not configured.",
            "question": question,
            "answer": "Please set your GEMINI_API_KEY to receive answers."
        }

    prompt = f"""You are EduGenie Q&A Assistant.
Answer the following student question accurately, concisely, and clearly.
Language requested: {language}

Question: {question}

Provide your answer formatted in JSON with:
1. "answer": The clear, direct explanation.
2. "key_takeaways": 2-3 essential takeaway bullet points.
3. "related_topics": 2-3 related topics the student can explore next.
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        return {
            "answer": f"Unable to process answer: {str(e)}",
            "key_takeaways": [],
            "related_topics": []
        }
