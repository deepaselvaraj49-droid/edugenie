import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY", "")
client = genai.Client(api_key=API_KEY) if API_KEY else None

def summarize_passage(text: str, language: str = "English") -> dict:
    """Summarizes lengthy educational content into concise summaries."""
    if not client:
        return {
            "error": "GEMINI_API_KEY environment variable is not configured.",
            "summary": "Please set GEMINI_API_KEY to generate summaries.",
            "key_points": []
        }

    prompt = f"""You are EduGenie Text Summarizer.
Summarize the following educational passage, retaining the most important academic concepts while presenting them in a clear, concise, and easy-to-understand format.
Language: {language}

Text to summarize:
\"\"\"
{text[:15000]}
\"\"\"

Return strictly valid JSON with this structure:
{{
  "title": "A concise descriptive title for this text",
  "summary": "2-3 paragraphs providing a comprehensive yet concise overview",
  "key_points": [
    "Core point 1",
    "Core point 2",
    "Core point 3",
    "Core point 4"
  ],
  "quick_takeaway": "One-sentence executive conclusion"
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
            "title": "Summary",
            "summary": f"Failed to summarize: {str(e)}",
            "key_points": [],
            "quick_takeaway": ""
        }
