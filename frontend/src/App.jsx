import React, { useState, useEffect } from 'react';
import Navbar from './layouts/Navbar';
import Sidebar from './layouts/Sidebar';
import Footer from './layouts/Footer';
import AuthModal from './components/AuthModal';
import SignGuideModal from './components/SignGuideModal';
import { authService, vocabularyService } from './services/api';

// Pages
import Home from './pages/Home';
import LearnISL from './pages/LearnISL';
import LiveRecognition from './pages/LiveRecognition';
import TwoWayAssistant from './pages/TwoWayAssistant';
import PracticeArena from './pages/PracticeArena';
import EmergencySafety from './pages/EmergencySafety';
import MedicalAssistant from './pages/MedicalAssistant';
import DailyCommunication from './pages/DailyCommunication';
import MyCommunication from './pages/MyCommunication';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedDemoSign, setSelectedDemoSign] = useState(null);

  useEffect(() => {
    // Check logged in user
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const handleSelectDemo = (sign) => {
    // Find rich data if minimal sign passed
    const rich = vocabularyService.getTermById(sign.term || sign.id) || sign;
    setSelectedDemoSign(rich);
  };

  const handlePracticeFromDemo = (sign) => {
    setSelectedDemoSign(null);
    setActivePage('practice');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* Top Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        user={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Main Body Layout with Sidebar */}
      <div className="flex-1 flex w-full">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Dynamic Page View Container */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {activePage === 'home' && (
            <Home
              setActivePage={setActivePage}
              onSelectDemo={handleSelectDemo}
            />
          )}

          {activePage === 'learn' && (
            <LearnISL
              setActivePage={setActivePage}
              onSelectDemo={handleSelectDemo}
            />
          )}

          {activePage === 'recognition' && (
            <LiveRecognition
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'assistant' && (
            <TwoWayAssistant
              setActivePage={setActivePage}
              onSelectDemo={handleSelectDemo}
            />
          )}

          {activePage === 'practice' && (
            <PracticeArena
              setActivePage={setActivePage}
              onSelectDemo={handleSelectDemo}
            />
          )}

          {activePage === 'emergency' && (
            <EmergencySafety
              setActivePage={setActivePage}
              onSelectDemo={handleSelectDemo}
            />
          )}

          {activePage === 'medical' && (
            <MedicalAssistant
              setActivePage={setActivePage}
              onSelectDemo={handleSelectDemo}
            />
          )}

          {activePage === 'daily' && (
            <DailyCommunication
              setActivePage={setActivePage}
              onSelectDemo={handleSelectDemo}
            />
          )}

          {activePage === 'my-comm' && (
            <MyCommunication
              user={currentUser}
              onUpdateUser={setCurrentUser}
            />
          )}

          {activePage === 'dashboard' && (
            <Dashboard
              setActivePage={setActivePage}
              onSelectDemo={handleSelectDemo}
            />
          )}
        </main>
      </div>

      {/* Global Footer */}
      <Footer setActivePage={setActivePage} />

      {/* Global Modal: Sign Guide Modal */}
      {selectedDemoSign && (
        <SignGuideModal
          sign={selectedDemoSign}
          onClose={() => setSelectedDemoSign(null)}
          onPractice={handlePracticeFromDemo}
        />
      )}

      {/* Global Modal: Authentication */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />
    </div>
  );
}
