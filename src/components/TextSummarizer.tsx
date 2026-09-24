import React, { useState } from 'react';
import { SummaryResponse } from '../types';
import { summarizeText } from '../services/api';
import { FormattedContent } from './FormattedContent';
import {
  FileText,
  Sparkles,
  Upload,
  BookOpen,
  CheckCircle2,
  Bookmark,
  Loader2,
  Copy,
  Check,
  ArrowRight,
  ListOrdered,
  FileCheck,
} from 'lucide-react';

interface TextSummarizerProps {
  onJumpToQuiz: (sourceText: string, topicTitle: string) => void;
}

const SAMPLE_TEXTS = [
  {
    title: 'Cellular Respiration in Eukaryotes',
    content: `Cellular respiration is a set of metabolic reactions and processes that take place in the cells of organisms to convert biochemical energy from nutrients into adenosine triphosphate (ATP), and then release waste products. The catabolic reactions involved in respiration include glycolysis, pyruvate oxidation, the citric acid cycle (Krebs cycle), and oxidative phosphorylation via electron transport chain.

Glycolysis occurs in the cytosol and is anaerobic, breaking one glucose molecule into two pyruvates, yielding a net of 2 ATP and 2 NADH. Pyruvate then enters the mitochondrial matrix, undergoing decarboxylation to form Acetyl-CoA. In the Krebs cycle, Acetyl-CoA combines with oxaloacetate to produce citrate, producing NADH, FADH2, and ATP per turn.

Finally, oxidative phosphorylation occurs across the inner mitochondrial membrane. Electrons from NADH and FADH2 are transferred through protein complexes (Complex I-IV), pumping protons into the intermembrane space to create an electrochemical gradient. ATP synthase uses this proton-motive force via chemiosmosis to phosphorylate ADP to ATP, producing roughly 30 to 32 ATP molecules per glucose under aerobic conditions. Oxygen acts as the final electron acceptor, combining with protons to form water.`,
  },
  {
    title: 'The Industrial Revolution & Socioeconomic Transformation',
    content: `The Industrial Revolution was the transition to new manufacturing processes in Great Britain, continental Europe, and the United States, that occurred during the period from around 1760 to about 1840. This transition included going from hand production methods to machines, new chemical manufacturing and iron production processes, the increasing use of steam power and water power, the development of machine tools and the rise of the mechanized factory system.

Textiles were the dominant industry of the Industrial Revolution in terms of employment, value of output and capital invested. The textile industry was also the first to use modern production methods. James Watt's development of the commercial steam engine in 1776 provided mechanical energy independent of rivers, enabling factories to locate near coalfields and urban centers.

Socially, the revolution led to unprecedented urbanization, rapid population growth, and the emergence of two distinct classes: the industrial bourgeoisie (factory and mill owners) and the industrial proletariat (wage laborers). Working conditions were initially harsh, with 14-hour workdays, child labor, and poor sanitation, which eventually catalyzed labor movements, trade unionism, and legislative reforms like the Factory Acts.`,
  },
  {
    title: 'Distributed Consensus & The Paxos / Raft Algorithms',
    content: `In distributed computing, consensus is the process of agreeing on a single data value or a sequence of actions among a network of independent computers that communicate asynchronously and may experience message delays, network partitions, or machine crashes.

The fundamental challenge stems from the FLP Impossibility Result (Fischer, Lynch, and Paterson, 1985), which proved that no deterministic asynchronous algorithm can guarantee consensus in the presence of even a single unannounced fail-stop crash. Consequently, modern distributed systems rely on partially synchronous assumptions and quorum-based state machine replication.

Leslie Lamport introduced the Paxos algorithm, utilizing a two-phase protocol (Prepare/Promise and Accept/Accepted) to ensure safety (agreement and validity) regardless of message reordering. However, Paxos is famously difficult to understand and implement correctly. In response, Ongaro and Ousterhout created Raft in 2014, which decomposes consensus into leader election, log replication, and safety constraints. In Raft, nodes exist in one of three states: Follower, Candidate, or Leader. Leaders maintain heartbeats, manage replicated logs across a majority quorum, and guarantee linearizable reads and writes.`,
  },
];

export const TextSummarizer: React.FC<TextSummarizerProps> = ({ onJumpToQuiz }) => {
  const [inputText, setInputText] = useState('');
  const [format, setFormat] = useState('bullet_points');
  const [length, setLength] = useState('standard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummaryResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  const handleSummarize = async (overrideText?: string) => {
    const text = (overrideText || inputText).trim();
    if (!text) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await summarizeText({
        text,
        format,
        length,
      });
      setResult(data);
      if (overrideText) setInputText(overrideText);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to summarize text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
      }
    };
    reader.readAsText(file);
  };

  const copySummary = () => {
    if (!result) return;
    const text = `${result.title}\n\nSummary:\n${result.summary}\n\nKey Points:\n${result.keyPoints.map((k) => `• ${k}`).join('\n')}\n\nVocabulary:\n${result.vocabulary.map((v) => `${v.term}: ${v.definition}`).join('\n')}\n\nQuick Review:\n${result.quickReview}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <span>High-Retention Study Notes</span>
            <span aria-hidden="true">·</span>
            <span>Gemini 3.8 Flash</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
            Text & Lecture Material Summarizer
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Distills dense textbook passages, PDF articles, and lecture notes into bulleted takeaways, key terminology, and instant exam cheat-sheets.
          </p>
        </div>

        {/* Input box */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Paste Study Material or Notes</span>
            <div className="flex items-center gap-3">
              <span className="tabular-nums">{wordCount} words</span>
              <label className="cursor-pointer text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload .txt/.md</span>
                <input
                  type="file"
                  accept=".txt,.md,.text"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <textarea
            rows={7}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your textbook chapter, article excerpt, lecture transcript, or study notes here..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base bg-slate-50/50"
          />

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            {/* Format toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Focus:</span>
              <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFormat('bullet_points')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    format === 'bullet_points'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Key Points
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('concept_map')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    format === 'concept_map'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Definitions
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('executive')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    format === 'executive'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Executive
                </button>
              </div>
            </div>

            <button
              onClick={() => handleSummarize()}
              disabled={isLoading || !inputText.trim()}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Summarizing Notes...</span>
                </>
              ) : (
                <>
                  <span>Generate Study Summary</span>
                  <FileText className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Sample material loader */}
          <div className="pt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Load sample study texts:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_TEXTS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(sample.content);
                    handleSummarize(sample.content);
                  }}
                  className="text-xs px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg border border-slate-200 transition-colors text-left"
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-100 rounded w-full" />
          <div className="h-4 bg-slate-100 rounded w-4/5" />
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="h-20 bg-slate-50 rounded-xl" />
            <div className="h-20 bg-slate-50 rounded-xl" />
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && !isLoading && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                Summarized Study Material
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display mt-0.5">
                {result.title}
              </h2>
            </div>
            <button
              onClick={copySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors self-start sm:self-auto"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Summary'}</span>
            </button>
          </div>

          {/* Executive Overview */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm leading-relaxed">
            <FormattedContent content={result.summary} />
          </div>

          {/* Key Bullet Points */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-indigo-600" />
              <span>Core Academic Takeaways ({result.keyPoints.length})</span>
            </h3>
            <div className="space-y-2.5">
              {result.keyPoints.map((pt, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-indigo-100 bg-white transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-slate-800 leading-relaxed">{pt}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Vocabulary / Definitions */}
          {result.vocabulary && result.vocabulary.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-indigo-600" />
                <span>Essential Vocabulary & Concepts</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.vocabulary.map((vocab, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-indigo-200 transition-all"
                  >
                    <span className="text-xs font-bold text-indigo-900 block mb-1">
                      {vocab.term}
                    </span>
                    <span className="text-xs text-slate-600 leading-relaxed block">
                      {vocab.definition}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 1-Line Exam Cheatsheet */}
          {result.quickReview && (
            <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200/80 flex items-start gap-3">
              <FileCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider block mb-0.5">
                  Exam Cheat-Sheet Mnemonic / Quick Formula
                </span>
                <p className="text-sm font-semibold text-indigo-900">{result.quickReview}</p>
              </div>
            </div>
          )}

          {/* Action button: Jump straight to Quiz */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => onJumpToQuiz(inputText, result.title)}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Generate Practice Quiz from this material</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
