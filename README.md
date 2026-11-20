# SignHome 🏡🤟
### AI-Powered Indian Sign Language Communication and Learning Platform
**"Every Sign Has a Voice. Every Person Has a Place."**

---

## 🌟 Overview
**SignHome** is a full-stack, AI-powered communication and educational platform dedicated to Indian Sign Language (ISL). Built with accessibility, real-time computer vision, and structured linguistic sources at its core, SignHome bridges communication barriers between deaf, hard-of-hearing, and hearing individuals across classrooms, healthcare facilities, public transport, and emergency situations.

---

## 📚 Primary Online ISL Sources & Linguistic Attribution
SignHome does not rely on arbitrary or imaginary hand signs. The vocabulary dictionary and learning resources are referenced directly from the leading academic and community ISL portals in India:

1. **ARGISL / RKMVERI** (*Automatic Recognition and Generation of Indian Sign Language*):
   - **Institution:** Department of Computer Science, RKMVERI (Belur Math) in collaboration with the Faculty of Disability Management and Special Education (FDMSE), RKMVERI (Coimbatore Campus).
   - **URL:** [https://cs.rkmvu.ac.in/~isl/](https://cs.rkmvu.ac.in/~isl/)
   - **Scope:** 2,002 commonly used ISL daily glosses/words, digital dictionary, research on automatic recognition and sign language production (SynICS).
   - **Attribution & Rights:** SignHome maintains source attribution for indexed terms and links to official demonstrations. The restricted raw FDMSE-ISL dataset (40,033 multi-angle videos) requires formal academic request from RKMVERI.

2. **Indian Sign Language Portal (RKMVERI FDMSE)**:
   - **Institution:** Faculty of Disability Management and Special Education, RKMVERI (Coimbatore).
   - **URL:** [https://indiansignlanguage.org/](https://indiansignlanguage.org/)
   - **Scope:** Searchable A–Z dictionary, semantic categories (Verbs, Adjectives, School, Household, Banking, Public Services, Health, Emergency), video demonstrations, English glosses, and verified Tamil translations.
   - **Attribution & Rights:** Video demonstrations are embedded via official authorized channels or direct source links.

---

## 🏗️ Project Architecture

```text
SignHome/
│
├── frontend/                     # React + Vite + Tailwind CSS + Lucide Icons
│   ├── src/
│   │   ├── components/           # Reusable SignVisuals, Landmark viewers, Cards, Players
│   │   ├── pages/                # All 11 platform pages
│   │   ├── layouts/              # Responsive Sidebar, Navbar, Mobile Drawer
│   │   ├── services/             # API clients, MediaPipe vision, TTS/STT, Offline DB
│   │   ├── hooks/                # Custom React hooks (useAuth, useWebcam, useSpeech)
│   │   ├── assets/               # SVGs, ISL fingerspelling diagrams, visual assets
│   │   └── styles/               # Design system & accessibility styles
│   └── package.json
│
├── backend/                      # FastAPI Python Application
│   ├── app/
│   │   ├── routes/               # Modular REST endpoints (auth, vocabulary, recognition, etc.)
│   │   ├── models/               # Pydantic & database schemas
│   │   ├── services/             # Business logic, ML inference, dictionary search
│   │   ├── database/             # MongoDB driver with embedded fallback support
│   │   └── main.py               # Application entrypoint & OpenAPI Swagger docs
│   └── requirements.txt
│
├── ml-model/                     # AI & Computer Vision Pipeline
│   ├── training/                 # Model training scripts (Random Forest, SVM)
│   ├── preprocessing/            # 21 3D hand landmark normalization, angles, distances
│   ├── evaluation/               # Precision, recall, F1-score, confusion matrix metrics
│   └── saved_models/             # Exported model weights & label encoders (.joblib)
│
├── dataset/                      # Structured ISL Vocabulary & Training Metadata
│   ├── metadata/                 # Source licensing, terms indexed, verification records
│   ├── vocabulary/               # Comprehensive ISL vocabulary JSON database
│   └── training_data/            # Normalized landmark datasets for ML models
│
├── documentation/                # Architecture diagrams, API specifications, User manual
├── .env.example                  # Environment template
├── .gitignore                    # Version control ignore rules
└── README.md                     # Documentation
```

---

## 🚀 Key Modules & Pages

1. **Home**: Hero banner, ISL mission, interactive dictionary preview, live recognition showcase, emergency SOS preview, and accessibility pledge.
2. **Learn ISL**:
   - **Alphabet (A–Z)**: Step-by-step hand posture diagrams, descriptions, and practice.
   - **Numbers (0–50)**: Two-handed and single-handed ISL numeral demonstrations.
   - **Searchable Dictionary**: Browse thousands of indexed terms from ARGISL and indiansignlanguage.org with dual English and Tamil search, category filtering, and source links.
   - **Sign of the Day**: Daily curated sign with meaning and quick practice.
   - **Thematic Categories**: Health, Emergency, Banking, Family, Education, Public Places, Transport, etc.
3. **Live Recognition**: Real-time webcam processing using MediaPipe Hand Landmarker, feature extraction, Random Forest / SVM classifier inference, confidence thresholds, speech synthesis (TTS), undo/copy/save, and history logging.
4. **Two-Way Assistant**:
   - *Sign to Text*: Webcam gesture decoding.
   - *Text to Speech*: Natural speech output with voice customization.
   - *Voice to Text*: Speech recognition converting spoken words to readable text.
   - *Text to ISL*: Reverse dictionary search showing verified demonstration clips.
5. **Practice Arena**: AI Sign Coach with real-time pose guidance, interactive sign-to-meaning and meaning-to-sign quizzes, daily challenges, and performance streak analytics.
6. **Emergency & Safety**: SOS centre with 6 core crisis categories (Medical, Police, Fire, Safety, Transport, General Help), high-contrast rapid messaging, text-to-speech, verified ISL signs, Emergency Contact Card, and SafePlace status check-ins.
7. **Medical Assistant**: Interactive visual body part selector, symptom checklist, pain intensity scale, duration tracker, allergy notes, automated clinical statement generation, and medical sign demonstrations.
8. **Daily Communication**: Transit, college, banking, and dining communication phrases with speech and visual demonstration; card-based Conversation Builder.
9. **My Communication**: User profile, saved phrases, personalized communication preferences, and session history.
10. **Offline Centre**: Service worker and local storage caching for offline emergency cards, critical phrases, and downloaded sign references without internet connectivity.
11. **Dashboard**: Unified dashboard tracking learning streaks, signs mastered, recent quiz scores, camera sessions, and quick action shortcuts.

---

## 🛠️ Quickstart Guide

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m app.main
```
The FastAPI server will be available at `http://localhost:8000`.
Explore the interactive OpenAPI documentation at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The React application will launch at `http://localhost:5173`.

---

## 🔒 Security & Privacy
- **Webcam Privacy:** Video streams are analyzed purely in real-time in memory. No video footage is recorded or uploaded to servers without explicit consent.
- **Authentication:** Passwords are cryptographically salted and hashed using bcrypt. Access tokens are signed using JWT (HMAC-SHA256).
- **Attribution & Copyright:** SignHome strictly respects external source intellectual property, linking to or embedding authorized educational demonstrations while maintaining transparency on dataset boundaries.
