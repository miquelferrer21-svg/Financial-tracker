import { CurrencyCode } from './types';

// Mock Exchange Rates (Base: USD)
export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  [CurrencyCode.USD]: 1,
  [CurrencyCode.EUR]: 0.92,
  [CurrencyCode.GBP]: 0.79,
  [CurrencyCode.JPY]: 150.5,
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  [CurrencyCode.USD]: '$',
  [CurrencyCode.EUR]: '€',
  [CurrencyCode.GBP]: '£',
  [CurrencyCode.JPY]: '¥',
};

export const CATEGORIES = [
  { name: 'Food', color: '#F87171' }, // Soft Red
  { name: 'Transport', color: '#60A5FA' }, // Soft Blue
  { name: 'Housing', color: '#3B82F6' }, // Primary Blue
  { name: 'Entertainment', color: '#34D399' }, // Soft Green
  { name: 'Shopping', color: '#F472B6' }, // Pink (Accent)
  { name: 'Income', color: '#10B981' }, // Green
  { name: 'Investment', color: '#818CF8' }, // Indigo
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview', icon: 'LayoutDashboard' },
  { id: 'spending', label: 'Spending', icon: 'PieChart' },
  { id: 'investments', label: 'Investments', icon: 'TrendingUp' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
];

export const RISK_PROFILES = [
  { id: 'Low', label: 'Conservative', description: 'Preserve wealth. Low volatility.' },
  { id: 'Medium', label: 'Balanced', description: 'Growth with moderate risk.' },
  { id: 'High', label: 'Aggressive', description: 'Max growth. High volatility.' },
];

export const COMMON_GOALS = [
  'Retirement', 'Home Purchase', 'Travel', 'Emergency Fund', 'Debt Free', 'Car'
];