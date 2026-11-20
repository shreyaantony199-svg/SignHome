import React, { useState } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  Volume2,
  Copy,
  Video,
  CheckCircle,
  AlertTriangle,
  User,
  Heart,
  MapPin,
  Flame,
  Check
} from 'lucide-react';
import { emergencyService } from '../services/api';
import SignIllustration from '../components/SignIllustration';

export default function EmergencySafety({ onSelectDemo }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [emergencyProfile, setEmergencyProfile] = useState(emergencyService.getEmergencyProfile());
  const [checkIns, setCheckIns] = useState(emergencyService.getSafePlaceCheckIns());
  const [checkInMsg, setCheckInMsg] = useState('');

  const messages = emergencyService.getEmergencyMessages();
  const filteredMessages = activeCategory === 'All'
    ? messages
    : messages.filter((m) => m.category.toLowerCase().includes(activeCategory.toLowerCase()));

  const speak = (text) => {
    if ('speechSynthesis' in window && text) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(id);
    setTimeout(() => setCopyFeedback(null), 1500);
  };

  const handleQuickCheckIn = (status) => {
    const newEntry = emergencyService.addCheckIn({
      status,
      message: checkInMsg || `Status update: ${status}`,
      location: 'Coimbatore, Tamil Nadu'
    });
    setCheckIns(emergencyService.getSafePlaceCheckIns());
    setCheckInMsg('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span>Emergency SOS & Safety Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Emergency & Safety Centre
          </h1>
          <p className="text-xs sm:text-sm text-red-100 leading-relaxed">
            High-contrast rapid communication cards, bilingual Tamil emergency speech vocalizers, and official medical contact profiles for urgent safety scenarios.
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
          <a
            href="tel:112"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-red-600 text-sm font-extrabold shadow-lg hover:bg-red-50 transition-all hover:scale-105"
          >
            <PhoneCall className="w-5 h-5 text-red-600" />
            <span>Call National Emergency: 112</span>
          </a>
        </div>
      </div>

      {/* EMERGENCY CATEGORY FILTER BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Medical', 'Personal Safety', 'Police', 'Fire', 'Communication'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeCategory === cat
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* PREDEFINED HIGH-CONTRAST RAPID CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMessages.map((msg) => (
          <div
            key={msg.id}
            className="bg-white rounded-3xl border-2 border-red-100 hover:border-red-400 p-6 shadow-sm hover:shadow-card transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                  {msg.category}
                </span>
                <span className="text-xs font-extrabold text-red-600 animate-pulse">
                  CRITICAL
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <SignIllustration term={msg.sign_term || 'Help'} size="md" className="shrink-0" />
                <h3 className="text-lg font-bold text-slate-900">{msg.title}</h3>
              </div>

              {/* English & Tamil Statements */}
              <div className="space-y-3 bg-red-50/50 p-4 rounded-2xl border border-red-100 mb-4">
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  "{msg.english_text}"
                </p>
                <p className="text-xs font-semibold text-purple-900 leading-relaxed border-t border-red-200/50 pt-2">
                  "{msg.tamil_text}"
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => speak(`${msg.english_text}. ${msg.tamil_text}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" /> Speak Aloud
              </button>

              <button
                onClick={() => copyText(`${msg.english_text} / ${msg.tamil_text}`, msg.id)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                title="Copy statement"
              >
                {copyFeedback === msg.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>

              {msg.sign_term && (
                <button
                  onClick={() => onSelectDemo({ term: msg.sign_term, category: 'Emergency & Safety' })}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition-colors"
                >
                  <Video className="w-3.5 h-3.5" /> Watch Guide
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* EMERGENCY PROFILE & SAFEPLACE CHECK-IN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Emergency Info Card (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5 text-red-600 fill-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Personal Emergency Card</h3>
              <p className="text-xs text-slate-500">Accessible medical summary and emergency contacts.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Primary Contact
              </span>
              <p className="text-sm font-bold text-slate-900">{emergencyProfile.primary_contact_name}</p>
              <a href={`tel:${emergencyProfile.primary_contact_phone}`} className="text-xs font-semibold text-blue-600 hover:underline">
                {emergencyProfile.primary_contact_phone}
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Secondary Contact
              </span>
              <p className="text-sm font-bold text-slate-900">{emergencyProfile.secondary_contact_name}</p>
              <a href={`tel:${emergencyProfile.secondary_contact_phone}`} className="text-xs font-semibold text-blue-600 hover:underline">
                {emergencyProfile.secondary_contact_phone}
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Blood Group & Allergies
              </span>
              <p className="text-sm font-bold text-slate-900">{emergencyProfile.blood_group}</p>
              <p className="text-xs text-slate-600">{emergencyProfile.allergies}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Preferred Hospital
              </span>
              <p className="text-sm font-bold text-slate-900">{emergencyProfile.preferred_hospital}</p>
              <p className="text-xs text-slate-600">{emergencyProfile.chronic_conditions}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 leading-relaxed font-medium">
            <span className="font-bold block mb-1">Deaf Communication Instruction:</span>
            "{emergencyProfile.sign_language_note}"
          </div>
        </div>

        {/* SafePlace Check-in (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">SafePlace Status</h3>
              <p className="text-xs text-slate-500">Quick safety check-ins for trusted contacts.</p>
            </div>
          </div>

          <input
            type="text"
            value={checkInMsg}
            onChange={(e) => setCheckInMsg(e.target.value)}
            placeholder="Add optional location note (e.g. Arrived at college)..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
          />

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickCheckIn('Safe')}
              className="py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors"
            >
              I Am Safe
            </button>
            <button
              onClick={() => handleQuickCheckIn('Transit')}
              className="py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors"
            >
              Travelling
            </button>
            <button
              onClick={() => handleQuickCheckIn('Need Assist')}
              className="py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-colors"
            >
              Need Assist
            </button>
          </div>

          {/* Recent check-ins list */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Recent Check-Ins ({checkIns.length})
            </span>
            {checkIns.slice(0, 3).map((chk) => (
              <div key={chk.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">{chk.status}</span>
                  <p className="text-[11px] text-slate-500">{chk.message}</p>
                </div>
                <span className="text-[10px] text-slate-400">Just now</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
