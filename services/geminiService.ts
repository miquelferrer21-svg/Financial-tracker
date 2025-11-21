
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, CurrencyCode, Asset, SpendingAnalysis, PortfolioAnalysis } from "../types";

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const parseTransactionFromText = async (
  text: string,
  userCurrency: string
): Promise<any> => {
  const ai = getAI();
  
  const prompt = `
    Extract transaction details from this text: "${text}".
    The user's home currency is ${userCurrency}.
    If no currency is specified in the text, assume ${userCurrency}.
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["income", "expense"] },
            date: { type: Type.STRING, description: "ISO Date string" }
          },
          required: ["amount", "category", "description", "type"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Text Parse Error:", error);
    return null;
  }
};

export const parseReceiptImage = async (
  base64Image: string,
  mimeType: string
): Promise<any> => {
  const ai = getAI();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: "Analyze this receipt. Extract the total amount, merchant name (as description), category, and date."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            date: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Image Parse Error:", error);
    return null;
  }
};

export const generateBudgetPlan = async (
  transactions: Transaction[],
  currency: CurrencyCode
): Promise<any> => {
  const ai = getAI();
  
  const spendingSummary: Record<string, number> = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    spendingSummary[t.category] = (spendingSummary[t.category] || 0) + t.amount;
  });

  const prompt = `
    Analyze this monthly spending summary: ${JSON.stringify(spendingSummary)}.
    Currency: ${currency}.
    Suggest a realistic budget limit for 3 key categories.
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            budgets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  limit: { type: Type.NUMBER },
                  reason: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    return null;
  }
};

// --- NEW CONTEXTUAL AI FUNCTIONS ---

export const analyzeSpendingPatterns = async (
  transactions: Transaction[]
): Promise<SpendingAnalysis | null> => {
  const ai = getAI();
  
  // Simplify data for prompt to save tokens
  const simplifiedTx = transactions.slice(0, 50).map(t => ({
    amount: t.amount,
    category: t.category,
    date: t.date,
    desc: t.description
  }));

  const prompt = `
    Analyze these recent transactions. Identify 3 key insights (e.g., high recurring costs, increasing trends in a specific category, or unusual large purchases).
    Give a health score (0-100) based on spending discipline.
    Write a 1 sentence summary.
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['warning', 'success', 'info'] },
                  amount: { type: Type.NUMBER }
                }
              }
            },
            score: { type: Type.NUMBER },
            summary: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Spending Analysis Error:", error);
    return null;
  }
};

export const suggestPortfolioRebalancing = async (
  assets: Asset[],
  riskProfile: string
): Promise<PortfolioAnalysis | null> => {
  const ai = getAI();

  const portfolioSummary = assets.map(a => ({
    name: a.name,
    type: a.type,
    value: a.value
  }));

  const prompt = `
    Analyze this investment portfolio. The user's risk profile is ${riskProfile}.
    Identify if the portfolio is consistent with the risk profile.
    Suggest 3 actions (buy/sell/hold) to rebalance or optimize.
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            currentRisk: { type: Type.STRING },
            targetRisk: { type: Type.STRING },
            summary: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  asset: { type: Type.STRING },
                  action: { type: Type.STRING, enum: ['buy', 'sell', 'hold'] },
                  reason: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Portfolio Rebalance Error:", error);
    return null;
  }
};
