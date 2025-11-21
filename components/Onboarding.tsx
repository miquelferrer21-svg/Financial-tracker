
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, CurrencyCode, RiskProfile } from '../types';
import { CURRENCY_SYMBOLS, RISK_PROFILES, COMMON_GOALS } from '../constants';
import { ArrowRight, Send, SkipForward, User, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

type MessageType = 'system' | 'user';
type InputType = 'text' | 'number' | 'currency' | 'risk' | 'goals';

interface Message {
  id: string;
  type: MessageType;
  content: React.ReactNode;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', type: 'system', content: "Welcome to Lumina. I'm your financial AI concierge. Let's set up your profile. First, what should I call you?" }
  ]);
  
  // Form State
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: 'User',
    mainCurrency: CurrencyCode.USD,
    initialBalance: 0,
    monthlyIncome: 0,
    riskProfile: 'Medium',
    financialGoals: [],
    isOnboarded: true
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const addMessage = (type: MessageType, content: React.ReactNode) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), type, content }]);
  };

  const handleNextStep = (value: any, skipped = false) => {
    const nextStep = step + 1;
    setStep(nextStep);
    setInput('');

    // Process current step data
    const updatedProfile = { ...profile };
    
    if (!skipped) {
      if (step === 0) updatedProfile.name = value;
      if (step === 1) updatedProfile.mainCurrency = value;
      if (step === 2) updatedProfile.initialBalance = parseFloat(value);
      if (step === 3) updatedProfile.monthlyIncome = parseFloat(value);
      if (step === 4) updatedProfile.riskProfile = value;
      if (step === 5) updatedProfile.financialGoals = value;
    }
    setProfile(updatedProfile);

    // Trigger next question
    setTimeout(() => {
      if (nextStep === 1) addMessage('system', `Nice to meet you, ${updatedProfile.name}. What is your primary currency?`);
      if (nextStep === 2) addMessage('system', "Got it. What is your approximate total current wealth (Cash + Assets)?");
      if (nextStep === 3) addMessage('system', "Understood. What is your average monthly income?");
      if (nextStep === 4) addMessage('system', "How would you describe your risk tolerance for investments?");
      if (nextStep === 5) addMessage('system', "Finally, select any financial goals you are focusing on.");
      if (nextStep === 6) {
        addMessage('system', "Perfect. I've calibrated your dashboard. Launching Lumina...");
        setTimeout(() => onComplete(updatedProfile as UserProfile), 1500);
      }
    }, 500);
  };

  const handleTextSubmit = () => {
    if (!input.trim()) return;
    addMessage('user', input);
    handleNextStep(input);
  };

  const handleSkip = () => {
    addMessage('user', "Skip");
    handleNextStep(null, true);
  };

  // Render specific inputs based on step
  const renderInputArea = () => {
    if (step === 6) return null;

    // Currency Selection
    if (step === 1) {
      return (
        <div className="flex gap-2 flex-wrap justify-end animate-slide-up">
          {Object.values(CurrencyCode).map(c => (
            <button
              key={c}
              onClick={() => { addMessage('user', c); handleNextStep(c); }}
              className="px-4 py-2 rounded-full bg-white border border-slate-200 hover:border-primary-500 hover:text-primary-600 transition"
            >
              {CURRENCY_SYMBOLS[c]} {c}
            </button>
          ))}
          <button onClick={handleSkip} className="px-4 py-2 rounded-full text-slate-400 hover:bg-slate-100"><SkipForward size={16} /></button>
        </div>
      );
    }

    // Risk Selection
    if (step === 4) {
      return (
        <div className="flex flex-col gap-2 items-end animate-slide-up">
          {RISK_PROFILES.map(r => (
            <button
              key={r.id}
              onClick={() => { addMessage('user', r.label); handleNextStep(r.id); }}
              className="px-6 py-3 rounded-2xl bg-white border border-slate-200 hover:border-primary-500 hover:bg-primary-50 text-left w-full max-w-xs transition"
            >
              <span className="font-bold block text-slate-800">{r.label}</span>
              <span className="text-xs text-slate-500">{r.description}</span>
            </button>
          ))}
          <button onClick={handleSkip} className="px-4 py-2 rounded-full text-slate-400 hover:bg-slate-100 mt-2 flex items-center gap-2">Skip <SkipForward size={16} /></button>
        </div>
      );
    }

    // Goals Selection (Multi-select logic handled differently)
    if (step === 5) {
       // We cheat slightly here for the chat UI and just act as single click -> next for simplicity in this demo, 
       // or we could make a distinct component. For "Chat" feel, let's just pick one primary goal or skip.
       return (
        <div className="flex flex-wrap gap-2 justify-end max-w-md ml-auto animate-slide-up">
          {COMMON_GOALS.map(g => (
            <button
              key={g}
              onClick={() => { addMessage('user', g); handleNextStep([g]); }}
              className="px-4 py-2 rounded-full bg-white border border-slate-200 hover:border-primary-500 hover:text-primary-600 transition"
            >
              {g}
            </button>
          ))}
          <button onClick={handleSkip} className="px-4 py-2 rounded-full text-slate-400 hover:bg-slate-100"><SkipForward size={16} /></button>
        </div>
       );
    }

    // Text/Number Input
    return (
      <div className="flex gap-2 items-center w-full max-w-lg ml-auto animate-slide-up">
        <button onClick={handleSkip} className="p-3 rounded-full text-slate-400 hover:bg-slate-100" title="Skip">
           <SkipForward size={20} />
        </button>
        <input
          type={step === 2 || step === 3 ? "number" : "text"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
          placeholder="Type your answer..."
          className="flex-1 bg-white border border-slate-200 rounded-full px-6 py-3 focus:ring-2 focus:ring-primary-200 outline-none shadow-sm"
          autoFocus
        />
        <button 
          onClick={handleTextSubmit}
          disabled={!input}
          className="p-3 rounded-full bg-primary-600 text-white disabled:opacity-50 hover:bg-primary-700 transition shadow-lg"
        >
          <Send size={20} />
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl h-[600px] bg-white rounded-[40px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-slate-900">Lumina Setup</h2>
              <p className="text-xs text-slate-500">AI Concierge</p>
            </div>
          </div>
          <div className="text-xs font-bold text-slate-300">
            STEP {step + 1} / 7
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.type === 'system' && (
                 <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3 shrink-0 mt-1">
                    <Sparkles size={14} className="text-primary-600" />
                 </div>
              )}
              <div className={`max-w-[80%] p-5 rounded-2xl text-base leading-relaxed shadow-sm ${
                msg.type === 'user' 
                  ? 'bg-slate-900 text-white rounded-tr-sm' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
              {msg.type === 'user' && (
                 <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center ml-3 shrink-0 mt-1">
                    <User size={14} className="text-slate-500" />
                 </div>
              )}
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-slate-100">
          {renderInputArea()}
        </div>

      </div>
    </div>
  );
};
