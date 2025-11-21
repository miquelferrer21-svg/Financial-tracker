import React, { useState, useEffect } from 'react';
import { CurrencyProvider, useCurrency } from './context/CurrencyContext';
import { Dashboard } from './components/Dashboard';
import { Portfolio } from './components/Portfolio';
import { Spending } from './components/Spending';
import { Settings } from './components/Settings';
import { AddTransactionModal } from './components/AddTransactionModal';
import { UserProfile, Transaction, Asset, CurrencyCode, Budget, Goal, Account } from './types';
import { LayoutDashboard, TrendingUp, PieChart, Settings as SettingsIcon, Menu, Plus } from 'lucide-react';
import { NAV_ITEMS } from './constants';

// Modern Geometric Logo Component
const LuminaLogo = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4" y="20" width="12" height="16" rx="4" fill="#3B82F6" /> {/* Blue */}
    <circle cx="28" cy="28" r="8" fill="#10B981" /> {/* Green */}
    <circle cx="20" cy="10" r="6" fill="#F43F5E" /> {/* Red */}
  </svg>
);

// Default Mock User for Immediate Access
const MOCK_USER: UserProfile = {
  name: 'Demo User',
  mainCurrency: CurrencyCode.USD,
  initialBalance: 24500,
  monthlyIncome: 5500,
  riskProfile: 'Medium',
  financialGoals: ['Retirement', 'Travel'],
  isOnboarded: true
};

const AppContent: React.FC = () => {
  const { currency, setCurrency } = useCurrency();
  
  // App State
  const [view, setView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile>(MOCK_USER);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  // Data State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    // Initialize Accounts
    if (accounts.length === 0) {
      setAccounts([
        { id: 'acc-1', name: 'Main Checking', type: 'Bank', currency: CurrencyCode.USD, balance: 12450, institution: 'Chase', color: 'bg-slate-800' },
        { id: 'acc-2', name: 'Savings', type: 'Bank', currency: CurrencyCode.USD, balance: 8000, institution: 'Ally', color: 'bg-blue-600' },
        { id: 'acc-3', name: 'Investment Port', type: 'Investment', currency: CurrencyCode.USD, balance: 0, institution: 'Fidelity', color: 'bg-emerald-600' }, 
        { id: 'acc-4', name: 'Crypto Wallet', type: 'Investment', currency: CurrencyCode.USD, balance: 0, institution: 'Coinbase', color: 'bg-violet-600' },
      ]);
    }

    // Initialize Assets linked to Accounts
    if (assets.length === 0) {
      setAssets([
        { id: '1', accountId: 'acc-3', name: 'Tech ETF', type: 'Stock', value: 15000, currency: CurrencyCode.USD, dayChangePct: 1.2 },
        { id: '2', accountId: 'acc-3', name: 'Tesla', type: 'Stock', value: 3500, currency: CurrencyCode.USD, dayChangePct: -0.5 },
        { id: '3', accountId: 'acc-4', name: 'Bitcoin', type: 'Crypto', value: 5000, currency: CurrencyCode.USD, dayChangePct: -2.5 },
      ]);
    }
    
    if (transactions.length === 0) {
      setTransactions([
        { id: '1', amount: 120, currency: CurrencyCode.USD, category: 'Food', description: 'Grocery Run', date: new Date().toISOString(), type: 'expense', accountId: 'acc-1' },
        { id: '2', amount: 45, currency: CurrencyCode.USD, category: 'Transport', description: 'Uber', date: new Date().toISOString(), type: 'expense', accountId: 'acc-1' },
        { id: '3', amount: 5500, currency: CurrencyCode.USD, category: 'Income', description: 'Salary', date: new Date().toISOString(), type: 'income', accountId: 'acc-1' },
      ]);
    }

    if (budgets.length === 0) {
       setBudgets([
         { id: '1', category: 'Food', limit: 600, spent: 350, currency: CurrencyCode.USD },
         { id: '2', category: 'Transport', limit: 300, spent: 120, currency: CurrencyCode.USD }
       ]);
    }
  }, []);

  const handleAddTransaction = (t: Transaction, accountId: string) => {
    // 1. Add to history
    setTransactions(prev => [t, ...prev]);
    
    // 2. Update Balance of Specific Account
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        const newBalance = t.type === 'expense' 
          ? acc.balance - t.amount 
          : acc.balance + t.amount;
        return { ...acc, balance: newBalance };
      }
      return acc;
    }));
  };

  const handleAddAccount = (account: Account) => {
    setAccounts(prev => [...prev, account]);
  };

  const handleRemoveAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    setAssets(prev => prev.filter(a => a.accountId !== id));
  };

  const handleAddAsset = (a: Asset) => {
    setAssets(prev => [...prev, a]);
  };

  const handleUpdateAsset = (updatedAsset: Asset) => {
    setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
  };

  const handleRemoveAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const handleLogout = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background text-slate-900 font-sans flex overflow-hidden relative selection:bg-primary-100 selection:text-primary-700">
      
      {/* Background Ambient Blobs */}
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary-50/80 rounded-full blur-[100px] pointer-events-none z-0 opacity-60"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-success-50/80 rounded-full blur-[100px] pointer-events-none z-0 opacity-60"></div>

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col justify-between z-30 w-20 lg:w-64 my-6 ml-6 rounded-[32px] bg-white border border-slate-100 shadow-card transition-all duration-300">
        <div className="flex flex-col items-center lg:items-start w-full p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 flex items-center justify-center">
               <LuminaLogo />
            </div>
            <span className="hidden lg:block font-serif text-2xl font-bold text-slate-900 tracking-tight">Lumina</span>
          </div>
          
          <nav className="space-y-3 w-full">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon === 'LayoutDashboard' ? LayoutDashboard : 
                           item.icon === 'TrendingUp' ? TrendingUp :
                           item.icon === 'PieChart' ? PieChart : SettingsIcon;
              const isActive = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 font-medium group relative ${
                    isActive
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={22} className={isActive ? "text-primary-500" : "text-slate-400 group-hover:text-slate-600"} />
                  <span className="hidden lg:block">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 w-full">
           <div className="bg-slate-50 p-4 rounded-[24px] flex flex-col items-center lg:items-start gap-2 border border-slate-100">
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white shrink-0 border border-slate-200 shadow-sm flex items-center justify-center text-primary-600 font-bold">
                     {user.name.charAt(0)}
                </div>
                <div className="hidden lg:block overflow-hidden">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold tracking-wider truncate">{user.mainCurrency} ACCOUNT</p>
                </div>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        
        {/* Mobile Header */}
        <header className="flex justify-between items-center px-6 py-4 md:hidden bg-white/80 backdrop-blur-md border-b border-slate-100 z-40 sticky top-0">
           <div className="flex items-center gap-2">
             <LuminaLogo className="w-8 h-8" />
             <div className="font-serif font-bold text-xl text-slate-900">Lumina</div>
           </div>
           
           <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 p-2 bg-white rounded-full shadow-sm border border-slate-200">
             <Menu />
           </button>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl p-8 md:hidden animate-fade-in flex flex-col">
             <div className="flex justify-between items-center mb-12">
               <div className="flex items-center gap-2">
                 <LuminaLogo />
                 <span className="font-serif text-2xl font-bold text-slate-900">Lumina</span>
               </div>
               <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-slate-50 rounded-full"><Menu className="text-slate-900" /></button>
             </div>
             <nav className="space-y-6 flex-1">
               {NAV_ITEMS.map((item) => (
                 <button key={item.id} onClick={() => { setView(item.id); setMobileMenuOpen(false); }} className="flex items-center gap-4 text-xl font-medium text-slate-800 py-2 w-full">
                   <span className="text-primary-500">•</span> {item.label}
                 </button>
               ))}
             </nav>
          </div>
        )}

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto md:overflow-hidden p-4 md:p-8 scroll-smooth">
          <div className="max-w-[1600px] mx-auto h-full">
            {view === 'dashboard' && (
              <Dashboard 
                transactions={transactions}
                assets={assets} 
                user={user}
              />
            )}
            {view === 'investments' && (
              <Portfolio 
                accounts={accounts}
                assets={assets}
                transactions={transactions}
                onAddAccount={handleAddAccount}
                onRemoveAccount={handleRemoveAccount}
                onAddAsset={handleAddAsset} 
                onUpdateAsset={handleUpdateAsset}
                onRemoveAsset={handleRemoveAsset} 
              />
            )}
            {view === 'spending' && (
              <Spending
                transactions={transactions}
                budgets={budgets}
                onUpdateBudgets={setBudgets}
              />
            )}
            {view === 'settings' && (
              <Settings user={user} onLogout={handleLogout} />
            )}
          </div>
        </div>

        {/* Global Add Transaction FAB */}
        <button 
          onClick={() => setIsTxModalOpen(true)}
          className="fixed bottom-8 right-8 md:bottom-12 md:right-12 w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 hover:bg-slate-800 transition-all z-50"
          title="Add Transaction"
        >
          <Plus size={28} />
        </button>

        <AddTransactionModal 
          isOpen={isTxModalOpen} 
          onClose={() => setIsTxModalOpen(false)} 
          onAdd={handleAddTransaction} 
          currency={currency}
          accounts={accounts}
        />

      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <CurrencyProvider>
      <AppContent />
    </CurrencyProvider>
  );
};

export default App;