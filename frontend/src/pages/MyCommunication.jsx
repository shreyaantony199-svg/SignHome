import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  BookmarkPlus,
  History,
  Volume2,
  Trash2,
  User,
  Phone,
  Mail,
  Shield,
  Save,
  Check,
  Search
} from 'lucide-react';
import { authService, savedPhrasesService, recognitionService } from '../services/api';
import SignIllustration from '../components/SignIllustration';

export default function MyCommunication({ user, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('phrases'); // 'phrases', 'history', 'profile'
  const [savedPhrases, setSavedPhrases] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [phraseSearch, setPhraseSearch] = useState('');
  const [newPhraseText, setNewPhraseText] = useState('');
  const [newPhraseCategory, setNewPhraseCategory] = useState('Personal');

  // Profile edit state
  const currentUser = user || authService.getCurrentUser() || {
    name: 'ISL Learner',
    email: 'learner@signhome.in',
    preferred_communication: 'ISL',
    emergency_contact_name: 'Dr. Ramesh Kumar',
    emergency_contact_phone: '+91 98765 43210'
  };

  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileComm, setProfileComm] = useState(currentUser.preferred_communication || 'ISL');
  const [profileContact, setProfileContact] = useState(currentUser.emergency_contact_name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser.emergency_contact_phone || '');
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    setSavedPhrases(savedPhrasesService.getAll());
    setHistoryItems(recognitionService.getRecognitionHistory());
  }, []);

  const handleAddPhrase = (e) => {
    e.preventDefault();
    if (!newPhraseText.trim()) return;
    const added = savedPhrasesService.add({
      text: newPhraseText.trim(),
      category: newPhraseCategory
    });
    setSavedPhrases(savedPhrasesService.getAll());
    setNewPhraseText('');
  };

  const handleDeletePhrase = (id) => {
    const updated = savedPhrasesService.delete(id);
    setSavedPhrases(updated);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('signhome_recognition_history');
    setHistoryItems([]);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const updated = await authService.updateProfile({
      name: profileName,
      preferred_communication: profileComm,
      emergency_contact_name: profileContact,
      emergency_contact_phone: profilePhone
    });
    if (onUpdateUser) onUpdateUser(updated);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 1500);
  };

  const speak = (text) => {
    if ('speechSynthesis' in window && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const filteredPhrases = savedPhrases.filter((p) =>
    p.text.toLowerCase().includes(phraseSearch.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(phraseSearch.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Personalized Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Communication
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your saved sentences, camera session history, and accessibility profile preferences.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl self-start sm:self-center">
          <button
            onClick={() => setActiveTab('phrases')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'phrases' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Saved Phrases ({savedPhrases.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            History ({historyItems.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Profile
          </button>
        </div>
      </div>

      {/* TAB 1: SAVED PHRASES */}
      {activeTab === 'phrases' && (
        <div className="space-y-6">
          {/* Quick Add Phrase Form */}
          <form onSubmit={handleAddPhrase} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              required
              value={newPhraseText}
              onChange={(e) => setNewPhraseText(e.target.value)}
              placeholder="Add a new frequently used phrase..."
              className="flex-1 w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-blue-500"
            />
            <select
              value={newPhraseCategory}
              onChange={(e) => setNewPhraseCategory(e.target.value)}
              className="w-full sm:w-44 px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
            >
              <option value="Personal">Category: Personal</option>
              <option value="Medical">Category: Medical</option>
              <option value="Emergency">Category: Emergency</option>
              <option value="Daily">Category: Daily</option>
            </select>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
            >
              Add Phrase
            </button>
          </form>

          {/* Search Saved */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={phraseSearch}
              onChange={(e) => setPhraseSearch(e.target.value)}
              placeholder="Search through saved phrases..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:border-blue-500"
            />
          </div>

          {/* Phrases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPhrases.map((phrase) => (
              <div
                key={phrase.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {phrase.category}
                    </span>
                    {phrase.is_emergency && (
                      <span className="text-[10px] font-extrabold text-red-600 uppercase">
                        Emergency
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-800 leading-snug">
                    "{phrase.text}"
                  </p>
                  {phrase.tamil_text && (
                    <p className="text-xs text-purple-700 font-medium mt-1">
                      "{phrase.tamil_text}"
                    </p>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => speak(phrase.text)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Vocalize
                  </button>
                  <button
                    onClick={() => handleDeletePhrase(phrase.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete phrase"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: COMMUNICATION HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Camera Session Transcripts</h3>
              <p className="text-xs text-slate-500">Transcripts generated during Live Recognition sessions.</p>
            </div>
            {historyItems.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs font-semibold text-red-600 hover:underline inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear History
              </button>
            )}
          </div>

          <div className="space-y-3">
            {historyItems.length > 0 ? (
              historyItems.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">"{item.phrase}"</p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Logged: {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <button
                    onClick={() => speak(item.phrase)}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
                    title="Vocalize"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-8">
                No recent recognition history. Use the Live Camera page to generate transcripts.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: USER PROFILE & ACCESSIBILITY */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-bold text-slate-900">User Profile & Emergency Details</h3>

          {savedMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Communication</label>
              <select
                value={profileComm}
                onChange={(e) => setProfileComm(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              >
                <option value="ISL">Indian Sign Language (ISL)</option>
                <option value="Both">Both ISL & Spoken Language</option>
                <option value="Speech">Spoken Language</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Name</label>
              <input
                type="text"
                value={profileContact}
                onChange={(e) => setProfileContact(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Phone</label>
              <input
                type="text"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Profile Preferences
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
