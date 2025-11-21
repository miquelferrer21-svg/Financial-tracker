import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CurrencyCode } from '../types';
import { EXCHANGE_RATES } from '../constants';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatMoney: (amount: number, fromCurrency?: CurrencyCode) => string;
  convertAmount: (amount: number, fromCurrency: CurrencyCode) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children?: ReactNode }) => {
  const [currency, setCurrency] = useState<CurrencyCode>(CurrencyCode.USD);

  const convertAmount = (amount: number, fromCurrency: CurrencyCode): number => {
    if (fromCurrency === currency) return amount;
    // Convert to USD (Base) first
    const amountInUSD = amount / EXCHANGE_RATES[fromCurrency];
    // Convert to Target
    return amountInUSD * EXCHANGE_RATES[currency];
  };

  const formatMoney = (amount: number, fromCurrency: CurrencyCode = CurrencyCode.USD) => {
    const converted = convertAmount(amount, fromCurrency);
    
    return new Intl.NumberFormat(
      currency === CurrencyCode.USD ? 'en-US' : 
      currency === CurrencyCode.EUR ? 'de-DE' :
      currency === CurrencyCode.GBP ? 'en-GB' : 'ja-JP', 
      {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: currency === CurrencyCode.JPY ? 0 : 2,
      }
    ).format(converted);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatMoney, convertAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
};