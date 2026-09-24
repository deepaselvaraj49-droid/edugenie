# EduGenie - FastAPI Backend

Modular, lightweight educational AI backend built with FastAPI, Google Gemini, and local lightweight model capabilities (LaMini-Flan-T5).

## Directory Structure

```
backend/
├── main.py                 # FastAPI application and route definitions
├── qna.py                  # Question & Answer endpoint logic (/qa)
├── explanation_module.py   # Concept Explanation with local/lightweight model (/explain)
├── quiz_module.py          # 3-Question MCQ Quiz Generator (/quiz)
├── summary_module.py       # Educational Text Summarizer (/summarize)
├── learning_path.py        # 3-Tier Beginner to Advanced Roadmap (/learn/recommendations)
└── requirements.txt        # Python dependencies
```

## Running the FastAPI Server

1. Set your `GEMINI_API_KEY`:
```bash
export GEMINI_API_KEY="your_api_key_here"
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the server:
```bash
uvicorn main:app --reload --port 8000
```

4. Interactive API Docs:
Open [http://localhost:8000/docs](http://localhost:8000/docs) in your browser for Swagger UI.
