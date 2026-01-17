import { GoogleGenAI } from "@google/genai";
import { Transaction, RecurringPayment } from "../types";

const SYSTEM_INSTRUCTION = `You are a savvy financial advisor for a personal finance app. 
The user tracks 'Bank Balance' and 'Cash on Hand'.
Analyze their transaction history and recurring payments.
Provide brief, actionable advice.
Focus on:
1. Spending habits (Cash vs Bank).
2. Recurring payment burden.
3. Trends in cash withdrawals.
Keep the tone helpful, encouraging, and concise. formatting in Markdown.`;

export const getFinancialInsights = async (
  transactions: Transaction[],
  recurring: RecurringPayment[]
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prepare a summarized dataset to save tokens
    const recentTransactions = transactions.slice(0, 50); // Analyze last 50
    const dataSummary = JSON.stringify({
      transactionCount: transactions.length,
      recentTransactions,
      recurringPayments: recurring,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Here is my financial data JSON: ${dataSummary}. Give me 3 bullet points of insight and 1 suggestion.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text || "No insights could be generated at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to connect to the financial advisor service. Please check your connection.";
  }
};