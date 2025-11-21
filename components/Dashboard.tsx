
import React, { useState, useMemo } from 'react';
import { Transaction, Asset, UserProfile } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { DetailPanel } from './DetailPanel';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, PieChart, Pie, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import { Wallet, Droplets, TrendingUp, ArrowRightLeft, PiggyBank, ArrowUpRight, Maximize2 } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  assets: Asset[];
  user: UserProfile;
}

type PanelType = 'NET_WORTH' | 'LIQUIDITY' | 'INVESTED' | 'CASH_FLOW' | 'SAVINGS' | 'ALLOCATION_DETAIL' | 'FLOW_DETAIL' | null;

export const Dashboard: React.FC<DashboardProps> = ({ transactions, assets, user }) => {
  const { formatMoney, convertAmount } = useCurrency();
  const [activePanel, setActivePanel] = useState<PanelType>(null);

  // --- Data Aggregation ---
  const netWorth = assets.reduce((sum, a) => sum + convertAmount(a.value, a.currency), 0);
  const liquidity = assets.filter(a => a.type === 'Cash').reduce((sum, a) => sum + convertAmount(a.value, a.currency), 0);
  const invested = assets.filter(a => a.type !== 'Cash').reduce((sum, a) => sum + convertAmount(a.value, a.currency), 0);
  
  const income = user.monthlyIncome;
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + convertAmount(t.amount, t.currency), 0) || (income * 0.6); 
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

  // Mock Historical Data
  const historyData = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    netWorth: netWorth * (0.8 + (i * 0.02)),
    liquidity: liquidity * (0.9 + (Math.random() * 0.2)),
    invested: invested * (0.8 + (i * 0.03)),
    income: income,
    expense: expense * (0.8 + Math.random() * 0.4),
  })), [netWorth, liquidity, invested, income, expense]);

  const allocationData = useMemo(() => {
    const map: Record<string, number> = {};
    assets.forEach(a => {
      map[a.type] = (map[a.type] || 0) + convertAmount(a.value, a.currency);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [assets, convertAmount]);

  const COLORS = ['#3B82F6', '#10B981', '#F43F5E', '#F59E0B', '#8B5CF6'];

  // --- KPI Card ---
  const KPICard = ({ title, value, icon: Icon, panel, colorClass, subtitle }: any) => (
    <div 
      onClick={() => setActivePanel(panel)}
      className="bg-white p-5 md:p-6 rounded-[24px] shadow-sm border border-slate-100 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-full relative overflow-hidden min-h-[160px]"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 transition-transform group-hover:scale-110 ${colorClass}`} />
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={`p-3 rounded-2xl bg-slate-50 text-slate-600 group-hover:text-white transition-colors ${colorClass.replace('bg-', 'group-hover:bg-')}`}>
          <Icon size={24} />
        </div>
        {/* Explicit Indicator for Popup */}
        <div className="p-1.5 rounded-full bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-primary-600 transition-colors" title="Click to view details">
           <Maximize2 size={16} />
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="font-serif text-2xl xl:text-3xl font-bold text-slate-900">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-2 font-medium">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <>
      {/* Responsive Container: Scroll on mobile, Fixed on Desktop */}
      <div className="flex flex-col gap-6 pb-20 md:pb-2 h-auto md:h-[calc(100vh-100px)] overflow-visible md:overflow-hidden">
        
        <header>
           <h1 className="font-serif text-3xl font-bold text-slate-900">Financial Overview</h1>
           <p className="text-slate-500 text-sm">Real-time snapshot of your wealth.</p>
        </header>

        {/* Top Row: KPI Cards - Stack on mobile, Grid on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 shrink-0 md:h-48 h-auto">
          <KPICard 
            title="Net Worth" 
            value={formatMoney(netWorth)} 
            icon={Wallet} 
            panel="NET_WORTH" 
            colorClass="bg-primary-500"
            subtitle="+12% vs last year"
          />
          <KPICard 
            title="Liquidity" 
            value={formatMoney(liquidity)} 
            icon={Droplets} 
            panel="LIQUIDITY" 
            colorClass="bg-cyan-500"
            subtitle="Available Cash" 
          />
          <KPICard 
            title="Invested" 
            value={formatMoney(invested)} 
            icon={TrendingUp} 
            panel="INVESTED" 
            colorClass="bg-violet-500"
            subtitle="Across all markets"
          />
          <KPICard 
            title="Net Cash Flow" 
            value={formatMoney(income - expense)} 
            icon={ArrowRightLeft} 
            panel="CASH_FLOW" 
            colorClass="bg-emerald-500" 
            subtitle="Monthly Avg"
          />
          <KPICard 
            title="Savings Rate" 
            value={`${savingsRate.toFixed(1)}%`} 
            icon={PiggyBank} 
            panel="SAVINGS" 
            colorClass="bg-rose-500"
            subtitle="Target: 20%"
          />
        </div>

        {/* Bottom Row: Charts - Stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          
          {/* Asset Allocation */}
          <div 
            onClick={() => setActivePanel('ALLOCATION_DETAIL')}
            className="bg-white p-6 rounded-[32px] shadow-card border border-slate-100 cursor-pointer hover:shadow-lg transition-all relative overflow-hidden group h-[350px] md:h-auto"
          >
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-serif text-xl font-bold text-slate-900">Asset Allocation</h3>
               <div className="p-1.5 rounded-full bg-slate-50 text-slate-400 group-hover:text-primary-600 transition-colors">
                  <Maximize2 size={18} />
               </div>
             </div>
             <div className="h-[80%] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={allocationData}
                     innerRadius="60%"
                     outerRadius="85%"
                     paddingAngle={5}
                     dataKey="value"
                     cornerRadius={8}
                   >
                     {allocationData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                     ))}
                   </Pie>
                   <Tooltip formatter={(val: number) => formatMoney(val)} contentStyle={{borderRadius: '12px', border:'none'}} />
                   <Legend verticalAlign="bottom" height={36} iconType="circle" />
                 </PieChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* Monthly Cash Flow */}
          <div 
             onClick={() => setActivePanel('FLOW_DETAIL')}
             className="lg:col-span-2 bg-white p-6 rounded-[32px] shadow-card border border-slate-100 cursor-pointer hover:shadow-lg transition-all group h-[350px] md:h-auto"
          >
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-serif text-xl font-bold text-slate-900">Cash Flow Trend</h3>
               <div className="p-1.5 rounded-full bg-slate-50 text-slate-400 group-hover:text-primary-600 transition-colors">
                  <Maximize2 size={18} />
               </div>
             </div>
             <div className="h-[85%] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historyData} barGap={8}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                     <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                     <YAxis hide />
                     <Tooltip 
                        cursor={{fill: '#F8FAFC'}}
                        formatter={(val: number) => formatMoney(val)} 
                        contentStyle={{borderRadius: '12px', border:'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}} 
                     />
                     <Bar dataKey="income" name="Income" fill="#10B981" radius={[6,6,6,6]} />
                     <Bar dataKey="expense" name="Expenses" fill="#F43F5E" radius={[6,6,6,6]} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

        </div>
      </div>

      {/* Detail Panels - Same as before */}
      <DetailPanel 
        isOpen={activePanel === 'NET_WORTH'} 
        onClose={() => setActivePanel(null)}
        title="Net Worth Analysis"
        subtitle="Comprehensive wealth tracking over time."
      >
         <div className="h-[300px] md:h-[400px] w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="colorNw" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" />
                  <YAxis domain={['auto', 'auto']} tickFormatter={(val) => formatMoney(val)} width={80} />
                  <Tooltip formatter={(val: number) => formatMoney(val)} />
                  <Area type="monotone" dataKey="netWorth" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorNw)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>
         <h3 className="font-bold text-lg mb-4">Asset Class Breakdown</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allocationData.map((item, idx) => (
               <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length]}}></div>
                     <span className="font-medium text-slate-700">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{formatMoney(item.value)}</span>
               </div>
            ))}
         </div>
      </DetailPanel>

      <DetailPanel
        isOpen={activePanel === 'LIQUIDITY'}
        onClose={() => setActivePanel(null)}
        title="Liquidity Available"
        subtitle="Cash on hand and short-term reserves."
      >
         <div className="grid grid-cols-1 gap-4">
            {assets.filter(a => a.type === 'Cash').map(asset => (
               <div key={asset.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-cyan-50 rounded-full flex items-center justify-center text-cyan-600">
                        <Droplets size={24} />
                     </div>
                     <div>
                        <h4 className="font-bold text-lg text-slate-900">{asset.name}</h4>
                        <p className="text-slate-500 text-sm">Available immediately</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="font-serif text-2xl font-bold text-slate-900">{formatMoney(asset.value, asset.currency)}</p>
                  </div>
               </div>
            ))}
         </div>
         <div className="mt-8 h-[300px]">
            <h4 className="font-bold text-lg mb-4">Forecasted Cash</h4>
            <ResponsiveContainer width="100%" height="100%">
               <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis width={80} />
                  <Tooltip formatter={(val: number) => formatMoney(val)} />
                  <Line type="monotone" dataKey="liquidity" stroke="#06B6D4" strokeWidth={3} />
               </LineChart>
            </ResponsiveContainer>
         </div>
      </DetailPanel>

      {/* Generic Panel for others */}
      <DetailPanel 
         isOpen={!!activePanel && activePanel !== 'NET_WORTH' && activePanel !== 'LIQUIDITY'}
         onClose={() => setActivePanel(null)}
         title={activePanel === 'CASH_FLOW' ? "Cash Flow Details" : activePanel === 'INVESTED' ? "Investment Performance" : "Details"}
      >
         <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-500">Detailed visualizations would appear here connecting to granular data.</p>
         </div>
      </DetailPanel>
    </>
  );
};
