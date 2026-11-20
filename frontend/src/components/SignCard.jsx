import React, { useState } from 'react';
import { Volume2, BookOpen, CheckCircle, Sparkles } from 'lucide-react';
import SignIllustration from './SignIllustration';

export default function SignCard({ sign, onSelectDemo, onPractice }) {
  const [speaking, setSpeaking] = useState(false);

  const speakTerm = (e) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      setSpeaking(true);
      const textToSpeak = `${sign.term}. ${sign.tamil_meaning || ''}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.9;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-hover hover:border-blue-300 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Header badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            {sign.category || 'General'}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Verified
          </span>
        </div>

        {/* Visual + Terms */}
        <div className="flex items-center gap-4 mb-4">
          <SignIllustration term={sign.term} size="md" />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              {sign.term}
            </h3>
            {sign.tamil_meaning && (
              <p className="text-sm font-medium text-purple-700 truncate">
                {sign.tamil_meaning}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-0.5">
              ISL Sign: <span className="text-slate-700 font-medium">{sign.category || 'Standard'}</span>
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
          {sign.description || 'Standard Indian Sign Language gesture documentation.'}
        </p>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={speakTerm}
          title="Pronounce English and Tamil"
          className={`p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors ${speaking ? 'text-blue-600 bg-blue-50 ring-2 ring-blue-300' : ''}`}
        >
          <Volume2 className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          {onPractice && (
            <button
              onClick={() => onPractice(sign)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Coach
            </button>
          )}

          <button
            onClick={() => onSelectDemo && onSelectDemo(sign)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Watch Guide
          </button>
        </div>
      </div>
    </div>
  );
}
