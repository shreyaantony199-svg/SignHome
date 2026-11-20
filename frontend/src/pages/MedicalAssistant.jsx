import React, { useState } from 'react';
import {
  Stethoscope,
  Volume2,
  Copy,
  BookmarkPlus,
  Video,
  AlertCircle,
  CheckCircle,
  Activity,
  Heart,
  ShieldCheck,
  Check
} from 'lucide-react';
import SignIllustration from '../components/SignIllustration';
import { savedPhrasesService, vocabularyService } from '../services/api';

export default function MedicalAssistant({ onSelectDemo }) {
  const [selectedBodyPart, setSelectedBodyPart] = useState('Head & Brain');
  const [selectedSymptoms, setSelectedSymptoms] = useState(['Severe Pain']);
  const [painLevel, setPainLevel] = useState(7);
  const [duration, setDuration] = useState('2 hours ago');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  const BODY_PARTS = [
    { id: 'head', name: 'Head & Brain', sign: 'Headache', ta: 'தலை' },
    { id: 'chest', name: 'Chest & Heart', sign: 'Heart Attack', ta: 'மார்பு' },
    { id: 'stomach', name: 'Stomach & Abdomen', sign: 'Stomach Pain', ta: 'வயிறு' },
    { id: 'throat', name: 'Throat & Breathing', sign: 'Cough', ta: 'தொண்டை' },
    { id: 'limbs', name: 'Arms & Legs', sign: 'Fracture', ta: 'கைகள் / கால்கள்' },
    { id: 'skin', name: 'Skin & Allergy', sign: 'Allergy', ta: 'தோல்' }
  ];

  const SYMPTOMS_LIST = [
    { name: 'Severe Pain', sign: 'Pain', ta: 'கடுமையான வலி' },
    { name: 'High Fever', sign: 'Fever', ta: 'அதிக காய்ச்சல்' },
    { name: 'Breathing Difficulty', sign: 'Breathing Problem', ta: 'சுவாச பிரச்சனை' },
    { name: 'Persistent Cough', sign: 'Cough', ta: 'இருமல்' },
    { name: 'Bone Injury / Fracture', sign: 'Fracture', ta: 'எலும்பு முறிவு' },
    { name: 'Allergic Reaction', sign: 'Allergy', ta: 'ஒவ்வாமை' },
    { name: 'Dizziness / Nausea', sign: 'Tired', ta: 'தலைசுற்றல்' },
    { name: 'Physical Cut / Bleeding', sign: 'Injury', ta: 'காயம்' }
  ];

  const toggleSymptom = (symName) => {
    if (selectedSymptoms.includes(symName)) {
      if (selectedSymptoms.length > 1) {
        setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symName));
      }
    } else {
      setSelectedSymptoms([...selectedSymptoms, symName]);
    }
  };

  // Generate structured medical communication sentence
  const generatedEnglish = `I am experiencing ${selectedSymptoms.join(' and ')} in my ${selectedBodyPart} with a pain intensity of ${painLevel}/10, which started ${duration}.${additionalNotes ? ` Note: ${additionalNotes}.` : ''} I communicate using Indian Sign Language.`;

  const generatedTamil = `எனக்கு எனது ${selectedBodyPart}-ல் வலி அளவு ${painLevel}/10 கொண்ட ${selectedSymptoms.join(' மற்றும் ')} ஏற்படுகிறது, இது ${duration} தொடங்கியது. நான் இந்திய சைகை மொழியைப் பயன்படுத்துகிறேன்.`;

  const speak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(generatedEnglish);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const copyStatement = () => {
    navigator.clipboard.writeText(`${generatedEnglish}\n\n${generatedTamil}`);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 1500);
  };

  const saveReport = () => {
    savedPhrasesService.add({
      text: generatedEnglish,
      tamil_text: generatedTamil,
      category: 'Medical',
      is_emergency: painLevel >= 8
    });
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mb-2">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Clinical Communication Assistant</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Medical Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Express symptoms, pain levels, and medical history with structured ISL demonstrations and vocal output.
          </p>
        </div>

        {/* Disclaimer Tag */}
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium max-w-xs shrink-0">
          <span className="font-bold block">Medical Communication Notice:</span>
          This tool assists communication with healthcare staff; it is not a diagnostic device.
        </div>
      </div>

      {/* Main Medical Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Body Part Selector */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              1. Select Affected Area:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BODY_PARTS.map((bp) => {
                const isSelected = selectedBodyPart === bp.name;
                return (
                  <button
                    key={bp.id}
                    onClick={() => setSelectedBodyPart(bp.name)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <SignIllustration term={bp.sign} size="sm" className="w-8 h-8 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs truncate">{bp.name}</div>
                      <div className="text-[10px] text-purple-700 font-semibold">{bp.ta}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Symptom Selector Checklist */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              2. Select Symptoms:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SYMPTOMS_LIST.map((sym) => {
                const isChecked = selectedSymptoms.includes(sym.name);
                return (
                  <button
                    key={sym.name}
                    onClick={() => toggleSymptom(sym.name)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      isChecked
                        ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="truncate">{sym.name}</div>
                    <div className="text-[10px] text-purple-700 mt-0.5">{sym.ta}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Pain Intensity & Duration */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                3. Pain Intensity (Wong-Baker Scale):
              </span>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                painLevel >= 8 ? 'bg-red-100 text-red-700' : painLevel >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                Level {painLevel} / 10 ({painLevel >= 8 ? 'Severe' : painLevel >= 5 ? 'Moderate' : 'Mild'})
              </span>
            </div>

            <input
              type="range"
              min={1}
              max={10}
              value={painLevel}
              onChange={(e) => setPainLevel(parseInt(e.target.value, 10))}
              className="w-full h-2.5 bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 rounded-lg appearance-none cursor-pointer"
            />

            <div className="pt-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                When did symptoms begin?
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Just now', '2 hours ago', 'Yesterday', 'Past 3 days'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`p-2 rounded-xl text-xs font-bold transition-all ${
                      duration === d
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Output: Generated Sentence, Tamil & Sign Previews (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Generated Clinical Statement
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Ready to Present
              </span>
            </div>

            {/* English Clinical Text */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold leading-relaxed">
              "{generatedEnglish}"
            </div>

            {/* Tamil Translation */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-purple-950 text-xs font-semibold leading-relaxed">
              <span className="text-[10px] uppercase font-bold text-purple-700 block mb-1">
                தமிழ் மொழிபெயர்ப்பு:
              </span>
              "{generatedTamil}"
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={speak}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                <Volume2 className="w-4 h-4" /> Vocalize for Doctor
              </button>

              <button
                onClick={copyStatement}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                {copyFeedback ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copyFeedback ? 'Copied' : 'Copy'}
              </button>

              <button
                onClick={saveReport}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition-colors ml-auto"
              >
                <BookmarkPlus className="w-4 h-4" />
                {saveFeedback ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>

          {/* Verified Sign Demonstrations for Symptoms */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Relevant ISL Sign Demonstrations
            </h4>
            <div className="space-y-2">
              {['Headache', 'Pain', 'Fever', 'Doctor', 'Ambulance'].map((signName) => (
                <div
                  key={signName}
                  onClick={() => onSelectDemo({ term: signName, category: 'Medical & Health' })}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 cursor-pointer border border-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <SignIllustration term={signName} size="sm" className="w-8 h-8" />
                    <span className="text-xs font-bold text-slate-800">{signName}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                    <Video className="w-3.5 h-3.5" /> Watch Guide
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
