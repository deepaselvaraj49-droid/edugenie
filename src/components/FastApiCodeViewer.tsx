import React, { useState, useEffect } from 'react';
import { fetchPythonCode } from '../services/api';
import {
  FileCode2,
  Copy,
  Check,
  Terminal,
  Server,
  Layers,
  CheckCircle2,
  Cpu,
  Zap,
  Globe2,
  Share2,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

const MODULES = [
  { file: 'main.py', label: 'main.py (FastAPI App & REST Routes)', desc: 'FastAPI app, Pydantic schemas, and endpoints (/qa, /explain, /quiz, /summarize, /learn/recommendations)' },
  { file: 'qna.py', label: 'qna.py (Q&A Module)', desc: 'Google Gemini integration for answering academic and general questions' },
  { file: 'explanation_module.py', label: 'explanation_module.py (Hybrid & Lightweight AI)', desc: 'LaMini-Flan-T5 local lightweight model pipeline with Gemini cloud fallback' },
  { file: 'quiz_module.py', label: 'quiz_module.py (Quiz Generator & Checker)', desc: 'Generates exactly 3 MCQs with 4 options and identified correct answer keys' },
  { file: 'summary_module.py', label: 'summary_module.py (Summarizer)', desc: 'Passage summarization with key takeaways and vocabulary terms' },
  { file: 'learning_path.py', label: 'learning_path.py (Curriculum Architect)', desc: '3-Tier Beginner to Advanced learning roadmap with timelines and resources' },
  { file: 'requirements.txt', label: 'requirements.txt (Dependencies)', desc: 'FastAPI, Uvicorn, Pydantic, Google GenAI, and optional Transformers' },
  { file: 'README.md', label: 'README.md (Setup Guide)', desc: 'Instructions on setting up and running the FastAPI backend locally' },
];

const ENDPOINT_DOCS = [
  {
    path: '/qa',
    method: 'POST',
    description: 'Provides quick, concise answers to academic and general questions with key takeaways.',
    sampleCurl: `curl -X POST http://localhost:8000/qa \\
  -H "Content-Type: application/json" \\
  -d '{"question": "What causes ocean tides?"}'`,
  },
  {
    path: '/explain',
    method: 'POST',
    description: 'Simplifies complex topics with everyday analogies. Supports lightweight local model mode.',
    sampleCurl: `curl -X POST http://localhost:8000/explain \\
  -H "Content-Type: application/json" \\
  -d '{"topic": "Quantum Superposition", "use_lightweight": true}'`,
  },
  {
    path: '/quiz',
    method: 'POST',
    description: 'Automatically creates 3 MCQs with 4 options each and the correct answer index.',
    sampleCurl: `curl -X POST http://localhost:8000/quiz \\
  -H "Content-Type: application/json" \\
  -d '{"topic": "Photosynthesis"}'`,
  },
  {
    path: '/summarize',
    method: 'POST',
    description: 'Converts lengthy educational content into structured, concise summaries.',
    sampleCurl: `curl -X POST http://localhost:8000/summarize \\
  -H "Content-Type: application/json" \\
  -d '{"text": "The cardiovascular system consists of..."}'`,
  },
  {
    path: '/learn/recommendations',
    method: 'POST',
    description: 'Creates structured 3-tier learning roadmaps (Beginner to Advanced) with curated resources.',
    sampleCurl: `curl -X POST http://localhost:8000/learn/recommendations \\
  -H "Content-Type: application/json" \\
  -d '{"topic": "Machine Learning"}'`,
  },
];

export const FastApiCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState('main.py');
  const [fileContent, setFileContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    fetchPythonCode(selectedFile)
      .then((res) => {
        if (mounted) setFileContent(res.content);
      })
      .catch((err) => {
        if (mounted) setFileContent(`# Error loading file: ${err.message}`);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedFile]);

  const copyCode = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCurlSnippet = (snippet: string, path: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedCurl(path);
    setTimeout(() => setCopiedCurl(null), 2000);
  };

  const currentMeta = MODULES.find((m) => m.file === selectedFile);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
              <span>FastAPI Backend & Hybrid AI Architecture</span>
              <span aria-hidden="true">·</span>
              <span>Python 3.10+</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
              Modular Python Backend Codebase
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Standalone FastAPI service with dedicated endpoints for Q&A, Concept Explanation, Quiz Generation, Text Summarization, and Learning Paths.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Production-Ready REST</span>
            </span>
          </div>
        </div>

        {/* 3 Architecture Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
              <Cpu className="w-4 h-4" />
              <span>Hybrid AI Architecture</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Combines cloud-based <strong>Google Gemini Flash</strong> for complex reasoning and synthesis with a <strong>lightweight local model (LaMini-Flan-T5)</strong> for fast, low-compute explanations.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <Layers className="w-4 h-4" />
              <span>Modular Independent Design</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Each core capability lives in an isolated Python module (<code className="text-emerald-700">qna.py</code>, <code className="text-emerald-700">quiz_module.py</code>, etc.), making maintenance and extension effortless.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
              <Zap className="w-4 h-4" />
              <span>Lightweight & Accessible</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Optimized token budgets, low memory footprint, and client caching ensure ultra-fast response times even on constrained devices and low-bandwidth connections.
            </p>
          </div>
        </div>

        {/* Quick Launch Terminal Command */}
        <div className="mt-6 p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-emerald-400 font-bold">Launch locally:</span>
            <span className="text-slate-300 select-all">
              cd backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000
            </span>
          </div>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* File Tree Selector */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider px-1">
            Backend Python Modules ({MODULES.length})
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-2 space-y-1">
            {MODULES.map((m) => (
              <button
                key={m.file}
                onClick={() => setSelectedFile(m.file)}
                className={`w-full text-left p-2.5 rounded-lg text-xs font-medium transition-colors flex items-start gap-2 ${
                  selectedFile === m.file
                    ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileCode2 className={`w-4 h-4 shrink-0 mt-0.5 ${selectedFile === m.file ? 'text-indigo-600' : 'text-slate-400'}`} />
                <div className="truncate">
                  <div className="font-mono">{m.file}</div>
                  <div className="text-[10px] text-slate-500 truncate font-normal">
                    {m.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Code Content Box */}
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold text-slate-700">
              backend/{selectedFile}
            </span>
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-white rounded-lg border border-slate-200 shadow-2xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy File Content</span>
                </>
              )}
            </button>
          </div>

          <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-slate-400">
                  {selectedFile}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {selectedFile.endsWith('.py') ? 'Python 3' : 'Text'}
              </span>
            </div>

            <pre className="p-4 text-xs font-mono text-emerald-300/90 overflow-x-auto max-h-[550px] leading-relaxed select-all whitespace-pre-wrap">
              {isLoading ? 'Loading file content...' : fileContent}
            </pre>
          </div>
        </div>
      </div>

      {/* REST Endpoints Reference & Interactive Test Cards */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <Server className="w-4 h-4" />
            <span>FastAPI Endpoints Reference</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            FastAPI Independent API Endpoints
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Each educational function has a dedicated REST endpoint with structured Pydantic schemas.
          </p>
        </div>

        <div className="space-y-4">
          {ENDPOINT_DOCS.map((ep) => (
            <div
              key={ep.path}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold font-mono">
                    {ep.method}
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {ep.path}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyCurlSnippet(ep.sampleCurl, ep.path)}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-indigo-600 self-start sm:self-auto bg-white px-2.5 py-1 rounded-md border border-slate-200"
                >
                  {copiedCurl === ep.path ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Copied curl</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy curl</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-600">{ep.description}</p>

              <pre className="p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto select-all">
                {ep.sampleCurl}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
