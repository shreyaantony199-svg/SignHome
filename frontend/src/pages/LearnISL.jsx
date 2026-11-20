import React, { useState } from 'react';
import {
  Search,
  Filter,
  BookOpen,
  Sparkles,
  Video,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Layers,
  Hash,
  CheckCircle2,
  Clock,
  Sparkle
} from 'lucide-react';
import { vocabularyService } from '../services/api';
import SignCard from '../components/SignCard';
import SignIllustration from '../components/SignIllustration';
import {
  SUPPORTED_ALPHABETS,
  SUPPORTED_NUMBERS,
  DISPLAY_MAP,
  TAMIL_MAP
} from '../services/islClassifier';

export default function LearnISL({ onSelectDemo, setActivePage }) {
  const [activeTab, setActiveTab] = useState('dictionary'); // 'dictionary', 'alphabet', 'numbers'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAlphabet, setSelectedAlphabet] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const metadata = vocabularyService.getSourcesMetadata();
  const paginatedResult = vocabularyService.searchVocabulary({
    query: searchQuery,
    category: selectedCategory,
    alphabet: selectedAlphabet,
    page: currentPage,
    limit: 12
  });

  const alphabetSigns = vocabularyService.getAlphabetSigns();
  const allNumberSigns = vocabularyService.getNumberSigns();

  // Separate 0-9 single digits from higher numbers
  const DIGIT_MAP = {
    'Zero': '0', 'One': '1', 'Two': '2', 'Three': '3', 'Four': '4',
    'Five': '5', 'Six': '6', 'Seven': '7', 'Eight': '8', 'Nine': '9'
  };

  const digits0to9 = allNumberSigns.filter(s => DIGIT_MAP[s.term] !== undefined);
  const higherNumbers = allNumberSigns.filter(s => DIGIT_MAP[s.term] === undefined);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleAlphabetChange = (letter) => {
    setSelectedAlphabet(letter);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Official Linguistic Resource Centre</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Learn Indian Sign Language
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Master the manual alphabet, numerals, and {paginatedResult.total_count} verified vocabulary terms with step-by-step sign posture guides.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl self-start lg:self-center">
          <button
            onClick={() => setActiveTab('dictionary')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'dictionary'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Complete Dictionary ({paginatedResult.total_count})
          </button>
          <button
            onClick={() => setActiveTab('alphabet')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'alphabet'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Alphabet (A–Z)
          </button>
          <button
            onClick={() => setActiveTab('numbers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'numbers'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Numbers (0–9 & beyond)
          </button>
        </div>
      </div>

      {/* METRIC COUNTER ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Terms Indexed</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{metadata.total_terms_indexed || 400}</div>
          <div className="text-[10px] text-blue-600 font-semibold mt-0.5">Comprehensive ISL Glosses</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Trained Signs</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">33 Classes</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">24 Alphabets + 9 Numbers</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Thematic Categories</div>
          <div className="text-2xl font-black text-purple-600 mt-1">{metadata.categories_count || 22}</div>
          <div className="text-[10px] text-purple-600 font-semibold mt-0.5">Health, Emergency, Transit, etc.</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Model Accuracy</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">95.96%</div>
          <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">Random Forest on Landmarks</div>
        </div>
      </div>

      {/* TAB 1: COMPLETE SEARCHABLE DICTIONARY */}
      {activeTab === 'dictionary' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search in English (e.g. Hospital, Water) or Tamil (மருத்துவமனை, உதவி)..."
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full md:w-56 px-3 py-2 text-xs font-semibold rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 text-slate-700"
              >
                {paginatedResult.categories.map((c) => (
                  <option key={c} value={c}>
                    Category: {c}
                  </option>
                ))}
              </select>
            </div>

            {/* A-Z Alphabet Filter Pills */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[11px] font-bold text-slate-400 mr-2 shrink-0">Browse A–Z:</span>
              {paginatedResult.alphabets.map((alpha) => (
                <button
                  key={alpha}
                  onClick={() => handleAlphabetChange(alpha)}
                  className={`min-w-[28px] h-7 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                    selectedAlphabet === alpha
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {alpha}
                </button>
              ))}
            </div>
          </div>

          {/* Results Grid */}
          {paginatedResult.items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedResult.items.map((sign) => (
                <SignCard
                  key={sign.id}
                  sign={sign}
                  onSelectDemo={onSelectDemo}
                  onPractice={() => setActivePage('practice')}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <SignIllustration term="Water" size="md" className="mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No matching vocabulary found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching for general words like "Doctor", "Hello", "Family", or reset your category and alphabet filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedAlphabet('All');
                }}
                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {paginatedResult.total_pages > 1 && (
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500">
                Page <span className="font-bold text-slate-900">{currentPage}</span> of{' '}
                <span className="font-bold text-slate-900">{paginatedResult.total_pages}</span> ({paginatedResult.total_count} total signs)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  disabled={currentPage >= paginatedResult.total_pages}
                  onClick={() => setCurrentPage((p) => Math.min(paginatedResult.total_pages, p + 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALPHABET (A-Z) WITH DATASET INTEGRATION */}
      {activeTab === 'alphabet' && (
        <div className="space-y-6">
          <div className="bg-blue-50/70 p-5 rounded-3xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-100/60 px-2.5 py-0.5 rounded-full mb-1">
                <span>Static Landmarks Dataset Integration</span>
              </div>
              <h3 className="text-base font-bold text-blue-900">
                Indian Sign Language Manual Alphabet (A to Z)
              </h3>
              <p className="text-xs text-blue-700 mt-0.5">
                ISL predominantly employs dual-handed fingerspelling shapes. 24 alphabets are fully trained and recognized by the live camera model.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivePage('live')}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm transition-all shrink-0 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Test in Live Recognition</span>
              </button>
            </div>
          </div>

          {/* Coverage Summary Indicator */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>24 Alphabets: Real-Time Supported</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>H, J: Training Dataset Pending (Not in static dataset)</span>
            </span>
          </div>

          {/* Alphabet Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {alphabetSigns.map((sign) => {
              const letter = sign.term.toUpperCase();
              const isSupported = SUPPORTED_ALPHABETS.includes(letter);
              const tamilGloss = TAMIL_MAP[letter.toLowerCase()] || sign.tamil_meaning;

              return (
                <div
                  key={sign.id}
                  onClick={() => onSelectDemo(sign)}
                  className={`bg-white p-4 rounded-2xl border transition-all flex flex-col items-center text-center group cursor-pointer ${
                    isSupported
                      ? 'border-slate-200 hover:border-blue-400 hover:shadow-card shadow-xs'
                      : 'border-slate-200/80 bg-slate-50/50 hover:border-slate-300 opacity-90'
                  }`}
                >
                  {/* Badge */}
                  <div className="w-full flex justify-end mb-1">
                    {isSupported ? (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Supported</span>
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-slate-400" />
                        <span>Dataset Pending</span>
                      </span>
                    )}
                  </div>

                  {/* Sign Illustration */}
                  <SignIllustration
                    term={sign.term}
                    size="md"
                    className="mb-2 group-hover:scale-105 transition-transform"
                  />

                  {/* Symbol */}
                  <span className="text-2xl font-black text-slate-900 group-hover:text-blue-600">
                    {sign.term}
                  </span>

                  {/* Gesture Name */}
                  <span className="text-xs font-bold text-slate-600 mt-0.5">
                    Alphabet {sign.term}
                  </span>

                  {/* Tamil Meaning from Recognition System */}
                  <span className="text-[11px] text-purple-700 font-semibold mt-0.5">
                    {tamilGloss}
                  </span>

                  {/* Support note */}
                  <span className="text-[10px] text-slate-400 mt-2 line-clamp-2">
                    {isSupported
                      ? 'Recognized by live camera model'
                      : 'Dynamic sign (H/J pending in dataset)'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: NUMBERS SECTION (0-9 DATASET SCOPE + HIGHER NUMBERS) */}
      {activeTab === 'numbers' && (
        <div className="space-y-6">
          <div className="bg-purple-50/70 p-5 rounded-3xl border border-purple-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-700 bg-purple-100/60 px-2.5 py-0.5 rounded-full mb-1">
                <span>Static Landmarks Dataset Integration</span>
              </div>
              <h3 className="text-base font-bold text-purple-900">
                Indian Sign Language Numbers (0 to 9 & Beyond)
              </h3>
              <p className="text-xs text-purple-700 mt-0.5">
                ISL numbers 0 to 9 are fingerspelled digits. 9 numbers (0-5, 7-9) are actively classified by the trained model.
              </p>
            </div>
            <button
              onClick={() => setActivePage('live')}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-sm transition-all shrink-0 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Test Numbers in Live Camera</span>
            </button>
          </div>

          {/* Primary 0-9 Dataset Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Primary Digits: 0 to 9
              </h4>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>9 Numbers Supported</span>
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>6 (Pending in Dataset)</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {digits0to9.map((sign) => {
                const digit = DIGIT_MAP[sign.term];
                const isSupported = SUPPORTED_NUMBERS.includes(digit);
                const rawLabel = `num_${digit}`;
                const tamilGloss = TAMIL_MAP[rawLabel] || sign.tamil_meaning;

                return (
                  <div
                    key={sign.id}
                    onClick={() => onSelectDemo(sign)}
                    className={`bg-white p-4 rounded-2xl border transition-all flex flex-col items-center text-center group cursor-pointer ${
                      isSupported
                        ? 'border-slate-200 hover:border-purple-400 hover:shadow-card shadow-xs'
                        : 'border-slate-200/80 bg-slate-50/50 hover:border-slate-300 opacity-90'
                    }`}
                  >
                    {/* Status Badge */}
                    <div className="w-full flex justify-end mb-1">
                      {isSupported ? (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Supported</span>
                        </span>
                      ) : (
                        <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-slate-400" />
                          <span>Dataset Pending</span>
                        </span>
                      )}
                    </div>

                    {/* Illustration */}
                    <SignIllustration
                      term={sign.term}
                      size="md"
                      className="mb-2 group-hover:scale-105 transition-transform"
                    />

                    {/* Large Digit Symbol */}
                    <span className="text-3xl font-black text-slate-900 group-hover:text-purple-600">
                      {digit}
                    </span>

                    {/* Gesture Name */}
                    <span className="text-xs font-bold text-slate-700 mt-0.5">
                      Number {digit} ({sign.term})
                    </span>

                    {/* Tamil Meaning from Recognition System */}
                    <span className="text-[11px] text-purple-700 font-semibold mt-0.5">
                      {tamilGloss}
                    </span>

                    {/* Support Note */}
                    <span className="text-[10px] text-slate-400 mt-2 line-clamp-2">
                      {isSupported
                        ? 'Recognized by live camera model'
                        : 'Digit 6 pending in static dataset'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Extended Multi-Digit ISL Numbers */}
          {higherNumbers.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Higher Numbers & Multiples (Lexical Signs)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {higherNumbers.map((sign) => (
                  <div
                    key={sign.id}
                    onClick={() => onSelectDemo(sign)}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-card hover:border-purple-400 cursor-pointer transition-all flex flex-col items-center text-center group"
                  >
                    <SignIllustration
                      term={sign.term}
                      size="sm"
                      className="mb-2 group-hover:scale-105 transition-transform"
                    />
                    <h5 className="text-base font-bold text-slate-900 group-hover:text-purple-600">
                      {sign.term}
                    </h5>
                    <p className="text-xs text-purple-700 font-semibold mt-0.5">
                      {sign.tamil_meaning}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                      Compound ISL Sign
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
