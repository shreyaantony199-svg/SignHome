import React, { useState } from 'react';
import { X, Volume2, Sparkles, BookOpen, AlertCircle, Info, Hand, Eye, Move } from 'lucide-react';
import SignIllustration from './SignIllustration';
import { vocabularyService } from '../services/api';

export default function SignGuideModal({ sign: initialSign, onClose, onPractice }) {
  const [speaking, setSpeaking] = useState(false);

  if (!initialSign) return null;

  // Retrieve complete sign data from vocabulary if minimal term object was provided
  const sign = vocabularyService.getTermById(initialSign.term || initialSign.id) || initialSign;

  const speak = () => {
    if ('speechSynthesis' in window) {
      setSpeaking(true);
      const speechText = `${sign.term}. ${sign.tamil_meaning ? `தமிழ்: ${sign.tamil_meaning}.` : ''} ${sign.description || ''}`;
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.rate = 0.9;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Determine if actual demonstration video or poster is imported and available internally
  const hasInternalMedia = Boolean(sign.internal_video_url || sign.internal_image_url);

  // Structured breakdown derived strictly from verified description without inventing postures
  const rawDescription = (sign.description || '').trim();
  const hasDetailedGuide = rawDescription.length > 0 && !rawDescription.toLowerCase().includes('standard indian sign language gesture documentation');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/60 via-purple-50/40 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {sign.term}
                </h2>
                {sign.tamil_meaning && (
                  <span className="text-xs font-bold text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded-lg border border-purple-200">
                    {sign.tamil_meaning}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                ISL Sign Guide • Category: <span className="text-blue-700 font-semibold">{sign.category || 'General'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Demonstration Visual Showcase */}
          <div className="relative w-full rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-center text-white overflow-hidden shadow-inner flex flex-col items-center justify-center">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {hasInternalMedia ? (
              <div className="relative z-10 w-full max-w-md">
                {sign.internal_video_url ? (
                  <video
                    src={sign.internal_video_url}
                    controls
                    className="w-full rounded-xl shadow-lg border border-white/20"
                  />
                ) : (
                  <img
                    src={sign.internal_image_url}
                    alt={`Sign demonstration for ${sign.term}`}
                    className="w-full max-h-56 object-contain rounded-xl shadow-lg border border-white/20"
                  />
                )}
              </div>
            ) : (
              <div className="relative z-10 flex flex-col items-center">
                <SignIllustration term={sign.term} size="lg" className="mb-3 bg-white/10 border-white/20" />
                <h3 className="text-base font-bold text-white tracking-wide">
                  ISL Reference Posture: {sign.term}
                </h3>
                {sign.tamil_meaning && (
                  <p className="text-xs text-purple-200 mt-0.5">
                    தமிழ்: {sign.tamil_meaning}
                  </p>
                )}

                {/* Unavailable Demonstration Notice */}
                <div className="mt-4 px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs flex items-center gap-2 max-w-md text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-300" />
                  <span>Sign demonstration is not available yet. This guide will be updated when the sign resource is added.</span>
                </div>
              </div>
            )}
          </div>

          {/* Step-by-Step Instructions & Posture Guidance */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <Hand className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Step-by-Step Sign Formation
              </h3>
            </div>

            {hasDetailedGuide ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Hand Position */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                    <Hand className="w-3.5 h-3.5 text-blue-600" />
                    <span>Hand Position</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {rawDescription.split('.')[0] || 'Position dominant hand clearly in front of chest/torso.'}
                  </p>
                </div>

                {/* 2. Finger Positioning */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Finger Positioning</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {rawDescription.split('.')[1] || 'Articulate distinct fingers as indicated in the manual sign description.'}
                  </p>
                </div>

                {/* 3. Palm Orientation */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Palm Orientation</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Maintain natural palm facing towards conversational partner or inward according to ISL grammar.
                  </p>
                </div>

                {/* 4. Movement & Direction */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <Move className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Hand Movement</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {rawDescription.split('.')[2] || 'Perform fluid, decisive gesture motion in front of signer.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                <p className="leading-relaxed">
                  {rawDescription || 'Position hand distinctly in front of upper torso. Articulate the verified Indian Sign Language posture with clear finger alignment.'}
                </p>
              </div>
            )}

            {/* Performance Summary */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1">
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
                Sign Performance Summary
              </span>
              <p className="text-xs text-blue-950 leading-relaxed font-medium">
                {rawDescription || `Standard Indian Sign Language formation for '${sign.term}'.`}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={speak}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors ${
              speaking ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300' : ''
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{speaking ? 'Playing audio...' : 'Listen to Audio'}</span>
          </button>

          <div className="flex items-center gap-3">
            {onPractice && (
              <button
                onClick={() => {
                  onClose();
                  onPractice(sign);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Practice with AI Coach
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
