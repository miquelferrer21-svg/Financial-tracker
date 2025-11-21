
import React, { useState, useMemo } from 'react';
import { Account, Asset, CurrencyCode, PortfolioAnalysis, Transaction } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { DetailPanel } from './DetailPanel';
import { suggestPortfolioRebalancing } from '../services/geminiService';
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LineChart, Line, ComposedChart } from 'recharts';
import { Plus, Wallet, TrendingUp, Building2, ArrowRight, Sparkles, Trash2, Edit2, Save, X, Maximize2, DollarSign, Briefcase, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PortfolioProps {
  accounts: Account[];
  assets: Asset[];
  transactions: Transaction[];
  onAddAccount: (account: Account) => void;
  onRemoveAccount: (id: string) => void;
  onAddAsset: (asset: Asset) => void;
  onUpdateAsset: (asset: Asset) => void;
  onRemoveAsset: (id: string) => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({ 
  accounts, assets, transactions, onAddAccount, onRemoveAccount, onAddAsset, onUpdateAsset, onRemoveAsset 
}) => {
  const { formatMoney, convertAmount } = useCurrency();
  
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  
  // New Asset State
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({ type: 'Stock', currency: CurrencyCode.USD });
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // New Account State
  const [newAccount, setNewAccount] = useState<Partial<Account>>({ type: 'Bank', currency: CurrencyCode.USD });

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PortfolioAnalysis | null>(null);

  // --- Calculations ---
  
  const getAccountBalance = (account: Account | null) => {
    if (!account) return 0;
    if (account.type === 'Bank') return account.balance;
    return assets
      .filter(a => a.accountId === account.id)
      .reduce((sum, a) => sum + convertAmount(a.value, a.currency), 0);
  };

  const totalNetWorth = accounts.reduce((sum, acc) => sum + convertAmount(getAccountBalance(acc), acc.currency), 0);

  const currentAssets = selectedAccount ? assets.filter(a => a.accountId === selectedAccount.id) : [];

  // --- Analytics Logic for Detail Panels ---

  // 1. Bank Account Analytics
  const bankAnalytics = useMemo(() => {
    if (!selectedAccount || selectedAccount.type !== 'Bank') return { in: 0, out: 0, flowData: [] };
    
    // Filter transactions for this account
    const accountTx = transactions.filter(t => t.accountId === selectedAccount.id);
    
    const totalIn = accountTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalOut = accountTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    // Group by Month for Bar Chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const flowData = months.map(m => ({
        name: m,
        income: Math.random() * totalIn * 0.5, // Mock distribution for visual
        expense: Math.random() * totalOut * 0.5
    }));

    return { in: totalIn, out: totalOut, flowData };
  }, [selectedAccount, transactions]);

  // 2. Investment Account Analytics
  const investAnalytics = useMemo(() => {
    if (!selectedAccount || selectedAccount.type !== 'Investment') return { topPerformer: null, totalGain: 0, performanceData: [] };

    const sortedByPerf = [...currentAssets].sort((a, b) => (b.dayChangePct || 0) - (a.dayChangePct || 0));
    const topPerformer = sortedByPerf[0];
    
    // Mock Historical Performance Line
    const baseVal = currentAssets.reduce((sum, a) => sum + a.value, 0);
    const performanceData = Array.from({ length: 12 }, (_, i) => ({
       month: i,
       value: baseVal * (0.8 + (i * 0.04) + (Math.random() * 0.05))
    }));

    return { topPerformer, performanceData };
  }, [selectedAccount, currentAssets]);


  // --- Handlers ---

  const handleSaveAccount = () => {
    if (newAccount.name) {
      onAddAccount({
        id: `acc-${Date.now()}`,
        name: newAccount.name,
        type: newAccount.type || 'Bank',
        currency: newAccount.currency || CurrencyCode.USD,
        balance: Number(newAccount.balance) || 0,
        institution: newAccount.institution || 'Generic',
        color: newAccount.type === 'Bank' ? 'bg-blue-600' : 'bg-emerald-600'
      });
      setIsAddingAccount(false);
      setNewAccount({ type: 'Bank', currency: CurrencyCode.USD });
    }
  };

  const handleSaveAsset = () => {
    if (newAsset.name && newAsset.value && selectedAccount) {
      onAddAsset({
        id: Date.now().toString(),
        accountId: selectedAccount.id,
        name: newAsset.name,
        type: newAsset.type as any,
        value: Number(newAsset.value),
        currency: newAsset.currency as CurrencyCode,
        dayChangePct: (Math.random() * 4 - 2)
      });
      setIsAddingAsset(false);
      setNewAsset({ type: 'Stock', currency: CurrencyCode.USD });
    }
  };

  const startEditAsset = (asset: Asset) => {
    setEditingAssetId(asset.id);
    setEditValue(asset.value.toString());
  };

  const saveEditAsset = (asset: Asset) => {
    onUpdateAsset({ ...asset, value: parseFloat(editValue) || 0 });
    setEditingAssetId(null);
  };

  const handleAnalyze = async () => {
    if (!currentAssets.length) return;
    setIsAnalyzing(true);
    const result = await suggestPortfolioRebalancing(currentAssets, 'High'); 
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  // --- Chart Data Helpers ---
  
  const allocationData = useMemo(() => {
    const map: Record<string, number> = {};
    currentAssets.forEach(a => {
       map[a.type] = (map[a.type] || 0) + convertAmount(a.value, a.currency);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [currentAssets, convertAmount]);

  const assetPerfData = useMemo(() => {
     return currentAssets.map(a => ({
        name: a.name,
        change: a.dayChangePct || 0
     }));
  }, [currentAssets]);

  const COLORS = ['#3B82F6', '#10B981', '#F43F5E', '#F59E0B', '#8B5CF6'];

  return (
    <>
      <div className="flex flex-col gap-8 pb-20 md:pb-2 h-auto md:h-[calc(100vh-100px)] overflow-visible md:overflow-hidden">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div>
            <h1 className="font-serif text-4xl font-bold text-slate-900">Accounts</h1>
            <p className="text-slate-500 mt-1">Manage your banks and portfolios.</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
             <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Net Worth</p>
             <h2 className="text-3xl font-serif font-bold text-slate-900">{formatMoney(totalNetWorth)}</h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-2">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              
              {/* Add New Card */}
              <button 
                onClick={() => setIsAddingAccount(true)}
                className="min-h-[220px] border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-slate-400 hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50 transition-all group"
              >
                 <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-white flex items-center justify-center mb-3 transition-colors">
                    <Plus className="w-6 h-6" />
                 </div>
                 <span className="font-bold">Add Account</span>
              </button>

              {/* Account Cards */}
              {accounts.map((acc) => {
                 const balance = getAccountBalance(acc);
                 const isBank = acc.type === 'Bank';
                 
                 return (
                   <div 
                     key={acc.id}
                     onClick={() => setSelectedAccount(acc)}
                     className="bg-white p-6 rounded-[32px] shadow-card border border-slate-100 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[220px]"
                   >
                      {/* Background Decoration */}
                      <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 transition-transform group-hover:scale-110 ${acc.color || 'bg-slate-500'}`} />
                      
                      <div className="relative z-10">
                         <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${acc.color || 'bg-slate-500'}`}>
                               {isBank ? <Building2 size={24} /> : <Briefcase size={24} />}
                            </div>
                            <div className="p-2 bg-slate-50 rounded-full text-slate-400 group-hover:text-primary-600 transition-colors">
                               <Maximize2 size={18} />
                            </div>
                         </div>
                         <h3 className="font-bold text-xl text-slate-900 mb-1">{acc.name}</h3>
                         <p className="text-sm text-slate-500 font-medium">{acc.institution}</p>
                      </div>

                      <div className="relative z-10 mt-6">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{isBank ? 'Cash Balance' : 'Portfolio Value'}</p>
                         <p className="font-serif text-3xl font-bold text-slate-900">{formatMoney(balance, acc.currency)}</p>
                      </div>
                   </div>
                 );
              })}
           </div>
        </div>
      </div>

      {/* Add Account Modal */}
      {isAddingAccount && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl animate-slide-up">
              <h3 className="font-serif text-2xl font-bold text-slate-900 mb-6">New Account</h3>
              <div className="space-y-4">
                 <input 
                    placeholder="Account Name"
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-medium"
                    value={newAccount.name || ''}
                    onChange={e => setNewAccount({...newAccount, name: e.target.value})}
                 />
                 <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-medium"
                    value={newAccount.type}
                    onChange={e => setNewAccount({...newAccount, type: e.target.value as any})}
                 >
                    <option value="Bank">Bank Account</option>
                    <option value="Investment">Investment Portfolio</option>
                 </select>
                 {newAccount.type === 'Bank' && (
                    <input 
                       type="number"
                       placeholder="Initial Balance"
                       className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-medium"
                       value={newAccount.balance || ''}
                       onChange={e => setNewAccount({...newAccount, balance: parseFloat(e.target.value)})}
                    />
                 )}
                 <input 
                    placeholder="Institution (e.g. Chase)"
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-medium"
                    value={newAccount.institution || ''}
                    onChange={e => setNewAccount({...newAccount, institution: e.target.value})}
                 />
                 <div className="flex gap-3 mt-6">
                    <button onClick={() => setIsAddingAccount(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition">Cancel</button>
                    <button onClick={handleSaveAccount} className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg">Create</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* ================= BANK ACCOUNT DETAIL ================= */}
      <DetailPanel
         isOpen={!!selectedAccount && selectedAccount.type === 'Bank'}
         onClose={() => setSelectedAccount(null)}
         title={selectedAccount?.name || ''}
         subtitle={selectedAccount?.institution}
      >
         {selectedAccount && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Balance & Summary */}
              <div className="md:col-span-1 space-y-6">
                 <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mt-10 -mr-10"></div>
                    <p className="text-slate-300 font-medium mb-1">Available Balance</p>
                    <h2 className="text-4xl font-serif font-bold mb-8">{formatMoney(selectedAccount.balance, selectedAccount.currency)}</h2>
                    
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><ArrowDownRight size={18}/></div>
                             <span className="text-sm text-slate-300">Total In</span>
                          </div>
                          <span className="font-bold text-green-400">+{formatMoney(bankAnalytics.in)}</span>
                       </div>
                       <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-red-500/20 rounded-lg text-red-400"><ArrowUpRight size={18}/></div>
                             <span className="text-sm text-slate-300">Total Out</span>
                          </div>
                          <span className="font-bold text-red-400">-{formatMoney(bankAnalytics.out)}</span>
                       </div>
                    </div>
                 </div>
                 
                 <button 
                    onClick={() => onRemoveAccount(selectedAccount.id)}
                    className="w-full py-4 border border-dashed border-slate-300 text-slate-400 font-bold rounded-2xl hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition flex items-center justify-center gap-2"
                 >
                    <Trash2 size={18} /> Close Account
                 </button>
              </div>

              {/* Right Column: Cash Flow Chart */}
              <div className="md:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                 <h3 className="font-bold text-lg text-slate-900 mb-6">Cash Flow Activity</h3>
                 <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={bankAnalytics.flowData} barGap={8}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                          <Tooltip cursor={{fill: '#F8FAFC'}} formatter={(val: number) => formatMoney(val)} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}} />
                          <Legend />
                          <Bar dataKey="income" name="Money In" fill="#10B981" radius={[4,4,4,4]} />
                          <Bar dataKey="expense" name="Money Out" fill="#F43F5E" radius={[4,4,4,4]} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
         )}
      </DetailPanel>

      {/* ================= INVESTMENT ACCOUNT DETAIL ================= */}
      <DetailPanel
         isOpen={!!selectedAccount && selectedAccount.type === 'Investment'}
         onClose={() => setSelectedAccount(null)}
         title={selectedAccount?.name || ''}
         subtitle="Investment Portfolio Analysis"
      >
         {selectedAccount && (
           <div className="space-y-8">
              {/* Key Investment KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Assets</p>
                    <h3 className="text-2xl font-bold text-slate-900">{formatMoney(getAccountBalance(selectedAccount))}</h3>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Top Performer</p>
                    <h3 className="text-xl font-bold text-emerald-600 truncate">{investAnalytics.topPerformer?.name || '-'}</h3>
                    <p className="text-xs text-emerald-500 font-bold">+{investAnalytics.topPerformer?.dayChangePct}%</p>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Positions</p>
                    <h3 className="text-2xl font-bold text-slate-900">{currentAssets.length}</h3>
                 </div>
                 <button onClick={handleAnalyze} className="p-6 bg-slate-900 text-white rounded-[24px] shadow-lg hover:bg-slate-800 transition flex flex-col items-center justify-center gap-2 group">
                    <Sparkles className="w-6 h-6 text-yellow-400 group-hover:animate-spin" />
                    <span className="font-bold text-sm">AI Rebalance</span>
                 </button>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Historical Performance */}
                 <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm h-[320px]">
                    <h4 className="font-bold text-slate-900 mb-4">Performance Trend</h4>
                    <ResponsiveContainer width="100%" height="90%">
                       <AreaChart data={investAnalytics.performanceData}>
                          <defs>
                             <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="month" hide />
                          <Tooltip formatter={(val: number) => formatMoney(val)} />
                          <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={3} fill="url(#colorPerf)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>

                 {/* Allocation */}
                 <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm h-[320px] flex flex-col">
                    <h4 className="font-bold text-slate-900 mb-4">Asset Allocation</h4>
                    <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                             <Pie data={allocationData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {allocationData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                ))}
                             </Pie>
                             <Tooltip formatter={(val: number) => formatMoney(val)} />
                             <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                          </PieChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              </div>

              {/* Holdings Table */}
              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-900">Current Holdings</h3>
                    <button onClick={() => setIsAddingAsset(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-xs font-bold hover:bg-slate-200 transition">
                       <Plus size={14} /> Add Asset
                    </button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full">
                       <thead className="bg-slate-50">
                          <tr>
                             <th className="text-left py-3 px-4 rounded-l-xl text-xs uppercase tracking-wider text-slate-400">Asset</th>
                             <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-slate-400">Type</th>
                             <th className="text-right py-3 px-4 text-xs uppercase tracking-wider text-slate-400">Value</th>
                             <th className="text-right py-3 px-4 rounded-r-xl text-xs uppercase tracking-wider text-slate-400">24h</th>
                             <th className="text-right py-3 px-4 rounded-r-xl text-xs uppercase tracking-wider text-slate-400"></th>
                          </tr>
                       </thead>
                       <tbody>
                          {currentAssets.map(asset => (
                             <tr key={asset.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50 transition">
                                <td className="py-4 px-4 font-bold text-slate-800">{asset.name}</td>
                                <td className="py-4 px-4 text-sm text-slate-500">{asset.type}</td>
                                <td className="py-4 px-4 text-right font-serif font-bold text-slate-900">
                                   {editingAssetId === asset.id ? (
                                      <input 
                                         autoFocus
                                         className="w-24 p-1 bg-white border border-primary-200 rounded-lg text-right outline-none"
                                         value={editValue}
                                         onChange={e => setEditValue(e.target.value)}
                                         onBlur={() => saveEditAsset(asset)}
                                         onKeyDown={e => e.key === 'Enter' && saveEditAsset(asset)}
                                      />
                                   ) : (
                                      formatMoney(asset.value, asset.currency)
                                   )}
                                </td>
                                <td className={`py-4 px-4 text-right font-bold text-sm ${(asset.dayChangePct || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                   {(asset.dayChangePct || 0) > 0 ? '+' : ''}{asset.dayChangePct}%
                                </td>
                                <td className="py-4 px-4 text-right">
                                   <div className="flex justify-end gap-2">
                                      <button onClick={() => startEditAsset(asset)} className="p-2 rounded-full bg-slate-100 text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition"><Edit2 size={14} /></button>
                                      <button onClick={() => onRemoveAsset(asset.id)} className="p-2 rounded-full bg-slate-100 text-slate-500 hover:text-danger-600 hover:bg-danger-50 transition"><Trash2 size={14} /></button>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>

              {/* AI Analysis Result */}
              {analysisResult && (
                 <div className="p-6 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-[24px] border border-indigo-100 animate-slide-up">
                    <div className="flex items-start gap-4">
                       <div className="p-3 bg-white rounded-full shadow-sm text-indigo-600"><Sparkles size={20} /></div>
                       <div>
                          <h4 className="font-bold text-indigo-900 mb-2">Portfolio Insights</h4>
                          <p className="text-indigo-800 mb-4">{analysisResult.summary}</p>
                          <div className="flex gap-4">
                             <div className="bg-white px-4 py-2 rounded-xl shadow-sm">
                                <span className="text-xs font-bold text-slate-400 uppercase">Risk Level</span>
                                <p className="font-bold text-slate-800">{analysisResult.currentRisk}</p>
                             </div>
                             <div className="bg-white px-4 py-2 rounded-xl shadow-sm">
                                <span className="text-xs font-bold text-slate-400 uppercase">Target</span>
                                <p className="font-bold text-slate-800">{analysisResult.targetRisk}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              )}

              {/* Add Asset Inline Modal */}
              {isAddingAsset && (
                 <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-200 animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                       <h4 className="font-bold text-slate-900">New Asset</h4>
                       <button onClick={() => setIsAddingAsset(false)}><X size={18} className="text-slate-400" /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                       <input 
                          placeholder="Name (e.g. Apple)" 
                          className="p-3 rounded-xl border-none shadow-sm outline-none"
                          value={newAsset.name || ''}
                          onChange={e => setNewAsset({...newAsset, name: e.target.value})}
                       />
                       <select 
                          className="p-3 rounded-xl border-none shadow-sm outline-none bg-white"
                          value={newAsset.type}
                          onChange={e => setNewAsset({...newAsset, type: e.target.value as any})}
                       >
                          <option value="Stock">Stock / ETF</option>
                          <option value="Crypto">Crypto</option>
                          <option value="Real Estate">Real Estate</option>
                          <option value="Cash">Cash Equivalent</option>
                       </select>
                       <input 
                          type="number"
                          placeholder="Total Value" 
                          className="p-3 rounded-xl border-none shadow-sm outline-none"
                          value={newAsset.value || ''}
                          onChange={e => setNewAsset({...newAsset, value: parseFloat(e.target.value)})}
                       />
                    </div>
                    <button onClick={handleSaveAsset} className="mt-4 w-full py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition shadow-lg">Add to Portfolio</button>
                 </div>
              )}
           </div>
         )}
      </DetailPanel>
    </>
  );
};
