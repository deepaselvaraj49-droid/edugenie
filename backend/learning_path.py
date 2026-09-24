import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY", "")
client = genai.Client(api_key=API_KEY) if API_KEY else None

def generate_learning_path(topic: str, language: str = "English") -> dict:
    """
    Generates a personalized learning path for a selected topic,
    progressing from beginner to intermediate to advanced levels,
    with suggested timelines and curated learning resources.
    """
    if not client:
        return {
            "error": "GEMINI_API_KEY environment variable is not configured.",
            "topic": topic,
            "learning_path": []
        }

    prompt = f"""You are EduGenie Curriculum & Learning Path Architect.
Create a structured, high-quality learning path for: "{topic}".
Language: {language}

Progress through exactly 3 tiers:
1. "Beginner" (Foundational concepts, no prerequisites needed)
2. "Intermediate" (Core mechanisms, hands-on application, problem sets)
3. "Advanced" (Complex edge cases, optimization, real-world mastery)

For each tier, include:
- level name
- estimated duration (e.g., "Weeks 1-2" or "10-15 hours")
- list of 3-4 key subtopics to master
- recommended learning resources (books, docs, reputable websites, video styles)
- a milestone project or practice test idea

Return strictly valid JSON:
{{
  "topic": "{topic}",
  "overview": "Brief curriculum introduction and learning objectives",
  "tiers": [
    {{
      "level": "Beginner",
      "duration": "Duration here",
      "subtopics": ["Subtopic 1", "Subtopic 2", "Subtopic 3"],
      "resources": [
        {{"title": "Resource title", "type": "Documentation / Course / Book", "description": "Why it helps"}},
        {{"title": "Resource title 2", "type": "Video Series", "description": "Why it helps"}}
      ],
      "milestone": "Actionable practice task to complete before advancing"
    }},
    {{
      "level": "Intermediate",
      "duration": "Duration here",
      "subtopics": ["Subtopic 1", "Subtopic 2", "Subtopic 3"],
      "resources": [
        {{"title": "Resource title", "type": "Interactive Tool / Textbook", "description": "Why it helps"}}
      ],
      "milestone": "Intermediate practice benchmark"
    }},
    {{
      "level": "Advanced",
      "duration": "Duration here",
      "subtopics": ["Subtopic 1", "Subtopic 2", "Subtopic 3"],
      "resources": [
        {{"title": "Resource title", "type": "Research Paper / Capstone", "description": "Why it helps"}}
      ],
      "milestone": "Advanced capstone or exam benchmark"
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
            "overview": f"Failed to generate path: {str(e)}",
            "tiers": []
        }
