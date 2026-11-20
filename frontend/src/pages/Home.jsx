import React from 'react';
import {
  Sparkles,
  Camera,
  GraduationCap,
  ShieldAlert,
  ArrowRight,
  Stethoscope,
  CheckCircle,
  Video,
  Award,
  BookOpen,
  Volume2
} from 'lucide-react';
import SignIllustration from '../components/SignIllustration';
import SignCard from '../components/SignCard';
import { vocabularyService } from '../services/api';

export default function Home({ setActivePage, onSelectDemo }) {
  const signOfTheDay = vocabularyService.getSignOfTheDay();
  const sampleSigns = [
    vocabularyService.getTermById('Hospital') || { term: 'Hospital', tamil_meaning: 'மருத்துவமனை', category: 'Medical & Health' },
    vocabularyService.getTermById('Doctor') || { term: 'Doctor', tamil_meaning: 'மருத்துவர்', category: 'Medical & Health' },
    vocabularyService.getTermById('Ambulance') || { term: 'Ambulance', tamil_meaning: 'ஆம்புலன்ஸ்', category: 'Emergency & Safety' },
    vocabularyService.getTermById('Water') || { term: 'Water', tamil_meaning: 'தண்ணீர்', category: 'Daily Living & Food' },
    vocabularyService.getTermById('Help') || { term: 'Help', tamil_meaning: 'உதவி', category: 'Emergency & Safety' },
    vocabularyService.getTermById('Family') || { term: 'Family', tamil_meaning: 'குடும்பம்', category: 'Family & People' },
  ];

  return (
    <div className="space-y-16 animate-fade-in">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-8 lg:p-14 shadow-2xl border border-blue-800/40">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span>Indian Sign Language Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Every Sign Has a Voice. <br />
            <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Every Person Has a Place.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            SignHome bridges communication between deaf, hard-of-hearing, and hearing communities across India. Built on verified linguistic Indian Sign Language datasets with real-time computer vision and accessible emergency tools.
          </p>

          {/* Quick Hero Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setActivePage('recognition')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-0.5"
            >
              <Camera className="w-4 h-4" />
              <span>Launch Live Recognition</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActivePage('learn')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/20 backdrop-blur-md transition-all"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Browse 400+ ISL Dictionary</span>
            </button>

            <button
              onClick={() => setActivePage('emergency')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-red-600/80 hover:bg-red-600 text-white text-sm font-bold border border-red-500/40 backdrop-blur-md transition-all ml-auto"
            >
              <ShieldAlert className="w-4 h-4 text-white" />
              <span>Emergency SOS</span>
            </button>
          </div>

          {/* Sign Visual Row in Hero */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center gap-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Core ISL Gestures:
            </span>
            <div className="flex flex-wrap items-center gap-4">
              {['Hello', 'Thank You', 'Water', 'Doctor', 'Help'].map((item) => (
                <div key={item} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                  <SignIllustration term={item} size="sm" className="w-6 h-6 bg-transparent border-0" />
                  <span className="text-xs font-medium text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SIGN OF THE DAY FEATURED BANNER */}
      {signOfTheDay && (
        <section className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-3xl border border-purple-200/80 p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-5">
            <SignIllustration term={signOfTheDay.term} size="lg" className="shrink-0" />
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-purple-600" />
                Sign of the Day
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                {signOfTheDay.term}
                {signOfTheDay.tamil_meaning && (
                  <span className="text-base font-semibold text-purple-800 bg-white/80 px-3 py-0.5 rounded-xl border border-purple-200">
                    {signOfTheDay.tamil_meaning}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-xl line-clamp-2">
                {signOfTheDay.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectDemo(signOfTheDay)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Watch Guide
            </button>
            <button
              onClick={() => setActivePage('practice')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-purple-100/60 text-purple-700 border border-purple-200 text-xs font-bold transition-all"
            >
              <Award className="w-4 h-4" />
              Practice in Coach
            </button>
          </div>
        </section>
      )}

      {/* WHY SIGNHOME - PROBLEM & SOLUTION */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How SignHome Empowers Inclusion
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Eliminating accessibility gaps across daily life, emergency care, transit, and classrooms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-card transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Authentic ISL Dictionaries</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Indexed with comprehensive daily glosses, English terms, verified Tamil translations, and clear step-by-step sign posture guides.
              </p>
            </div>
            <button
              onClick={() => setActivePage('learn')}
              className="mt-6 text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              Search Vocabulary <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-card transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Real-Time Computer Vision</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Client-side and backend MediaPipe Hand Landmarker combined with normalized geometric classifiers (SVM/Random Forest) decodes hand gestures into speech without recording private video.
              </p>
            </div>
            <button
              onClick={() => setActivePage('recognition')}
              className="mt-6 text-xs font-bold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
            >
              Open Live Camera <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-card transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Crisis & Medical SOS</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rapid high-contrast emergency cards, visual symptom checkers, pain scales, and text-to-speech enable immediate communication during urgent healthcare and safety incidents.
              </p>
            </div>
            <button
              onClick={() => setActivePage('emergency')}
              className="mt-6 text-xs font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1"
            >
              View Emergency SOS <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* SAMPLE DICTIONARY SHOWCASE */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              Verified Dictionary Preview
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Essential Daily ISL Vocabulary
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Explore frequently needed terms with step-by-step guides and Tamil translations.
            </p>
          </div>

          <button
            onClick={() => setActivePage('learn')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors"
          >
            <span>View All 400+ Terms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleSigns.map((sign) => (
            <SignCard
              key={sign.term}
              sign={sign}
              onSelectDemo={onSelectDemo}
              onPractice={() => setActivePage('practice')}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
