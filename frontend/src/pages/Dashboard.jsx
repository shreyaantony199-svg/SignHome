import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Flame,
  Target,
  Award,
  Camera,
  ShieldAlert,
  Stethoscope,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Video
} from 'lucide-react';
import { practiceService, vocabularyService, savedPhrasesService, authService } from '../services/api';
import SignIllustration from '../components/SignIllustration';

export default function Dashboard({ setActivePage, onSelectDemo }) {
  const user = authService.getCurrentUser() || { name: 'Learner', role: 'user' };
  const stats = practiceService.getStats();
  const signOfTheDay = vocabularyService.getSignOfTheDay();
  const savedPhrases = savedPhrasesService.getAll();

  const recentSigns = [
    vocabularyService.getTermById('Hospital') || { term: 'Hospital', tamil_meaning: 'மருத்துவமனை' },
    vocabularyService.getTermById('Doctor') || { term: 'Doctor', tamil_meaning: 'மருத்துவர்' },
    vocabularyService.getTermById('Water') || { term: 'Water', tamil_meaning: 'தண்ணீர்' },
    vocabularyService.getTermById('Thank You') || { term: 'Thank You', tamil_meaning: 'நன்றி' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-blue-100 text-xs font-semibold backdrop-blur-md mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-200" />
            <span>Welcome Back</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hello, {user.name || 'SignHome Learner'}! 🤟
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            "Every Sign Has a Voice. Every Person Has a Place." Track your progress across Indian Sign Language modules.
          </p>
        </div>

        {/* Quick SOS Trigger */}
        <button
          onClick={() => setActivePage('emergency')}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold shadow-lg transition-all shrink-0 hover:scale-105"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Emergency SOS</span>
        </button>
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-amber-500 text-amber-500 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Streak</div>
            <div className="text-2xl font-black text-slate-900">{stats.streak} Days</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Active Learner</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Signs Mastered</div>
            <div className="text-2xl font-black text-blue-600">{stats.signsLearned || 48}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">out of 400 indexed</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Practice Accuracy</div>
            <div className="text-2xl font-black text-emerald-600">{stats.accuracy || 94}%</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">High Performance</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Camera Drills</div>
            <div className="text-2xl font-black text-purple-600">{stats.totalAttempts + 12}</div>
            <div className="text-[10px] text-purple-600 font-bold mt-0.5">Real-time Vision</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sign of the Day & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sign of the Day (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">Featured Sign of the Day</h3>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md">
              {signOfTheDay?.category || 'General'}
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50/70 to-indigo-50/70 border border-purple-100 flex flex-col sm:flex-row items-center gap-6">
            <SignIllustration term={signOfTheDay?.term} size="lg" className="shrink-0" />
            <div className="space-y-1.5 text-center sm:text-left">
              <h4 className="text-2xl font-black text-slate-900">{signOfTheDay?.term}</h4>
              <p className="text-sm font-bold text-purple-700">{signOfTheDay?.tamil_meaning}</p>
              <p className="text-xs text-slate-600 line-clamp-2">{signOfTheDay?.description}</p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => onSelectDemo(signOfTheDay)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Video className="w-3.5 h-3.5" /> Watch Guide
                </button>
                <button
                  onClick={() => setActivePage('practice')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-colors"
                >
                  Practice in Coach
                </button>
              </div>
            </div>
          </div>

          {/* Recently Viewed Signs */}
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Recommended Daily Vocabulary
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recentSigns.map((s) => (
                <div
                  key={s.term}
                  onClick={() => onSelectDemo(s)}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 cursor-pointer transition-all flex flex-col items-center text-center"
                >
                  <SignIllustration term={s.term} size="sm" className="w-8 h-8 mb-1" />
                  <span className="text-xs font-bold text-slate-900">{s.term}</span>
                  <span className="text-[10px] text-purple-700 font-semibold">{s.tamil_meaning}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Launchpad Actions (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Platform Shortcuts</h3>
          <div className="space-y-3">
            <button
              onClick={() => setActivePage('recognition')}
              className="w-full p-4 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900 group-hover:text-purple-600">Live Recognition</h5>
                  <p className="text-xs text-slate-500">Real-time webcam translation</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => setActivePage('medical')}
              className="w-full p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600">Medical Assistant</h5>
                  <p className="text-xs text-slate-500">Symptom & pain clinical report</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => setActivePage('learn')}
              className="w-full p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900 group-hover:text-blue-600">Complete Dictionary</h5>
                  <p className="text-xs text-slate-500">Browse 400+ verified ISL signs</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
