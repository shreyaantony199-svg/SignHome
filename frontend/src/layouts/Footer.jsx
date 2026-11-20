import React from 'react';
import { Heart, ShieldCheck, BookOpen, Sparkles } from 'lucide-react';
import SignIllustration from '../components/SignIllustration';

export default function Footer({ setActivePage }) {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8 px-4 lg:px-8 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
              SH
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white tracking-tight">SignHome</h3>
              <p className="text-[11px] text-purple-400 font-semibold">Indian Sign Language Platform</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            "Every Sign Has a Voice. Every Person Has a Place." Dedicated to bridging communication for the deaf and hard-of-hearing community across India through accessible AI and interactive sign guides.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <SignIllustration term="Hello" size="sm" className="bg-slate-800 border-slate-700 w-8 h-8" />
            <SignIllustration term="Thank You" size="sm" className="bg-slate-800 border-slate-700 w-8 h-8" />
            <SignIllustration term="Water" size="sm" className="bg-slate-800 border-slate-700 w-8 h-8" />
            <SignIllustration term="Doctor" size="sm" className="bg-slate-800 border-slate-700 w-8 h-8" />
          </div>
        </div>

        {/* Platform Capabilities Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Core Capabilities
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
              <span className="font-semibold text-blue-400 block mb-0.5">Verified ISL Dictionary</span>
              <p className="text-[11px] text-slate-400">
                400+ indexed vocabulary terms, manual alphabet (A–Z), and numbers with bilingual English & Tamil glosses.
              </p>
            </li>
            <li className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
              <span className="font-semibold text-purple-400 block mb-0.5">Real-Time Computer Vision</span>
              <p className="text-[11px] text-slate-400">
                Private in-browser hand landmark tracking and gesture recognition powered by machine learning.
              </p>
            </li>
          </ul>
        </div>

        {/* Quick Links Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Quick Navigation
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button onClick={() => setActivePage('learn')} className="hover:text-blue-400 transition-colors">
                Complete ISL Dictionary (400+ Terms)
              </button>
            </li>
            <li>
              <button onClick={() => setActivePage('recognition')} className="hover:text-blue-400 transition-colors">
                AI Live Recognition (Camera Vision)
              </button>
            </li>
            <li>
              <button onClick={() => setActivePage('emergency')} className="hover:text-red-400 transition-colors">
                Emergency & Safety SOS Centre
              </button>
            </li>
            <li>
              <button onClick={() => setActivePage('medical')} className="hover:text-emerald-400 transition-colors">
                Medical Assistant & Pain Scale
              </button>
            </li>
            <li>
              <button onClick={() => setActivePage('practice')} className="hover:text-purple-400 transition-colors">
                Practice Arena & AI Sign Coach
              </button>
            </li>
            <li>
              <button onClick={() => setActivePage('daily')} className="hover:text-cyan-400 transition-colors">
                Daily Communication & Transit
              </button>
            </li>
          </ul>
        </div>

        {/* Accessibility & Privacy Note */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Accessibility & Privacy
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            SignHome strictly respects privacy: webcam frames are analyzed in real-time in memory and are never stored or transmitted to external servers without explicit consent.
          </p>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300">
            <span className="font-semibold text-emerald-400">WCAG 2.1 AA Compliant:</span> High contrast colors, screen reader support, bilingual Tamil glosses, and keyboard navigable controls.
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© 2026 SignHome Platform. Built with accessibility and care.</p>
        <div className="flex items-center gap-1 text-slate-400">
          <span>Made for Indian Sign Language Education & Inclusion</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        </div>
      </div>
    </footer>
  );
}
