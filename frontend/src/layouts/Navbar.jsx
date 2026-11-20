import React, { useState } from 'react';
import { ShieldAlert, User, LogOut, Menu, Wifi, WifiOff } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, user, onOpenAuth, onLogout, onToggleSidebar }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 flex items-center justify-between shadow-xs">
      {/* Brand & Mobile Menu Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => setActivePage('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <img src="/logo.svg" alt="SignHome Logo" className="w-10 h-10 drop-shadow-sm group-hover:scale-105 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                SignHome
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                ISL
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 font-medium">
              Every Sign Has a Voice. Every Person Has a Place.
            </p>
          </div>
        </div>
      </div>


      {/* Right Controls: Offline Badge, SOS button, User Profile */}
      <div className="flex items-center gap-3">
        {/* Network status */}
        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${isOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>{isOnline ? 'Live' : 'Offline Mode'}</span>
        </div>

        {/* Rapid SOS Action Button */}
        <button
          onClick={() => setActivePage('emergency')}
          className="emergency-beacon relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-sm transition-all"
        >
          <ShieldAlert className="w-4 h-4 animate-pulse" />
          <span>SOS Help</span>
        </button>

        {/* User Profile / Auth */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <button
              onClick={() => setActivePage('dashboard')}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              title="Open Dashboard"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span className="hidden xl:block text-xs font-bold text-slate-800 max-w-[100px] truncate">
                {user.name}
              </span>
            </button>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white text-xs font-semibold text-slate-700 hover:text-blue-600 transition-all shadow-xs"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
