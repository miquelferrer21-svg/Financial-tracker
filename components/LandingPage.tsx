import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Zap, PieChart } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

// Logo Component (Inline for landing page to avoid import issues if separated)
const LuminaLogo = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4" y="20" width="12" height="16" rx="4" fill="#3B82F6" />
    <circle cx="28" cy="28" r="8" fill="#10B981" />
    <circle cx="20" cy="10" r="6" fill="#F43F5E" />
  </svg>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const words = ['Intelligence.', 'Simplicity.', 'Balance.', 'Clarity.'];

  useEffect(() => {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      const timer = setTimeout(() => {
        setText(prev => prev.substring(0, prev.length - 1));
        if (text === '') {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      if (text === currentWord) {
        const timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
      
      const timer = setTimeout(() => {
        setText(currentWord.substring(0, text.length + 1));
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [text, isDeleting, wordIndex]);

  return (
    <div className="min-h-screen bg-surface flex flex-col relative overflow-hidden text-slate-900">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-50/60 rounded-full blur-3xl animate-float -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-success-50/60 rounded-full blur-3xl animate-float -z-10" style={{ animationDelay: '1s' }}></div>

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center">
             <LuminaLogo />
          </div>
          <span className="font-serif text-2xl font-bold text-slate-900 tracking-tight">Lumina</span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onLogin}
            className="px-6 py-2 text-slate-600 font-medium hover:text-primary-600 transition"
          >
            Login
          </button>
          <button 
            onClick={onLogin}
            className="px-6 py-2 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition shadow-lg hover:shadow-slate-900/20"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto w-full px-8 gap-16 z-10">
        
        {/* Left Content */}
        <div className="flex-1 space-y-8 text-center md:text-left animate-slide-up">
          <h1 className="font-serif text-6xl md:text-7xl font-bold text-slate-900 leading-[1.1]">
            Master your <br />
            money with&nbsp;
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-success-500">
              {text}
            </span>
          </h1>
          <p className="text-xl text-slate-500 max-w-lg mx-auto md:mx-0 leading-relaxed">
            A pure, minimal approach to finance. Reduce anxiety with beautiful design, 
            AI-driven insights, and multi-currency intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button 
              onClick={onLogin}
              className="px-8 py-4 bg-primary-100 text-primary-700 rounded-full text-lg font-semibold hover:bg-primary-200 transition flex items-center gap-2 justify-center shadow-xl shadow-primary-500/10"
            >
              Start Your Journey <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full text-lg font-medium hover:border-primary-300 hover:bg-slate-50 transition">
              View Demo
            </button>
          </div>
          
          <div className="pt-8 flex items-center justify-center md:justify-start gap-8 text-slate-400 text-sm font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Secure
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" /> AI Powered
            </div>
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4" /> Visual Analytics
            </div>
          </div>
        </div>

        {/* Right Content - Phone Mockup */}
        <div className="flex-1 relative h-[600px] w-full flex items-center justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative w-[300px] h-[600px] bg-white rounded-[45px] border-[8px] border-slate-900 shadow-2xl overflow-hidden transform -rotate-3 hover:rotate-0 transition duration-700 ease-out">
             {/* Screen Content */}
             <div className="absolute inset-0 bg-slate-50 flex flex-col">
                {/* Mock Header */}
                <div className="bg-white p-6 pt-12 pb-6 border-b border-slate-100">
                   <div className="flex justify-between items-center">
                      <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                      <div className="w-20 h-4 bg-slate-100 rounded-full"></div>
                   </div>
                   <div className="mt-6">
                      <div className="text-3xl font-serif font-bold text-slate-900">$12,450</div>
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Net Worth</div>
                   </div>
                </div>
                {/* Mock Cards */}
                <div className="p-4 space-y-4">
                   <div className="h-32 bg-white rounded-3xl shadow-soft p-4 flex items-center justify-center relative overflow-hidden border border-slate-100">
                      <div className="absolute right-0 top-0 w-20 h-20 bg-primary-50 rounded-full blur-xl"></div>
                      {/* Abstract Chart */}
                      <div className="w-full h-16 flex items-end justify-between gap-2">
                          <div className="w-4 h-8 bg-primary-100 rounded-t-md"></div>
                          <div className="w-4 h-12 bg-primary-200 rounded-t-md"></div>
                          <div className="w-4 h-10 bg-primary-100 rounded-t-md"></div>
                          <div className="w-4 h-14 bg-primary-500 rounded-t-md"></div>
                          <div className="w-4 h-12 bg-primary-200 rounded-t-md"></div>
                      </div>
                   </div>
                   <div className="h-16 bg-white rounded-2xl shadow-sm flex items-center px-4 gap-3 border border-slate-100">
                      <div className="w-10 h-10 bg-success-50 rounded-xl flex items-center justify-center text-success-500 font-bold">
                         <PieChart size={18} />
                      </div>
                      <div className="flex-1 space-y-2">
                         <div className="h-2 w-24 bg-slate-200 rounded-full"></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
          
          {/* Decorative elements behind phone */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[650px] bg-primary-100/30 rounded-[55px] -z-10 rotate-[5deg]"></div>
        </div>

      </div>
    </div>
  );
};