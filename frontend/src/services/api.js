import { ISL_VOCABULARY, SOURCE_METADATA } from './dictionaryData';
import {
  extractFeaturesFromHands,
  predictFromFeatures,
  DISPLAY_MAP,
  TAMIL_MAP,
  SUPPORTED_ALPHABETS,
  SUPPORTED_NUMBERS
} from './islClassifier';

const API_BASE_URL = '/api';

// Helper for authorized fetch
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('signhome_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP Error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    // Return fallback where applicable
    throw err;
  }
}

// --- AUTH SERVICES ---
export const authService = {
  async register(data) {
    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.access_token) {
        localStorage.setItem('signhome_token', res.access_token);
        localStorage.setItem('signhome_user', JSON.stringify(res.user));
      }
      return res;
    } catch (e) {
      // Local fallback for offline/demo use
      const demoUser = {
        id: 'usr_' + Date.now(),
        name: data.name,
        email: data.email,
        role: data.role || 'user',
        preferred_communication: data.preferred_communication || 'ISL',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        medical_notes: '',
      };
      const token = 'mock_jwt_' + btoa(JSON.stringify(demoUser));
      localStorage.setItem('signhome_token', token);
      localStorage.setItem('signhome_user', JSON.stringify(demoUser));
      return { access_token: token, user: demoUser };
    }
  },

  async login(email, password) {
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.access_token) {
        localStorage.setItem('signhome_token', res.access_token);
        localStorage.setItem('signhome_user', JSON.stringify(res.user));
      }
      return res;
    } catch (e) {
      // Local fallback
      const stored = localStorage.getItem('signhome_user');
      let user = stored ? JSON.parse(stored) : null;
      if (!user || user.email !== email) {
        user = {
          id: 'usr_default',
          name: email.split('@')[0] || 'User',
          email,
          role: 'user',
          preferred_communication: 'ISL',
        };
      }
      const token = 'mock_jwt_' + btoa(JSON.stringify(user));
      localStorage.setItem('signhome_token', token);
      localStorage.setItem('signhome_user', JSON.stringify(user));
      return { access_token: token, user };
    }
  },

  getCurrentUser() {
    try {
      const u = localStorage.getItem('signhome_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem('signhome_token');
    localStorage.removeItem('signhome_user');
  },

  async updateProfile(updates) {
    try {
      const res = await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      localStorage.setItem('signhome_user', JSON.stringify(res));
      return res;
    } catch (e) {
      const current = authService.getCurrentUser() || {};
      const updated = { ...current, ...updates };
      localStorage.setItem('signhome_user', JSON.stringify(updated));
      return updated;
    }
  }
};

// --- VOCABULARY SERVICES ---
export const vocabularyService = {
  getSourcesMetadata() {
    return SOURCE_METADATA;
  },

  searchVocabulary({ query = '', category = '', alphabet = '', page = 1, limit = 12 }) {
    let filtered = [...ISL_VOCABULARY];

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      filtered = filtered.filter(item => 
        item.term.toLowerCase().includes(q) ||
        (item.tamil_meaning && item.tamil_meaning.includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (category && category !== 'All') {
      filtered = filtered.filter(item => item.category === category);
    }

    if (alphabet && alphabet !== 'All') {
      filtered = filtered.filter(item => item.alphabet_index === alphabet);
    }

    const total_count = filtered.length;
    const total_pages = Math.ceil(total_count / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = filtered.slice(startIndex, startIndex + limit);

    const categories = ['All', ...new Set(ISL_VOCABULARY.map(item => item.category))].sort();
    const alphabets = ['All', ...new Set(ISL_VOCABULARY.map(item => item.alphabet_index).filter(a => a && a !== '#'))].sort();

    return {
      total_count,
      page,
      limit,
      total_pages,
      items: paginatedItems,
      demonstrations_available_count: total_count,
      demonstrations_unavailable_count: 0,
      categories,
      alphabets
    };
  },

  getTermById(id) {
    return ISL_VOCABULARY.find(item => item.id === id || item.term.toLowerCase() === id.toLowerCase()) || null;
  },

  getSignOfTheDay() {
    // Deterministic daily sign based on Julian date
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const index = dayOfYear % ISL_VOCABULARY.length;
    return ISL_VOCABULARY[index];
  },

  getAlphabetSigns() {
    return ISL_VOCABULARY.filter(item => item.category === 'Alphabet');
  },

  getNumberSigns() {
    return ISL_VOCABULARY.filter(item => item.category === 'Numbers');
  }
};

// --- RECOGNITION & ML SERVICE ---
export const recognitionService = {
  async predictGesture(handsLandmarks, secondHand = null) {
    if (!handsLandmarks || handsLandmarks.length === 0) {
      return {
        predicted_gesture: 'No hand detected. Please show your hand clearly.',
        display_char: '',
        raw_label: '',
        confidence: 0,
        is_confident: false,
        tamil_meaning: '',
        alternative_candidates: []
      };
    }

    const handsList = Array.isArray(handsLandmarks[0]) && (typeof handsLandmarks[0][0] === 'object' || Array.isArray(handsLandmarks[0][0]))
      ? handsLandmarks
      : (secondHand ? [handsLandmarks, secondHand] : [handsLandmarks]);

    const features = extractFeaturesFromHands(handsList);
    const localResult = predictFromFeatures(features);

    try {
      const res = await apiFetch('/recognition/predict', {
        method: 'POST',
        body: JSON.stringify({ features: Array.from(features) })
      });
      return res;
    } catch (e) {
      return localResult;
    }
  },

  predictLocal(handsLandmarks) {
    if (!handsLandmarks || handsLandmarks.length === 0) {
      return {
        predicted_gesture: 'No hand detected. Please show your hand clearly.',
        display_char: '',
        raw_label: '',
        confidence: 0,
        is_confident: false,
        tamil_meaning: '',
        alternative_candidates: []
      };
    }
    const features = extractFeaturesFromHands(handsLandmarks);
    return predictFromFeatures(features);
  },

  async getClasses() {
    try {
      return await apiFetch('/recognition/classes');
    } catch (e) {
      return {
        alphabets: SUPPORTED_ALPHABETS,
        numbers: SUPPORTED_NUMBERS,
        display_map: DISPLAY_MAP,
        tamil_map: TAMIL_MAP,
        model_type: 'RandomForestClassifier',
        test_accuracy: 0.96
      };
    }
  },

  saveSessionPhrase(phrase, confidenceAvg) {
    const history = JSON.parse(localStorage.getItem('signhome_recognition_history') || '[]');
    const newEntry = {
      id: 'rec_' + Date.now(),
      phrase,
      confidence_avg: confidenceAvg,
      timestamp: new Date().toISOString(),
    };
    history.unshift(newEntry);
    localStorage.setItem('signhome_recognition_history', JSON.stringify(history.slice(0, 50)));
    return newEntry;
  },

  getRecognitionHistory() {
    return JSON.parse(localStorage.getItem('signhome_recognition_history') || '[]');
  }
};

// --- SAVED PHRASES SERVICE ---
export const savedPhrasesService = {
  getAll() {
    const list = localStorage.getItem('signhome_saved_phrases');
    if (!list) {
      const defaultPhrases = [
        { id: '1', text: 'I communicate using Indian Sign Language.', tamil_text: 'நான் இந்திய சைகை மொழியைப் பயன்படுத்தி தொடர்பு கொள்கிறேன்.', category: 'Personal', is_emergency: false },
        { id: '2', text: 'Where is the nearest hospital?', tamil_text: 'அருகிலுள்ள மருத்துவமனை எங்கே உள்ளது?', category: 'Medical', is_emergency: true },
        { id: '3', text: 'Please call an ambulance immediately.', tamil_text: 'தயவுசெய்து உடனடியாக ஆம்புலன்ஸை அழைக்கவும்.', category: 'Emergency', is_emergency: true },
        { id: '4', text: 'I need water, please.', tamil_text: 'எனக்கு தண்ணீர் வேண்டும், தயவுசெய்து.', category: 'Daily', is_emergency: false },
      ];
      localStorage.setItem('signhome_saved_phrases', JSON.stringify(defaultPhrases));
      return defaultPhrases;
    }
    return JSON.parse(list);
  },

  add(phrase) {
    const phrases = this.getAll();
    const newEntry = {
      id: 'sp_' + Date.now(),
      text: phrase.text,
      tamil_text: phrase.tamil_text || '',
      category: phrase.category || 'General',
      is_emergency: !!phrase.is_emergency,
      created_at: new Date().toISOString()
    };
    phrases.unshift(newEntry);
    localStorage.setItem('signhome_saved_phrases', JSON.stringify(phrases));
    return newEntry;
  },

  delete(id) {
    const phrases = this.getAll().filter(p => p.id !== id);
    localStorage.setItem('signhome_saved_phrases', JSON.stringify(phrases));
    return phrases;
  }
};

// --- PRACTICE & QUIZ SERVICE ---
export const practiceService = {
  generateQuiz(type = 'vocabulary', count = 5) {
    const pool = type === 'alphabet' ? vocabularyService.getAlphabetSigns() :
                 type === 'numbers' ? vocabularyService.getNumberSigns() :
                 ISL_VOCABULARY;

    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, count);
    
    return shuffled.map((item, idx) => {
      // Pick 3 random wrong options
      const wrong = pool.filter(p => p.term !== item.term)
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 3)
                        .map(p => p.term);
      const options = [item.term, ...wrong].sort(() => 0.5 - Math.random());

      return {
        id: `q_${idx}_${item.id}`,
        question: `What is the correct English term for this Indian Sign Language demonstration?`,
        tamil_question: `இந்த சைகைக்கான சரியான ஆங்கில சொல் எது?`,
        term: item.term,
        tamil_meaning: item.tamil_meaning,
        description: item.description,
        demonstration_url: item.demonstration_url,
        embed_video_url: item.embed_video_url,
        options,
        correct_answer: item.term,
        category: item.category,
      };
    });
  },

  recordAttempt(attempt) {
    const attempts = JSON.parse(localStorage.getItem('signhome_practice_attempts') || '[]');
    attempts.unshift({
      ...attempt,
      id: 'att_' + Date.now(),
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('signhome_practice_attempts', JSON.stringify(attempts.slice(0, 100)));
  },

  getStats() {
    const attempts = JSON.parse(localStorage.getItem('signhome_practice_attempts') || '[]');
    const total = attempts.length;
    const correct = attempts.filter(a => a.matched).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    // Streaks
    const lastDate = localStorage.getItem('signhome_last_practice_date');
    const today = new Date().toDateString();
    let streak = parseInt(localStorage.getItem('signhome_streak') || '1', 10);
    
    if (lastDate !== today) {
      streak += 1;
      localStorage.setItem('signhome_streak', streak.toString());
      localStorage.setItem('signhome_last_practice_date', today);
    }

    return {
      totalAttempts: total,
      accuracy,
      streak,
      signsLearned: Math.min(400, Math.floor(correct * 1.5) + 12),
    };
  }
};

// --- EMERGENCY & SAFETY SERVICE ---
export const emergencyService = {
  getEmergencyMessages() {
    return [
      {
        id: 'em-1',
        category: 'Medical',
        title: 'Call Ambulance',
        english_text: 'Please call an ambulance immediately. I need urgent medical care.',
        tamil_text: 'தயவுசெய்து உடனடியாக ஆம்புலன்ஸை அழைக்கவும். எனக்கு அவசர மருத்துவ சிகிச்சை தேவை.',
        sign_term: 'Ambulance',
        priority: 'critical'
      },
      {
        id: 'em-2',
        category: 'Personal Safety',
        title: 'I Am In Danger',
        english_text: 'I am in danger. Please help me or call the police immediately.',
        tamil_text: 'நான் ஆபத்தில் உள்ளேன். தயவுசெய்து எனக்கு உதவுங்கள் அல்லது உடனடியாக காவல்துறையை அழைக்கவும்.',
        sign_term: 'Danger',
        priority: 'critical'
      },
      {
        id: 'em-3',
        category: 'Communication',
        title: 'Deaf Communication',
        english_text: 'I cannot hear you. I communicate using Indian Sign Language. Please write down what you want to say.',
        tamil_text: 'என்னால் உங்கள் பேச்சைக் கேட்க முடியாது. நான் இந்திய சைகை மொழியைப் பயன்படுத்தி தொடர்பு கொள்கிறேன். நீங்கள் கூற விரும்புவதை எழுதிக் காட்டுங்கள்.',
        sign_term: 'Deaf',
        priority: 'high'
      },
      {
        id: 'em-4',
        category: 'Medical',
        title: 'Severe Pain / Breathing',
        english_text: 'I am experiencing severe chest pain and breathing difficulty. Please assist me.',
        tamil_text: 'எனக்கு கடுமையான மார்பு வலியும் சுவாச பிரச்சனையும் ஏற்படுகிறது. தயவுசெய்து எனக்கு உதவுங்கள்.',
        sign_term: 'Pain',
        priority: 'critical'
      },
      {
        id: 'em-5',
        category: 'Police',
        title: 'Police Assistance Needed',
        english_text: 'I need immediate police assistance. There has been an accident / theft.',
        tamil_text: 'எனக்கு உடனடி காவல் உதவி தேவை. விபத்து / திருட்டு நடந்துள்ளது.',
        sign_term: 'Police',
        priority: 'critical'
      },
      {
        id: 'em-6',
        category: 'Fire',
        title: 'Fire Emergency',
        english_text: 'There is a fire emergency here! Call the fire station immediately!',
        tamil_text: 'இங்கு தீ விபத்து ஏற்பட்டுள்ளது! உடனடியாக தீயணைப்பு நிலையத்தை அழைக்கவும்!',
        sign_term: 'Fire',
        priority: 'critical'
      },
    ];
  },

  getEmergencyProfile() {
    const stored = localStorage.getItem('signhome_emergency_profile');
    if (stored) return JSON.parse(stored);
    return {
      primary_contact_name: 'Dr. Ramesh Kumar (Guardian)',
      primary_contact_phone: '+91 98765 43210',
      secondary_contact_name: 'Priya Sharma (Sister)',
      secondary_contact_phone: '+91 91234 56789',
      blood_group: 'B+ Positive',
      allergies: 'Penicillin, Dust',
      chronic_conditions: 'Asthma (Carries inhaler)',
      preferred_hospital: 'City General Hospital, Coimbatore',
      sign_language_note: 'I am Deaf/Hard of Hearing. I communicate using Indian Sign Language (ISL).'
    };
  },

  saveEmergencyProfile(profile) {
    localStorage.setItem('signhome_emergency_profile', JSON.stringify(profile));
    return profile;
  },

  getSafePlaceCheckIns() {
    return JSON.parse(localStorage.getItem('signhome_safeplace_checkins') || '[]');
  },

  addCheckIn(checkIn) {
    const list = this.getSafePlaceCheckIns();
    const entry = {
      id: 'chk_' + Date.now(),
      status: checkIn.status || 'safe',
      message: checkIn.message || 'I am safe and sound at my destination.',
      location: checkIn.location || 'Coimbatore Central',
      timestamp: new Date().toISOString()
    };
    list.unshift(entry);
    localStorage.setItem('signhome_safeplace_checkins', JSON.stringify(list.slice(0, 20)));
    return entry;
  }
};
