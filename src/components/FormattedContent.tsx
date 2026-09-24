import React from 'react';

interface FormattedContentProps {
  content: string;
  className?: string;
}

export const FormattedContent: React.FC<FormattedContentProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into lines for structured rendering
  const lines = content.split('\n');

  return (
    <div className={`space-y-3 leading-relaxed text-slate-700 ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Empty lines
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Heading 3
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-base font-semibold text-slate-900 mt-4 mb-1">
              {trimmed.replace('### ', '')}
            </h4>
          );
        }

        // Heading 2
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="text-lg font-semibold text-slate-900 mt-5 mb-2 pb-1 border-b border-slate-100">
              {trimmed.replace('## ', '')}
            </h3>
          );
        }

        // Heading 1
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={idx} className="text-xl font-bold text-slate-900 mt-6 mb-2">
              {trimmed.replace('# ', '')}
            </h2>
          );
        }

        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletContent = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start gap-2.5 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
              <div className="flex-1 text-slate-700 text-[15px]">{parseInlineFormatting(bulletContent)}</div>
            </div>
          );
        }

        // Numbered list (e.g. 1. or 2.)
        const matchNumber = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (matchNumber) {
          return (
            <div key={idx} className="flex items-start gap-3 ml-2">
              <span className="font-semibold text-indigo-600 text-sm mt-0.5 shrink-0 tabular-nums">
                {matchNumber[1]}.
              </span>
              <div className="flex-1 text-slate-700 text-[15px]">{parseInlineFormatting(matchNumber[2])}</div>
            </div>
          );
        }

        // Code block indicator or formulas
        if (trimmed.startsWith('```') || trimmed.endsWith('```')) {
          const codeText = trimmed.replace(/```/g, '');
          if (!codeText) return null;
          return (
            <pre key={idx} className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono overflow-x-auto my-2">
              <code>{codeText}</code>
            </pre>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className="text-[15px] text-slate-700 leading-relaxed">
            {parseInlineFormatting(line)}
          </p>
        );
      })}
    </div>
  );
};

// Helper to handle **bold**, *italic*, `code`, and equations
function parseInlineFormatting(text: string): React.ReactNode {
  // Simple regex parser for bold, inline code, and emphasis
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|`.*?`|\*.*?\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded bg-slate-100 text-indigo-700 font-mono text-xs border border-slate-200"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-slate-800">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
