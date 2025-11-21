import React, { useState, useEffect } from 'react';
import { X, Check, Wallet } from 'lucide-react';
import { Transaction, CurrencyCode, Account } from '../types';
import { CATEGORIES, CURRENCY_SYMBOLS } from '../constants';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (t: Transaction, accountId: string) => void;
  currency: CurrencyCode;
  accounts: Account[];
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onAdd, currency, accounts }) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAccountId, setSelectedAccountId] = useState('');

  // Set default account when accounts load or modal opens
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      // Prefer a bank account as default
      const defaultAcc = accounts.find(a => a.type === 'Bank') || accounts[0];
      setSelectedAccountId(defaultAcc.id);
    }
  }, [accounts, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !selectedAccountId) return;

    onAdd({
      id: Date.now().toString(),
      amount: parseFloat(amount),
      currency,
      category,
      description,
      date,
      type,
      accountId: selectedAccountId
    }, selectedAccountId);
    
    // Reset & Close
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-serif text-2xl font-bold text-slate-900">Add Transaction</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition">
            <X className="text-slate-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type === 'expense' ? 'bg-white text-danger-500 shadow-sm' : 'text-slate-500'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type === 'income' ? 'bg-white text-success-500 shadow-sm' : 'text-slate-500'}`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-serif text-xl">
                {CURRENCY_SYMBOLS[currency]}
              </span>
              <input 
                type="number" 
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-10 p-4 bg-slate-50 rounded-2xl text-2xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary-200 transition"
                placeholder="0.00"
                autoFocus
              />
            </div>
          </div>

          {/* Account Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account</label>
            <div className="relative">
              <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select 
                value={selectedAccountId}
                onChange={e => setSelectedAccountId(e.target.value)}
                className="w-full pl-12 p-4 bg-slate-50 rounded-2xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary-200 appearance-none"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-4 bg-slate-50 rounded-2xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary-200 appearance-none"
              >
                {CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</label>
              <input 
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full p-4 bg-slate-50 rounded-2xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
            <input 
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-4 bg-slate-50 rounded-2xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="What was this for?"
            />
          </div>

          <button 
            type="submit"
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition transform active:scale-95 ${type === 'expense' ? 'bg-danger-500 hover:bg-danger-600 shadow-danger-500/30' : 'bg-success-500 hover:bg-success-600 shadow-success-500/30'}`}
          >
            Save Transaction
          </button>
        </form>
      </div>
    </div>
  );
};