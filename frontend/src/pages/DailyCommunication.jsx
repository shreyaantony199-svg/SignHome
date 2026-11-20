import React, { useState } from 'react';
import {
  MessageSquareText,
  Volume2,
  Copy,
  Plus,
  Trash2,
  BookmarkPlus,
  Video,
  Train,
  Bus,
  Building,
  GraduationCap,
  Sparkles,
  Info,
  Check
} from 'lucide-react';
import SignIllustration from '../components/SignIllustration';
import { savedPhrasesService, vocabularyService } from '../services/api';

export default function DailyCommunication({ onSelectDemo }) {
  const [activeTab, setActiveTab] = useState('scenarios'); // 'scenarios', 'builder'
  const [activeScenario, setActiveScenario] = useState('Railway Station');
  const [builtCards, setBuiltCards] = useState(['I', 'Need', 'Water', 'Please']);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [saveFeedback, setSaveFeedback] = useState(false);

  const SCENARIOS = [
    {
      name: 'Railway Station',
      icon: Train,
      phrases: [
        { en: 'Where is Platform number 1?', ta: 'நடைமேடை எண் 1 எங்கே உள்ளது?', sign: 'Train' },
        { en: 'When will the Coimbatore Express train arrive?', ta: 'கோவை எக்ஸ்பிரஸ் ரயில் எப்போது வரும்?', sign: 'Time' },
        { en: 'I need to buy a general ticket.', ta: 'நான் பொது டிக்கெட் வாங்க வேண்டும்.', sign: 'Ticket' },
        { en: 'Is there a wheelchair assistance facility here?', ta: 'இங்கு சக்கர நாற்காலி உதவி வசதி உள்ளதா?', sign: 'Help' },
      ]
    },
    {
      name: 'Bus Station',
      icon: Bus,
      phrases: [
        { en: 'Does this bus go to the general hospital?', ta: 'இந்தப் பேருந்து அரசு மருத்துவமனைக்குச் செல்லுமா?', sign: 'Bus' },
        { en: 'Please alert me when my stop arrives.', ta: 'எனது நிறுத்தம் வரும்போது எனக்குத் தெரியப்படுத்துங்கள்.', sign: 'Bus Stop' },
        { en: 'How much is the bus ticket fare?', ta: 'பேருந்து டிக்கெட் கட்டணம் எவ்வளவு?', sign: 'Money' },
      ]
    },
    {
      name: 'Bank & Administration',
      icon: Building,
      phrases: [
        { en: 'I want to open a savings bank account.', ta: 'நான் சேமிப்புக் கணக்கு தொடங்க விரும்புகிறேன்.', sign: 'Bank' },
        { en: 'Where do I deposit this cheque?', ta: 'இந்த காசோலையை எங்கு டெபாசிட் செய்வது?', sign: 'Account' },
        { en: 'I need assistance filling out this form.', ta: 'இந்த படிவத்தை நிரப்ப எனக்கு உதவி தேவை.', sign: 'Help' },
      ]
    },
    {
      name: 'College & Education',
      icon: GraduationCap,
      phrases: [
        { en: 'Where is the computer science lecture hall?', ta: 'கணினி அறிவியல் விரிவுரை அரங்கம் எங்கே உள்ளது?', sign: 'College' },
        { en: 'Could you share the classroom lecture notes?', ta: 'வகுப்பறை பாடக் குறிப்புகளைப் பகிர முடியுமா?', sign: 'Book' },
        { en: 'When will the semester exams start?', ta: 'பருவத் தேர்வுகள் எப்போது தொடங்கும்?', sign: 'Exam' },
      ]
    }
  ];

  const CARD_BANK = [
    { word: 'I', ta: 'நான்' },
    { word: 'Need', ta: 'வேண்டும்' },
    { word: 'Water', ta: 'தண்ணீர்' },
    { word: 'Food', ta: 'உணவு' },
    { word: 'Help', ta: 'உதவி' },
    { word: 'Doctor', ta: 'மருத்துவர்' },
    { word: 'Hospital', ta: 'மருத்துவமனை' },
    { word: 'Home', ta: 'வீடு' },
    { word: 'Please', ta: 'தயவுசெய்து' },
    { word: 'Thank You', ta: 'நன்றி' },
    { word: 'Where', ta: 'எங்கே' },
    { word: 'Time', ta: 'நேரம்' },
    { word: 'Money', ta: 'பணம்' },
    { word: 'Ticket', ta: 'டிக்கெட்' }
  ];

  const currentScenarioData = SCENARIOS.find((s) => s.name === activeScenario) || SCENARIOS[0];

  const speak = (text) => {
    if ('speechSynthesis' in window && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(id);
    setTimeout(() => setCopyFeedback(null), 1500);
  };

  const addCard = (word) => {
    setBuiltCards([...builtCards, word]);
  };

  const removeCard = (index) => {
    setBuiltCards(builtCards.filter((_, i) => i !== index));
  };

  const assembledSentence = builtCards.join(' ');

  const saveBuiltSentence = () => {
    if (assembledSentence.trim()) {
      savedPhrasesService.add({
        text: assembledSentence,
        category: 'Conversation Builder'
      });
      setSaveFeedback(true);
      setTimeout(() => setSaveFeedback(false), 1500);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 mb-2">
            <MessageSquareText className="w-3.5 h-3.5" />
            <span>Public Transit & Everyday Dialogue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Daily Communication
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access contextual public scenarios and construct multi-word phrases using the interactive card builder.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl self-start sm:self-center">
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'scenarios' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Public Scenarios
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'builder' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Conversation Builder
          </button>
        </div>
      </div>

      {/* TAB 1: PUBLIC SCENARIOS */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          {/* Scenario Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {SCENARIOS.map((sc) => {
              const Icon = sc.icon;
              const isActive = activeScenario === sc.name;
              return (
                <button
                  key={sc.name}
                  onClick={() => setActiveScenario(sc.name)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{sc.name}</span>
                </button>
              );
            })}
          </div>

          {/* Scenario Phrases Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentScenarioData.phrases.map((phrase, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {currentScenarioData.name}
                    </span>
                    <button
                      onClick={() => onSelectDemo({ term: phrase.sign, category: 'Public Services' })}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:underline"
                    >
                      <Video className="w-3.5 h-3.5" /> Watch Guide: {phrase.sign}
                    </button>
                  </div>

                  <div className="flex items-start gap-4 mb-4">
                    <SignIllustration term={phrase.sign} size="md" className="shrink-0" />
                    <div>
                      <h4 className="text-base font-bold text-slate-900 leading-snug">
                        "{phrase.en}"
                      </h4>
                      <p className="text-xs font-semibold text-purple-700 mt-1">
                        "{phrase.ta}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => speak(`${phrase.en}. ${phrase.ta}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Vocalize
                  </button>

                  <button
                    onClick={() => copyText(`${phrase.en} / ${phrase.ta}`, `${currentScenarioData.name}-${idx}`)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                    title="Copy phrase"
                  >
                    {copyFeedback === `${currentScenarioData.name}-${idx}` ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CONVERSATION BUILDER */}
      {activeTab === 'builder' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Builder Canvas Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Sentence Construction Stage
              </h3>
              <button
                onClick={() => setBuiltCards([])}
                className="text-xs font-semibold text-red-600 hover:underline inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Cards
              </button>
            </div>

            {/* Assembled Cards Chips */}
            <div className="min-h-[100px] p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-3">
              {builtCards.length > 0 ? (
                builtCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-xs font-bold text-blue-900 shadow-xs"
                  >
                    <SignIllustration term={card} size="sm" className="w-6 h-6 border-0 bg-transparent" />
                    <span>{card}</span>
                    <button
                      onClick={() => removeCard(idx)}
                      className="p-0.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Click vocabulary cards below to build your statement...
                </span>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => speak(assembledSentence)}
                disabled={!assembledSentence}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-40 shadow-xs transition-colors"
              >
                <Volume2 className="w-4 h-4" /> Vocalize Sentence
              </button>

              <button
                onClick={saveBuiltSentence}
                disabled={!assembledSentence}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold disabled:opacity-40 transition-colors"
              >
                <BookmarkPlus className="w-4 h-4" /> {saveFeedback ? 'Saved!' : 'Save Statement'}
              </button>
            </div>
          </div>

          {/* Grammar Educational Notice */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Linguistic Distinction Note:</span> English card arrangement uses Subject-Verb-Object (SVO), whereas genuine Indian Sign Language (ISL) grammar uses natural topicalized syntax (Time-Location-Object-Subject-Verb) complemented by facial non-manual expressions.
            </div>
          </div>

          {/* Card Bank Palette */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Click Cards to Add to Sentence:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {CARD_BANK.map((item) => (
                <button
                  key={item.word}
                  onClick={() => addCard(item.word)}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/60 transition-all flex flex-col items-center text-center group"
                >
                  <SignIllustration term={item.word} size="sm" className="w-8 h-8 mb-1 group-hover:scale-105" />
                  <span className="text-xs font-bold text-slate-900">{item.word}</span>
                  <span className="text-[10px] text-purple-700 font-semibold">{item.ta}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
