import React from 'react';

/**
 * SignIllustration
 * Renders authentic SVG illustrations of Indian Sign Language hand postures,
 * manual alphabet handshapes, or skeletal landmark visualizers.
 * Ensured on EVERY page for consistent sign-language visual immersion!
 */
export default function SignIllustration({ term = 'Hello', size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
  }[size] || 'w-16 h-16';

  const normalized = (term || 'Hello').trim().toLowerCase();

  // Custom visual configurations based on sign term
  if (normalized.includes('hello') || normalized.includes('namaste')) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 drop-shadow-sm" fill="none">
          <circle cx="50" cy="50" r="42" fill="#EEF2FF" />
          {/* Open waving hand */}
          <path d="M42 65C42 58 45 52 50 52C55 52 58 58 58 65V78H42V65Z" fill="#3B82F6"/>
          <rect x="36" y="30" width="6" height="24" rx="3" fill="#2563EB" />
          <rect x="44" y="24" width="6" height="30" rx="3" fill="#2563EB" />
          <rect x="52" y="28" width="6" height="26" rx="3" fill="#2563EB" />
          <rect x="60" y="36" width="6" height="18" rx="3" fill="#2563EB" />
          <path d="M42 66L28 56C26 54 24 57 26 59L40 73" stroke="#1D4ED8" strokeWidth="4" strokeLinecap="round" fill="#3B82F6"/>
          {/* Greeting wave arc */}
          <path d="M72 26C78 32 80 40 78 48" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" />
        </svg>
      </div>
    );
  }

  if (normalized.includes('help') || normalized.includes('sos')) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 drop-shadow-sm" fill="none">
          <circle cx="50" cy="50" r="42" fill="#FEE2E2" />
          {/* Base non-dominant flat palm lifting */}
          <rect x="22" y="70" width="56" height="10" rx="5" fill="#EF4444" />
          {/* Thumbs-up fist on top */}
          <rect x="38" y="44" width="24" height="26" rx="8" fill="#DC2626" />
          <rect x="42" y="26" width="10" height="22" rx="5" fill="#B91C1C" />
          {/* Lift arrow */}
          <path d="M50 20L44 26H56L50 20Z" fill="#7C3AED" />
        </svg>
      </div>
    );
  }

  if (normalized.includes('doctor') || normalized.includes('hospital') || normalized.includes('medical')) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 drop-shadow-sm" fill="none">
          <circle cx="50" cy="50" r="42" fill="#D1FAE5" />
          {/* Wrist pulse check */}
          <rect x="20" y="55" width="60" height="16" rx="6" fill="#10B981" />
          {/* Two index & middle checking fingers */}
          <rect x="42" y="24" width="7" height="34" rx="3.5" fill="#059669" />
          <rect x="51" y="24" width="7" height="34" rx="3.5" fill="#047857" />
          {/* Medical Cross symbol */}
          <path d="M76 22H84V30H76V22ZM72 26H88V26" stroke="#059669" strokeWidth="3" />
        </svg>
      </div>
    );
  }

  if (normalized.includes('water') || normalized.includes('drink')) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 drop-shadow-sm" fill="none">
          <circle cx="50" cy="50" r="42" fill="#E0F2FE" />
          {/* 'W' Hand shape */}
          <rect x="34" y="28" width="7" height="36" rx="3.5" fill="#0284C7" />
          <rect x="46" y="24" width="7" height="40" rx="3.5" fill="#0369A1" />
          <rect x="58" y="28" width="7" height="36" rx="3.5" fill="#0284C7" />
          <rect x="36" y="60" width="30" height="18" rx="8" fill="#38BDF8" />
          {/* Water ripples */}
          <path d="M26 80C34 78 42 82 50 80C58 78 66 82 74 80" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (normalized.includes('thank') || normalized.includes('welcome')) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 drop-shadow-sm" fill="none">
          <circle cx="50" cy="50" r="42" fill="#F3E8FF" />
          {/* Flat forward hand from chin */}
          <path d="M30 65C30 52 40 45 52 45H68V75H42C35 75 30 71 30 65Z" fill="#8B5CF6" />
          <rect x="52" y="32" width="28" height="12" rx="6" fill="#7C3AED" />
          <path d="M42 32C46 26 56 26 60 32" stroke="#A855F7" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // Default clean geometric Hand Sign / Landmark illustration
  return (
    <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 ${sizeClasses} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 drop-shadow-sm" fill="none">
        <circle cx="50" cy="50" r="42" fill="#F1F5F9" />
        {/* Palm */}
        <rect x="38" y="50" width="26" height="28" rx="8" fill="#3B82F6" />
        {/* Fingers */}
        <rect x="36" y="28" width="6" height="24" rx="3" fill="#2563EB" />
        <rect x="44" y="22" width="6" height="30" rx="3" fill="#2563EB" />
        <rect x="52" y="26" width="6" height="26" rx="3" fill="#2563EB" />
        <rect x="60" y="34" width="6" height="18" rx="3" fill="#2563EB" />
        {/* Thumb */}
        <rect x="28" y="52" width="12" height="6" rx="3" fill="#1D4ED8" transform="rotate(-30 28 52)" />
        {/* Landmark dots */}
        <circle cx="50" cy="65" r="3" fill="#FBBF24" />
        <circle cx="47" cy="37" r="2.5" fill="#FBBF24" />
        <circle cx="55" cy="39" r="2.5" fill="#FBBF24" />
      </svg>
    </div>
  );
}
