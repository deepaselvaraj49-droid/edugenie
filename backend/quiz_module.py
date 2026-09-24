import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY", "")
client = genai.Client(api_key=API_KEY) if API_KEY else None

def generate_quiz(topic: str = "", passage: str = "", language: str = "English") -> dict:
    """
    Generates exactly 3 multiple-choice questions from a topic or passage.
    Each question contains 4 options, identifies the correct answer, and explains why.
    """
    if not client:
        return {
            "error": "GEMINI_API_KEY environment variable is not configured.",
            "questions": []
        }

    source_content = f"Passage: {passage}\nTopic: {topic}" if passage else f"Topic: {topic}"

    prompt = f"""You are EduGenie Quiz Generator.
Generate exactly 3 Multiple Choice Questions (MCQs) based on the following:
{source_content}
Language: {language}

Strict Requirements:
- Exactly 3 questions.
- Each question MUST have exactly 4 plausible options.
- Indicate the "correct_option_index" (0, 1, 2, or 3).
- Provide a brief "explanation" for why the answer is correct.

Return strictly valid JSON with this structure:
{{
  "topic": "{topic or 'Provided Passage'}",
  "questions": [
    {{
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_option_index": 0,
      "explanation": "Why Option A is correct."
    }},
    {{
      "id": 2,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_option_index": 1,
      "explanation": "Why Option B is correct."
    }},
    {{
      "id": 3,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_option_index": 2,
      "explanation": "Why Option C is correct."
    }}
  ]
}}
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
            "topic": topic,
            "error": str(e),
            "questions": []
        }
