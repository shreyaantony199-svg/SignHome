import React from 'react';
import SignIllustration from './SignIllustration';

/**
 * FingerspellingDisplay
 * Takes arbitrary English text and breaks it into manual ISL alphabet postures
 */
export default function FingerspellingDisplay({ text = 'SIGN' }) {
  const letters = (text || '').toUpperCase().split('').filter(c => /[A-Z]/.test(c));

  if (!letters.length) {
    return (
      <p className="text-xs text-slate-400 italic">Enter letters to see fingerspelling sequence.</p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {letters.map((letter, idx) => (
        <div
          key={`${letter}-${idx}`}
          className="flex flex-col items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 transition-colors"
        >
          <SignIllustration term={letter} size="sm" className="w-9 h-9" />
          <span className="text-xs font-bold text-slate-800 mt-1">{letter}</span>
        </div>
      ))}
    </div>
  );
}
