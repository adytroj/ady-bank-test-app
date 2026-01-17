import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { LayoutDashboard, Repeat, PlusCircle, Sparkles, Settings } from 'lucide-react';
import { FinancialState, Transaction, RecurringPayment, TransactionType } from './types';
import { loadData, saveData, calculateBalances } from './services/storageService';
import { Dashboard } from './components/Dashboard';
import { TransactionModal } from './components/TransactionModal';
import { RecurringPayments } from './components/RecurringPayments';
import { Advisor } from './components/Advisor';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'recurring' | 'advisor'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState<FinancialState>({
    bankBalance: 0,
    cashBalance: 0,
    transactions: [],
    recurringPayments: []
  });

  // Initial Load
  useEffect(() => {
    const loaded = loadData();
    const { bank, cash } = calculateBalances(loaded.transactions);
    setData({ ...loaded, bankBalance: bank, cashBalance: cash });
  }, []);

  // Persistence
  useEffect(() => {
    saveData(data);
  }, [data]);

  const handleAddTransaction = (tData: { amount: number; type: TransactionType; description: string; category: string; date: string; receipt?: string }) => {
    const newTx: Transaction = {
      id: uuidv4(),
      ...tData
    };
    
    const updatedTransactions = [...data.transactions, newTx];
    const { bank, cash } = calculateBalances(updatedTransactions);

    setData(prev => ({
      ...prev,
      transactions: updatedTransactions,
      bankBalance: bank,
      cashBalance: cash
    }));
  };

  const handleAddRecurring = (payment: RecurringPayment) => {
    setData(prev => ({
      ...prev,
      recurringPayments: [...prev.recurringPayments, payment]
    }));
  };

  const handleDeleteRecurring = (id: string) => {
    setData(prev => ({
      ...prev,
      recurringPayments: prev.recurringPayments.filter(p => p.id !== id)
    }));
  };

  const handleProcessRecurring = (payment: RecurringPayment) => {
    // Processing a recurring payment usually means paying it from the BANK
    handleAddTransaction({
      amount: payment.amount,
      type: TransactionType.BANK_SPEND, // Assume bills come from bank
      description: `Payment: ${payment.name}`,
      category: payment.category,
      date: new Date().toISOString()
    });
    
    // Ideally, update nextDueDate here, but keeping it simple for MVP
    alert(`Processed payment for ${payment.name}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-brand-100">
      
      {/* Main Content Area */}
      <main className="max-w-lg mx-auto min-h-screen bg-gray-50 relative shadow-2xl shadow-gray-200 overflow-hidden">
        {activeTab === 'dashboard' && <Dashboard data={data} />}
        {activeTab === 'recurring' && (
          <RecurringPayments 
            payments={data.recurringPayments} 
            onAddPayment={handleAddRecurring}
            onDeletePayment={handleDeleteRecurring}
            onProcessPayment={handleProcessRecurring}
          />
        )}
        {activeTab === 'advisor' && <Advisor data={data} />}

        {/* Floating Action Button (FAB) for adding transactions */}
        <div className="fixed bottom-24 right-6 md:absolute md:bottom-24 md:right-6 z-30">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-full p-4 shadow-lg shadow-brand-300 transition-transform active:scale-95 flex items-center justify-center"
          >
            <PlusCircle size={28} />
          </button>
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 w-full max-w-lg bg-white border-t border-gray-100 pb-safe z-40">
          <div className="flex justify-around items-center h-16">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'dashboard' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutDashboard size={22} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Home</span>
            </button>
            <button 
              onClick={() => setActiveTab('recurring')}
              className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'recurring' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Repeat size={22} strokeWidth={activeTab === 'recurring' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Recurring</span>
            </button>
            <button 
              onClick={() => setActiveTab('advisor')}
              className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'advisor' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Sparkles size={22} strokeWidth={activeTab === 'advisor' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Advisor</span>
            </button>
          </div>
        </nav>
      </main>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddTransaction} 
      />
    </div>
  );
};

export default App;