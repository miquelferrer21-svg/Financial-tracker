import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Image as ImageIcon, X, Loader2, Sparkles } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { parseTransactionFromText, parseReceiptImage } from '../services/geminiService';
import { Transaction, CurrencyCode } from '../types';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (t: Transaction) => void;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose, onAddTransaction }) => {
  const { currency } = useCurrency();
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hello. I am Lumina. Tell me about your spending, upload a receipt, or ask for advice.' }
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await parseTransactionFromText(userText, currency);
      
      if (result && result.amount) {
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          amount: result.amount,
          currency: (result.currency as CurrencyCode) || currency,
          category: result.category || 'General',
          description: result.description || 'AI Entry',
          date: result.date || new Date().toISOString(),
          type: result.type || 'expense',
        };
        
        onAddTransaction(newTransaction);
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: `Recorded: ${currency === result.currency ? '' : result.currency} ${result.amount} for ${result.description} in ${result.category}.` 
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: "I couldn't identify a transaction in that. Try 'Spent $20 on Pizza'." }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting to the database." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', text: `[Image Uploaded]: ${file.name}` }]);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      try {
        const result = await parseReceiptImage(base64String, file.type);
        if (result && result.amount) {
           const newTransaction: Transaction = {
            id: Date.now().toString(),
            amount: result.amount,
            currency: (result.currency as CurrencyCode) || currency,
            category: result.category || 'Shopping',
            description: result.description || 'Receipt Scan',
            date: result.date || new Date().toISOString(),
            type: 'expense',
          };
          onAddTransaction(newTransaction);
          setMessages(prev => [...prev, { 
            role: 'ai', 
            text: `Receipt analyzed. Added ${result.amount} for ${result.description}.` 
          }]);
        } else {
          setMessages(prev => [...prev, { role: 'ai', text: "I couldn't read that receipt clearly." }]);
        }
      } catch (err) {
        setMessages(prev => [...prev, { role: 'ai', text: "Error processing image." }]);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setTimeout(() => {
        setInput("I spent 1200 JPY on a coffee at Starbucks");
      }, 500);
    } else {
      setIsRecording(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white shadow-2xl border-l border-slate-100 h-full flex flex-col animate-slide-up" style={{ animationDuration: '0.3s' }}>
        
        {/* Header */}
        <div className="bg-white p-6 flex justify-between items-center border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-slate-900">Lumina AI</h3>
              <p className="text-xs text-slate-500">Financial Intelligence</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-primary-600 text-white rounded-tr-sm' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                <span className="text-xs text-slate-500 font-medium">Processing...</span>
              </div>
             </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Visualization for Voice */}
        {isRecording && (
          <div className="h-20 bg-slate-900 flex items-center justify-center gap-1">
             {[...Array(8)].map((_, i) => (
               <div key={i} className="w-1 bg-primary-400 animate-pulse rounded-full" 
                    style={{ height: `${Math.random() * 20 + 10}px`, animationDuration: `${Math.random() * 0.5 + 0.5}s` }} />
             ))}
             <p className="text-primary-400 text-xs absolute mt-12 font-bold">LISTENING...</p>
          </div>
        )}

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-slate-100 pb-8">
          <div className="flex items-center gap-3">
             <input 
               type="file" 
               ref={fileInputRef}
               className="hidden" 
               accept="image/*"
               onChange={handleImageUpload}
             />
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="p-3 rounded-full bg-slate-50 text-slate-500 hover:bg-primary-50 hover:text-primary-600 transition"
             >
               <ImageIcon className="w-5 h-5" />
             </button>
             
             <button 
               onClick={toggleRecording}
               className={`p-3 rounded-full transition ${isRecording ? 'bg-danger-500 text-white' : 'bg-slate-50 text-slate-500 hover:bg-danger-50 hover:text-danger-500'}`}
             >
               <Mic className="w-5 h-5" />
             </button>

             <input 
               type="text" 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder="Type message..."
               className="flex-1 bg-slate-50 border-transparent rounded-2xl px-4 py-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-200 outline-none placeholder:text-slate-400 transition-all"
             />
             
             <button 
               onClick={handleSend}
               disabled={!input.trim() || isLoading}
               className="p-3 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition disabled:opacity-50 shadow-lg shadow-primary-600/30"
             >
               <Send className="w-4 h-4" />
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};