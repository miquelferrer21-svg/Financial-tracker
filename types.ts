
export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY'
}

export type RiskProfile = 'Low' | 'Medium' | 'High';

export type DateRange = 'Day' | 'Month' | 'Year' | 'Total' | 'Custom';

export interface CustomDateRange {
  start: string; 
  end: string;
}

export interface UserProfile {
  name: string;
  mainCurrency: CurrencyCode;
  initialBalance: number;
  monthlyIncome: number;
  riskProfile: RiskProfile;
  financialGoals: string[];
  isOnboarded: boolean;
}

export interface Account {
  id: string;
  name: string;
  type: 'Bank' | 'Investment';
  currency: CurrencyCode;
  balance: number; // Current cash balance for banks
  institution?: string;
  color?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: CurrencyCode;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
  accountId?: string; // Optional link to account
}

export interface Asset {
  id: string;
  accountId: string; // Link to Investment Account
  name: string;
  type: 'Stock' | 'Crypto' | 'Real Estate' | 'Cash';
  value: number;
  currency: CurrencyCode;
  dayChangePct?: number;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  currency: CurrencyCode;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: CurrencyCode;
  color: string;
}

export interface SpendingInsight {
  title: string;
  description: string;
  type: 'warning' | 'success' | 'info';
  amount?: number;
}

export interface SpendingAnalysis {
  insights: SpendingInsight[];
  score: number;
  summary: string;
}

export interface PortfolioAction {
  asset: string;
  action: 'buy' | 'sell' | 'hold';
  reason: string;
}

export interface PortfolioAnalysis {
  currentRisk: string;
  targetRisk: string;
  suggestions: PortfolioAction[];
  summary: string;
}
