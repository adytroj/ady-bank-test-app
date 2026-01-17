import React, { useState } from 'react';
import { FinancialState } from '../types';
import { getFinancialInsights } from '../services/geminiService';
import { Button } from './Button';
import { Sparkles, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AdvisorProps {
  data: FinancialState;
}

export const Advisor: React.FC<AdvisorProps> = ({ data }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await getFinancialInsights(data.transactions, data.recurringPayments);
    setInsight(result);
    setLoading(false);
  };

  return (
    <div className="pb-20 pt-8 px-6 space-y-6 h-full min-h-[80vh]">
       <header>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="text-brand-500" /> AI Advisor
        </h1>
        <p className="text-gray-500 text-sm">Smart insights powered by Gemini</p>
      </header>

      {!insight && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
          <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center">
            <Bot size={40} className="text-brand-600" />
          </div>
          <div className="max-w-xs">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to analyze?</h3>
            <p className="text-gray-500 mb-6">
              I can scan your {data.transactions.length} transactions and {data.recurringPayments.length} recurring payments to find trends and saving opportunities.
            </p>
            <Button onClick={handleGenerate} size="lg" className="shadow-xl shadow-brand-200">
              Generate Insights
            </Button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="animate-spin text-brand-600" size={40} />
          <p className="text-gray-500 font-medium">Crunching the numbers...</p>
        </div>
      )}

      {insight && !loading && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
          <div className="prose prose-sm prose-blue max-w-none">
            <ReactMarkdown>{insight}</ReactMarkdown>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100">
             <Button variant="secondary" fullWidth onClick={handleGenerate}>
               Refresh Analysis
             </Button>
          </div>
        </div>
      )}
    </div>
  );
};