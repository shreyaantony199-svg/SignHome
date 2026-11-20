import React from 'react';
import {
  Home,
  GraduationCap,
  Camera,
  ArrowLeftRight,
  Award,
  ShieldAlert,
  Stethoscope,
  MessageSquareText,
  UserCheck,
  LayoutDashboard,
  Sparkles,
  BookOpen
} from 'lucide-react';
import SignIllustration from '../components/SignIllustration';

export default function Sidebar({ activePage, setActivePage, isOpen, onClose }) {
  const NAV_ITEMS = [
    { id: 'home', label: 'Home', icon: Home, badge: null, desc: 'Welcome & Overview' },
    { id: 'learn', label: 'Learn ISL', icon: GraduationCap, badge: '400+ Signs', desc: 'Alphabet, Numbers & Dictionary' },
    { id: 'recognition', label: 'Live Recognition', icon: Camera, badge: 'Live', desc: 'Real-time Camera Vision' },
    { id: 'assistant', label: 'Two-Way Assistant', icon: ArrowLeftRight, badge: null, desc: 'Sign, Text & Speech Bridge' },
    { id: 'practice', label: 'Practice Arena', icon: Award, badge: 'Practice', desc: 'ISL Gesture Practice' },
    { id: 'emergency', label: 'Emergency & Safety', icon: ShieldAlert, badge: 'SOS', desc: 'Rapid Emergency Cards', highlight: true },
    { id: 'medical', label: 'Medical Assistant', icon: Stethoscope, badge: null, desc: 'Symptoms & Clinical Signs' },
    { id: 'daily', label: 'Daily Communication', icon: MessageSquareText, badge: null, desc: 'Transit & Sentence Builder' },
    { id: 'my-comm', label: 'My Communication', icon: UserCheck, badge: null, desc: 'Saved Phrases & History' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null, desc: 'Learning Analytics & Streak' },
  ];

  const handleSelect = (id) => {
    setActivePage(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-extrabold text-sm shadow-xs">
              SH
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                SignHome
              </h2>
              <p className="text-[11px] text-purple-700 font-semibold">Indian Sign Language</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Platform Sections (10)
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                    : item.highlight
                    ? 'bg-red-50 text-red-700 hover:bg-red-100/80 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : item.highlight ? 'text-red-600' : 'text-slate-400 group-hover:text-blue-600'
                    }`}
                  />
                  <div className="truncate">
                    <div className="text-xs truncate">{item.label}</div>
                    <div className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                      {item.desc}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.highlight
                        ? 'bg-red-200 text-red-800'
                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer - ISL Platform Note */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <SignIllustration term="Hello" size="sm" className="w-9 h-9 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800">
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>SignHome ISL</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                Indian Sign Language Platform
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
