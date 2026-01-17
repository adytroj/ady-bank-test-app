import React from 'react';
import { FinancialState, TransactionType } from '../types';
import { ArrowUpCircle, ArrowDownCircle, Wallet, CreditCard, TrendingUp, Banknote, Image as ImageIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardProps {
  data: FinancialState;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // Prepare chart data (Last 7 days balance trend is a bit complex without daily snapshots, 
  // so let's show spending flow or just recent transaction amounts for visual flare)
  const chartData = data.transactions.slice(-10).map((t, i) => ({
    name: i.toString(),
    amount: t.amount,
    type: t.type
  }));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="px-6 pt-8 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-500 text-sm">Your financial health at a glance</p>
      </header>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6">
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-6 text-white shadow-lg shadow-brand-200">
          <div className="flex items-center gap-3 mb-4 opacity-90">
            <CreditCard size={20} />
            <span className="text-sm font-medium">Bank Balance</span>
          </div>
          <div className="text-3xl font-bold tracking-tight">
            {formatCurrency(data.bankBalance)}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-brand-100 bg-brand-800/20 w-fit px-2 py-1 rounded-lg">
            <ArrowUpCircle size={14} />
            <span>Deposits tracked</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-500">
            <Wallet size={20} className="text-orange-500" />
            <span className="text-sm font-medium">Cash on Hand</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 tracking-tight">
            {formatCurrency(data.cashBalance)}
          </div>
           <div className="mt-4 flex items-center gap-2 text-xs text-orange-600 bg-orange-50 w-fit px-2 py-1 rounded-lg">
            <ArrowDownCircle size={14} />
            <span>Liquid cash available</span>
          </div>
        </div>
      </div>

      {/* Mini Chart */}
      <div className="px-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
               <TrendingUp size={16} /> Recent Activity
             </h3>
          </div>
          <div className="h-40 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`$${value}`, 'Amount']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorAmt)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No data to display yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent List */}
      <div className="px-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Recent Transactions</h3>
        <div className="space-y-3">
          {data.transactions.slice().reverse().slice(0, 5).map((t) => (
            <div key={t.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  t.type === TransactionType.DEPOSIT ? 'bg-green-100 text-green-600' :
                  t.type === TransactionType.WITHDRAWAL ? 'bg-orange-100 text-orange-600' :
                  t.type === TransactionType.CASH_SPEND ? 'bg-red-100 text-red-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {t.type === TransactionType.DEPOSIT && <Banknote size={18} />}
                  {t.type === TransactionType.WITHDRAWAL && <ArrowDownCircle size={18} />}
                  {t.type === TransactionType.CASH_SPEND && <Wallet size={18} />}
                  {t.type === TransactionType.BANK_SPEND && <CreditCard size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{t.description}</p>
                    {t.receipt && <ImageIcon size={14} className="text-gray-400" />}
                  </div>
                  <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`font-bold ${
                t.type === TransactionType.DEPOSIT ? 'text-green-600' : 'text-gray-900'
              }`}>
                {t.type === TransactionType.DEPOSIT ? '+' : '-'}{formatCurrency(t.amount)}
              </span>
            </div>
          ))}
          {data.transactions.length === 0 && (
            <p className="text-center text-gray-400 py-8">No transactions found.</p>
          )}
        </div>
      </div>
    </div>
  );
};