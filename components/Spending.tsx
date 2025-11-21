
import React, { useState, useMemo } from 'react';
import { Transaction, Budget, SpendingAnalysis } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { DetailPanel } from './DetailPanel';
import { analyzeSpendingPatterns } from '../services/geminiService';
import { ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend, Tooltip, CartesianGrid, XAxis } from 'recharts';
import { Calendar, Store, Flame, CreditCard, Sparkles, Maximize2, ArrowUpRight, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';

interface SpendingProps {
  transactions: Transaction[];
  budgets: Budget[];
  onUpdateBudgets: (budgets: Budget[]) => void;
}

export const Spending: React.FC<SpendingProps> = ({ transactions, budgets, onUpdateBudgets }) => {
  const { formatMoney, convertAmount } = useCurrency();
  const [activePanel, setActivePanel] = useState<string | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SpendingAnalysis | null>(null);

  const handleAnalyzePatterns = async () => {
    setIsAnalyzing(true);
    setActivePanel('AI_ANALYSIS'); 
    const result = await analyzeSpendingPatterns(transactions);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const totalSpent = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + convertAmount(t.amount, t.currency), 0);

  const totalBudget = budgets.reduce((sum, b) => sum + convertAmount(b.limit, b.currency), 0);
  const remainingBudget = Math.max(0, totalBudget - totalSpent);
  
  const dailySpending = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
        const day = new Date(t.date).getDate();
        map[day] = (map[day] || 0) + convertAmount(t.amount, t.currency);
    });
    return Object.entries(map).map(([day, amount]) => ({ day, amount }));
  }, [transactions, convertAmount]);

  const avgDailySpend = totalSpent / (dailySpending.length || 1);
  
  const largestTx = transactions
    .filter(t => t.type === 'expense')
    .sort((a, b) => convertAmount(b.amount, b.currency) - convertAmount(a.amount, a.currency))[0];

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + convertAmount(t.amount, t.currency);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions, convertAmount]);

  const COLORS = ['#3B82F6', '#10B981', '#F43F5E', '#F59E0B', '#8B5CF6', '#EC4899'];

  const SpendingCard = ({ title, value, icon: Icon, panel, subtitle, colorClass }: any) => (
    <div 
      onClick={() => setActivePanel(panel)}
      className="bg-white p-5 md:p-6 rounded-[24px] shadow-sm border border-slate-100 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden h-full min-h-[160px]"
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 ${colorClass}`}></div>
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={`p-3 rounded-2xl bg-slate-50 text-slate-600 group-hover:text-white transition-colors ${colorClass.replace('bg-', 'group-hover:bg-')}`}>
          <Icon size={24} />
        </div>
        <div className="p-1.5 rounded-full bg-slate-50 text-slate-400 group-hover:text-primary-600 transition-colors" title="Expand Details">
           <Maximize2 size={16} />
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="font-serif text-2xl xl:text-3xl font-bold text-slate-900">{value}</h3>
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col gap-6 pb-20 md:pb-2 h-auto md:h-[calc(100vh-100px)] overflow-visible md:overflow-hidden">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div>
            <h1 className="font-serif text-3xl font-bold text-slate-900">Spending Analytics</h1>
            <p className="text-slate-500 text-sm">Detailed breakdown of your expenses.</p>
          </div>
          <button 
            onClick={handleAnalyzePatterns} 
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-slate-800 transition w-full md:w-auto justify-center"
          >
            <Sparkles size={16} /> Analyze Patterns
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 md:h-44 h-auto">
           <SpendingCard 
             title="Remaining Budget" 
             value={formatMoney(remainingBudget)} 
             icon={CreditCard} 
             panel="BUDGET" 
             subtitle={`${((remainingBudget/totalBudget)*100).toFixed(0)}% left`} 
             colorClass="bg-emerald-500"
           />
           <SpendingCard 
             title="Total Spent" 
             value={formatMoney(totalSpent)} 
             icon={Store} 
             panel="TOTAL_SPENT" 
             subtitle="This Month" 
             colorClass="bg-rose-500"
           />
           <SpendingCard 
             title="Avg Daily Spend" 
             value={formatMoney(avgDailySpend)} 
             icon={Calendar} 
             panel="DAILY_AVG" 
             subtitle="Trending Stable" 
             colorClass="bg-blue-500"
           />
           <SpendingCard 
             title="Largest Tx" 
             value={largestTx ? formatMoney(largestTx.amount, largestTx.currency) : '-'} 
             icon={Flame} 
             panel="LARGEST_TX" 
             subtitle={largestTx?.description || 'None'} 
             colorClass="bg-amber-500"
           />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
           
           {/* Category Pie */}
           <div 
              onClick={() => setActivePanel('CATEGORY_DETAIL')}
              className="bg-white p-6 rounded-[32px] shadow-card border border-slate-100 cursor-pointer hover:shadow-lg transition-all group h-[350px] md:h-auto"
           >
              <div className="flex justify-between items-center mb-2">
                 <h3 className="font-serif text-xl font-bold text-slate-900">By Category</h3>
                 <div className="p-1.5 rounded-full bg-slate-50 text-slate-400 group-hover:text-primary-600 transition-colors">
                    <Maximize2 size={18} />
                 </div>
              </div>
              <div className="h-[90%] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {categoryData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                          ))}
                       </Pie>
                       <Tooltip formatter={(val: number) => formatMoney(val)} contentStyle={{borderRadius: '12px'}} />
                       <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Daily Line */}
           <div 
              onClick={() => setActivePanel('DAILY_DETAIL')}
              className="bg-white p-6 rounded-[32px] shadow-card border border-slate-100 cursor-pointer hover:shadow-lg transition-all group h-[350px] md:h-auto"
           >
              <div className="flex justify-between items-center mb-2">
                 <h3 className="font-serif text-xl font-bold text-slate-900">Daily Trend</h3>
                 <div className="p-1.5 rounded-full bg-slate-50 text-slate-400 group-hover:text-primary-600 transition-colors">
                    <Maximize2 size={18} />
                 </div>
              </div>
              <div className="h-[90%] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailySpending}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                       <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{fill:'#94a3b8'}} />
                       <Tooltip formatter={(val: number) => formatMoney(val)} contentStyle={{borderRadius: '12px'}} />
                       <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} dot={false} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Budget Gauge */}
           <div 
              onClick={() => setActivePanel('BUDGET_DETAIL')}
              className="bg-white p-6 rounded-[32px] shadow-card border border-slate-100 cursor-pointer hover:shadow-lg transition-all group h-[350px] md:h-auto"
           >
              <div className="flex justify-between items-center mb-2">
                 <h3 className="font-serif text-xl font-bold text-slate-900">Budget Usage</h3>
                 <div className="p-1.5 rounded-full bg-slate-50 text-slate-400 group-hover:text-primary-600 transition-colors">
                    <Maximize2 size={18} />
                 </div>
              </div>
              <div className="h-[90%] w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                       cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" barSize={20} 
                       data={[{ name: 'Used', value: (totalSpent/totalBudget)*100, fill: (totalSpent/totalBudget) > 0.9 ? '#EF4444' : '#10B981' }]} 
                       startAngle={180} endAngle={0}
                    >
                       <RadialBar label={false} background dataKey="value" cornerRadius={10} />
                       <Tooltip formatter={(val:number) => `${val.toFixed(1)}%`} cursor={false} />
                    </RadialBarChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center mt-10 pointer-events-none">
                    <span className="text-4xl font-bold text-slate-900">{((totalSpent/totalBudget)*100).toFixed(0)}%</span>
                    <span className="text-xs text-slate-400 font-bold uppercase">Used</span>
                 </div>
              </div>
           </div>

        </div>
      </div>

      {/* --- Contextual AI Panel --- */}
      <DetailPanel isOpen={activePanel === 'AI_ANALYSIS'} onClose={() => setActivePanel(null)} title="AI Spending Analysis">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center h-64">
             <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
             <p className="text-slate-500 font-medium">Analyzing your transaction patterns...</p>
          </div>
        ) : analysisResult ? (
          <div className="space-y-8 animate-fade-in">
             {/* Score Card */}
             <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-8 text-white flex justify-between items-center">
                <div>
                   <h4 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">Financial Discipline Score</h4>
                   <div className="text-5xl font-serif font-bold">{analysisResult.score}<span className="text-xl text-slate-500">/100</span></div>
                </div>
                <div className="max-w-md text-right">
                   <p className="text-slate-300 text-lg leading-relaxed">"{analysisResult.summary}"</p>
                </div>
             </div>

             {/* Insights Grid */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analysisResult.insights.map((insight, idx) => (
                   <div key={idx} className={`p-6 rounded-[24px] border ${
                      insight.type === 'warning' ? 'bg-danger-50 border-danger-100' :
                      insight.type === 'success' ? 'bg-success-50 border-success-100' :
                      'bg-primary-50 border-primary-100'
                   }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${
                         insight.type === 'warning' ? 'bg-danger-100 text-danger-600' :
                         insight.type === 'success' ? 'bg-success-100 text-success-600' :
                         'bg-primary-100 text-primary-600'
                      }`}>
                         {insight.type === 'warning' ? <AlertTriangle size={20} /> :
                          insight.type === 'success' ? <CheckCircle size={20} /> : <Info size={20} />}
                      </div>
                      <h5 className="font-bold text-slate-900 text-lg mb-2">{insight.title}</h5>
                      <p className="text-slate-600 text-sm leading-relaxed">{insight.description}</p>
                   </div>
                ))}
             </div>
          </div>
        ) : (
           <p className="text-center text-slate-500 py-10">Unable to generate analysis at this time.</p>
        )}
      </DetailPanel>

      <DetailPanel isOpen={activePanel === 'CATEGORY_DETAIL'} onClose={() => setActivePanel(null)} title="Spending Details">
         <div className="space-y-6">
            <h4 className="font-bold text-lg">Recent Transactions</h4>
            <table className="w-full">
               <thead className="bg-slate-50">
                  <tr>
                     <th className="text-left py-3 px-4 rounded-l-xl">Description</th>
                     <th className="text-left py-3 px-4">Category</th>
                     <th className="text-right py-3 px-4 rounded-r-xl">Amount</th>
                  </tr>
               </thead>
               <tbody>
                  {transactions.filter(t => t.type === 'expense').slice(0,10).map(t => (
                     <tr key={t.id} className="border-b border-slate-50 last:border-none">
                        <td className="py-4 px-4 font-medium text-slate-800">{t.description}</td>
                        <td className="py-4 px-4 text-slate-500">{t.category}</td>
                        <td className="py-4 px-4 text-right font-bold text-slate-900">{formatMoney(t.amount, t.currency)}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </DetailPanel>
    </>
  );
};
