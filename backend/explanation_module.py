import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY", "")
client = genai.Client(api_key=API_KEY) if API_KEY else None

# Optional local lightweight pipeline loader (e.g. HuggingFace LaMini-Flan-T5-248M or flan-t5-small)
_local_pipeline = None

def get_local_pipeline():
    """Lazily load lightweight local model (LaMini-Flan-T5 or flan-t5-small) if transformers is installed."""
    global _local_pipeline
    if _local_pipeline is None:
        try:
            from transformers import pipeline
            # Uses MBZUAI/LaMini-Flan-T5-248M or google/flan-t5-base
            model_id = os.getenv("LOCAL_MODEL_ID", "MBZUAI/LaMini-Flan-T5-248M")
            _local_pipeline = pipeline("text2text-generation", model=model_id, max_length=512)
        except Exception:
            _local_pipeline = False
    return _local_pipeline

def explain_concept(topic: str, use_lightweight: bool = True, language: str = "English") -> dict:
    """
    Explains complex concepts in simple, beginner-friendly language.
    Supports lightweight local model (e.g. LaMini-Flan-T5) or Gemini model.
    """
    if use_lightweight:
        pipe = get_local_pipeline()
        if pipe:
            try:
                prompt = f"Explain this concept in simple, beginner-friendly terms for a young student: {topic}"
                output = pipe(prompt)
                generated_text = output[0]["generated_text"]
                return {
                    "topic": topic,
                    "explanation": generated_text,
                    "simple_analogy": f"Think of {topic} like a simplified building block.",
                    "model_used": "LaMini-Flan-T5 (Local Lightweight)",
                    "key_concepts": [topic]
                }
            except Exception as e:
                pass  # fallback to lightweight prompt via cloud API

    # Cloud Gemini lightweight/simplified mode
    if not client:
        return {
            "topic": topic,
            "explanation": "GEMINI_API_KEY is not set, and local transformers pipeline is not installed.",
            "simple_analogy": "",
            "model_used": "None",
            "key_concepts": []
        }

    prompt = f"""You are EduGenie's Concept Simplifier.
Your mission is to explain this difficult topic in simple, beginner-friendly, jargon-free language:
Topic: {topic}
Language: {language}
Style: Beginner-friendly, engaging, with a memorable everyday analogy.

Return valid JSON with:
1. "topic": "{topic}"
2. "explanation": A clear, friendly explanation (approx 150-250 words).
3. "simple_analogy": An intuitive real-world analogy ("Think of it like...").
4. "model_used": "LaMini-Flan-T5 Simulation (Beginner Mode)" if {str(use_lightweight).lower()} else "Google Gemini"
5. "key_concepts": 3-4 bullet concepts.
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
            "explanation": f"Failed to generate explanation: {str(e)}",
            "simple_analogy": "",
            "model_used": "Error",
            "key_concepts": []
        }
