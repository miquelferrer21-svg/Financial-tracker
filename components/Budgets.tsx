import React, { useState } from 'react';
import { Budget, Goal, Transaction } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { generateBudgetPlan } from '../services/geminiService';
import { Sparkles, Target, Plus, X } from 'lucide-react';

interface BudgetsProps {
  budgets: Budget[];
  goals: Goal[];
  transactions: Transaction[];
  onUpdateBudgets: (budgets: Budget[]) => void;
  onAddGoal: (goal: Goal) => void;
}

export const Budgets: React.FC<BudgetsProps> = ({ budgets, goals, transactions, onUpdateBudgets, onAddGoal }) => {
  const { formatMoney, currency } = useCurrency();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({ name: '', targetAmount: 0, currentAmount: 0 });

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const suggestion = await generateBudgetPlan(transactions, currency);
    if (suggestion && suggestion.budgets) {
      const newBudgets = suggestion.budgets.map((b: any, idx: number) => ({
        id: `ai-${Date.now()}-${idx}`,
        category: b.category,
        limit: b.limit,
        spent: 0,
        currency: currency
      }));
      // Mock calculation of spent
      newBudgets.forEach((b: Budget) => {
         const spent = transactions
            .filter(t => t.type === 'expense' && t.category.toLowerCase() === b.category.toLowerCase())
            .reduce((sum, t) => sum + t.amount, 0);
         b.spent = spent;
      });
      onUpdateBudgets(newBudgets);
    }
    setIsAnalyzing(false);
  };

  const handleAddGoal = () => {
    if (newGoal.name && newGoal.targetAmount) {
      onAddGoal({
        id: Date.now().toString(),
        name: newGoal.name,
        targetAmount: Number(newGoal.targetAmount),
        currentAmount: Number(newGoal.currentAmount),
        currency: currency,
        color: '#3B82F6' // Default Blue
      });
      setShowGoalModal(false);
      setNewGoal({ name: '', targetAmount: 0, currentAmount: 0 });
    }
  };

  return (
    <div className="space-y-12 animate-fade-in">
      
      <header>
        <h1 className="font-serif text-4xl font-bold text-slate-900">Budgets & Goals</h1>
        <p className="text-slate-500 mt-2">Visualize your financial limits.</p>
      </header>

      {/* Budget Section */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-serif text-2xl text-slate-900 font-bold">Monthly Limits</h2>
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="glass-panel flex items-center gap-2 px-6 py-3 rounded-full text-primary-600 font-bold hover:bg-white transition shadow-sm"
          >
            <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'AI Suggest'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {budgets.length === 0 ? (
            <div className="col-span-2 py-16 text-center bg-white rounded-[40px] border border-slate-200 border-dashed text-slate-400">
              <p>No budgets set. Ask AI to analyze your spending.</p>
            </div>
          ) : (
            budgets.map((budget) => {
              const percent = Math.min((budget.spent / budget.limit) * 100, 100);
              const isNearLimit = percent > 85;
              const isOver = percent >= 100;
              
              return (
                <div key={budget.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-card relative overflow-hidden">
                   <div className="relative z-10">
                      <div className="flex justify-between mb-4">
                          <div className="flex items-center gap-3">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOver ? 'bg-danger-50 text-danger-500' : 'bg-primary-50 text-primary-500'}`}>
                                <Target className="w-5 h-5" />
                             </div>
                             <span className="font-bold text-slate-800 text-lg">{budget.category}</span>
                          </div>
                          <div className="text-right">
                             <span className={`font-bold block text-xl ${isOver ? 'text-danger-500' : 'text-slate-900'}`}>
                                {formatMoney(budget.spent)}
                             </span>
                             <span className="text-slate-400 text-xs font-medium">of {formatMoney(budget.limit)}</span>
                          </div>
                      </div>
                      
                      <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full shadow-sm transition-all duration-1000 ${isOver ? 'bg-danger-500' : isNearLimit ? 'bg-yellow-400' : 'bg-primary-500'}`} 
                            style={{ width: `${percent}%` }}
                          ></div>
                      </div>
                   </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Goals Section */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-serif text-2xl text-slate-900 font-bold">Dreams & Goals</h2>
          <button 
            onClick={() => setShowGoalModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-700 transition shadow-lg"
          >
            <Plus className="w-4 h-4" /> New Goal
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
           {goals.map((goal) => {
             const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
             const radius = 45;
             const circumference = 2 * Math.PI * radius;
             const offset = circumference - (percent / 100) * circumference;

             return (
               <div key={goal.id} className="bg-white border border-slate-100 p-8 rounded-[40px] flex flex-col items-center text-center relative overflow-hidden shadow-card group">
                  <div className="relative w-36 h-36 mb-6">
                     <svg className="w-full h-full transform -rotate-90">
                       <circle cx="72" cy="72" r={radius} stroke="#F1F5F9" strokeWidth="10" fill="transparent" />
                       <circle 
                         cx="72" cy="72" r={radius} 
                         stroke={goal.color} 
                         strokeWidth="10" 
                         fill="transparent" 
                         strokeDasharray={circumference}
                         strokeDashoffset={offset}
                         strokeLinecap="round"
                         className="transition-all duration-1000"
                       />
                     </svg>
                     <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-bold text-slate-900">{percent.toFixed(0)}%</span>
                     </div>
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 mb-1">{goal.name}</h3>
                  <p className="text-sm text-slate-500 font-medium mb-6">
                    {formatMoney(goal.currentAmount)} / {formatMoney(goal.targetAmount)}
                  </p>
                  <button className="w-full py-3 bg-slate-50 rounded-xl text-slate-700 font-bold text-sm hover:bg-slate-100 transition">
                    Add Funds
                  </button>
               </div>
             );
           })}
        </div>
      </section>

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-serif text-2xl font-bold text-slate-900">Create Goal</h3>
               <button onClick={() => setShowGoalModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <input 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 font-medium transition-all"
                placeholder="Goal Name (e.g. New Laptop)"
                value={newGoal.name}
                onChange={e => setNewGoal({...newGoal, name: e.target.value})}
              />
              <input 
                type="number"
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 font-medium transition-all"
                placeholder="Target Amount"
                value={newGoal.targetAmount || ''}
                onChange={e => setNewGoal({...newGoal, targetAmount: Number(e.target.value)})}
              />
              <input 
                type="number"
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 font-medium transition-all"
                placeholder="Initial Deposit"
                value={newGoal.currentAmount || ''}
                onChange={e => setNewGoal({...newGoal, currentAmount: Number(e.target.value)})}
              />
              <button onClick={handleAddGoal} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-700 transition shadow-lg">
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};