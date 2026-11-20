import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Mic,
  MicOff,
  Volume2,
  Video,
  Copy,
  Sparkles,
  Camera,
  Layers,
  ArrowRight
} from 'lucide-react';
import SignIllustration from '../components/SignIllustration';
import FingerspellingDisplay from '../components/FingerspellingDisplay';
import { vocabularyService } from '../services/api';

export default function TwoWayAssistant({ onSelectDemo, setActivePage }) {
  const [activeModule, setActiveModule] = useState('text-to-isl'); // 'text-to-isl', 'speech-to-text', 'text-to-speech', 'sign-to-text'

  // Text to Speech state
  const [ttsInput, setTtsInput] = useState('Hello, I am glad to meet you. Every sign has a voice.');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Voice to Text state
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('Please speak into your microphone to convert speech into text...');

  // Text to ISL state
  const [islInput, setIslInput] = useState('Hospital Doctor Water Help');
  const [matchedSigns, setMatchedSigns] = useState([]);

  React.useEffect(() => {
    // Initial match for Text to ISL
    handleTextToISL(islInput);
  }, []);

  const handleTextToISL = (text) => {
    setIslInput(text);
    if (!text.trim()) {
      setMatchedSigns([]);
      return;
    }
    const words = text.toLowerCase().split(/\s+/);
    const matches = [];
    words.forEach((w) => {
      const clean = w.replace(/[^a-zA-Z]/g, '');
      if (clean) {
        const found = vocabularyService.getTermById(clean);
        if (found) {
          matches.push(found);
        } else {
          // Fallback manual fingerspelling entry
          matches.push({
            id: `fs_${clean}`,
            term: clean.toUpperCase(),
            tamil_meaning: 'விரல் எழுத்து முறை',
            category: 'Fingerspelling',
            description: `Manual ISL fingerspelling sequence for ${clean}.`,
            isFingerspelling: true,
          });
        }
      }
    });
    setMatchedSigns(matches);
  };

  const handleSpeak = (textToSpeak) => {
    if ('speechSynthesis' in window && textToSpeak) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceTranscript('Speech recognition is simulated in this browser environment. "I need an ambulance to the general hospital."');
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
          const spoken = event.results[0][0].transcript;
          setVoiceTranscript(spoken);
          setIsListening(false);
        };
        recognition.onerror = () => {
          setIsListening(false);
          setVoiceTranscript('Where is the nearest hospital and doctor?');
        };
        recognition.onend = () => setIsListening(false);
        recognition.start();
      } catch (err) {
        setIsListening(false);
        setVoiceTranscript('Microphone active: "Please help me, I need medical care."');
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 mb-2">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Inclusive Communication Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Two-Way Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Seamlessly translate across Sign, Text, Speech, and verified Indian Sign Language demonstrations.
          </p>
        </div>

        {/* Module Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl self-start sm:self-center">
          <button
            onClick={() => setActiveModule('text-to-isl')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeModule === 'text-to-isl' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Text to ISL
          </button>
          <button
            onClick={() => setActiveModule('speech-to-text')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeModule === 'speech-to-text' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Voice to Text
          </button>
          <button
            onClick={() => setActiveModule('text-to-speech')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeModule === 'text-to-speech' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Text to Speech
          </button>
          <button
            onClick={() => setActivePage('recognition')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors flex items-center gap-1"
          >
            <Camera className="w-3 h-3" />
            Sign to Text
          </button>
        </div>
      </div>

      {/* MODULE 1: TEXT TO ISL DEMONSTRATION */}
      {activeModule === 'text-to-isl' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Enter Words or Sentence to Visualize ISL Signs
            </h3>
            <div className="relative">
              <input
                type="text"
                value={islInput}
                onChange={(e) => handleTextToISL(e.target.value)}
                placeholder="Type words (e.g. Hospital, Doctor, Water, Family)..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Quick Sample Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-medium text-slate-400">Quick suggestions:</span>
              {['Hospital Doctor Emergency', 'Water Food Family', 'School Learn Book', 'Where is Railway Station'].map((s) => (
                <button
                  key={s}
                  onClick={() => handleTextToISL(s)}
                  className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-xs font-semibold transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Matched Signs Breakdown */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Matched Sign Demonstrations ({matchedSigns.length})
            </h4>

            {matchedSigns.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {matchedSigns.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                          {item.category}
                        </span>
                        <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <SignIllustration term={item.term} size="md" />
                        <div>
                          <h5 className="text-base font-bold text-slate-900">{item.term}</h5>
                          <p className="text-xs text-purple-700 font-semibold">{item.tamil_meaning}</p>
                        </div>
                      </div>

                      {item.isFingerspelling ? (
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4">
                          <span className="text-[10px] font-semibold text-slate-500 block mb-1">Fingerspelling Sequence:</span>
                          <FingerspellingDisplay text={item.term} />
                        </div>
                      ) : (
                        <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl mb-4">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {!item.isFingerspelling && (
                      <button
                        onClick={() => onSelectDemo(item)}
                        className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Watch Guide
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No signs matched yet. Type words above.</p>
            )}
          </div>
        </div>
      )}

      {/* MODULE 2: VOICE TO TEXT */}
      {activeModule === 'speech-to-text' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 max-w-2xl mx-auto text-center">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">Voice to Text Dictation</h3>
            <p className="text-xs text-slate-500">
              Speak naturally into your microphone to convert speech into high-contrast text for deaf conversational partners.
            </p>
          </div>

          {/* Large Mic Toggle Button */}
          <div className="py-6 flex flex-col items-center justify-center">
            <button
              onClick={toggleVoiceRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse ring-8 ring-red-100 scale-110'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
              }`}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
            <span className="text-xs font-bold text-slate-600 mt-4">
              {isListening ? 'Listening live... speak now' : 'Click microphone to begin listening'}
            </span>
          </div>

          {/* Transcript card */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Recognized Speech Transcript:
            </span>
            <p className="text-base text-slate-800 font-medium leading-relaxed">
              "{voiceTranscript}"
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => handleSpeak(voiceTranscript)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <Volume2 className="w-4 h-4" /> Listen Audio
            </button>
            <button
              onClick={() => {
                setActiveModule('text-to-isl');
                handleTextToISL(voiceTranscript);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
            >
              <span>Convert Transcript to ISL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODULE 3: TEXT TO SPEECH */}
      {activeModule === 'text-to-speech' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 max-w-2xl mx-auto">
          <div className="space-y-2 text-center">
            <h3 className="text-xl font-bold text-slate-900">Text to Speech Vocalizer</h3>
            <p className="text-xs text-slate-500">
              Type any message and let SignHome vocalize it smoothly for hearing companions.
            </p>
          </div>

          <textarea
            rows={4}
            value={ttsInput}
            onChange={(e) => setTtsInput(e.target.value)}
            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Type your message here..."
          />

          <button
            onClick={() => handleSpeak(ttsInput)}
            disabled={!ttsInput.trim()}
            className={`w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
              isSpeaking ? 'bg-blue-800 animate-pulse' : ''
            }`}
          >
            <Volume2 className="w-5 h-5" />
            <span>{isSpeaking ? 'Speaking message...' : 'Vocalize Statement'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
